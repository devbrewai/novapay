import json
from pathlib import Path

import pytest

from app.services.tools import (
    account_info,
    escalate_to_human,
    execute_tool,
    recent_transactions,
    spending_summary,
    transaction_lookup,
)

_DATA_DIR = Path(__file__).resolve().parent.parent / "app" / "data"


def test_transaction_lookup_by_merchant() -> None:
    result = transaction_lookup("Whole Foods")
    assert "Whole Foods" in result
    assert "$" in result


def test_transaction_lookup_by_amount() -> None:
    result = transaction_lookup("87.43")
    assert "87.43" in result


def test_transaction_lookup_no_match() -> None:
    result = transaction_lookup("nonexistent_merchant_xyz")
    assert result == "No transactions found matching your query."


def test_transaction_lookup_limits_to_five() -> None:
    # "completed" should match many descriptions
    result = transaction_lookup("completed")
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    assert len(lines) <= 5


def test_recent_transactions_default_limit() -> None:
    result = recent_transactions()
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    assert len(lines) == 5
    for line in lines:
        # Format: "- YYYY-MM-DD | merchant | $amount | status"
        assert line.count("|") == 3
        assert "$" in line


def test_recent_transactions_custom_limit() -> None:
    result = recent_transactions(limit=3)
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    assert len(lines) == 3


def test_recent_transactions_sorted_descending_by_date() -> None:
    result = recent_transactions(limit=10)
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    # Extract date (second token after the leading "- ")
    dates = [line.split("|")[0].strip("- ").strip() for line in lines]
    assert dates == sorted(dates, reverse=True)


def test_execute_tool_recent_transactions() -> None:
    result = execute_tool("recent_transactions", {})
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    assert len(lines) == 5


def test_execute_tool_recent_transactions_with_limit() -> None:
    result = execute_tool("recent_transactions", {"limit": 2})
    lines = [line for line in result.strip().split("\n") if line.startswith("-")]
    assert len(lines) == 2


def test_spending_summary_returns_total_and_count() -> None:
    result = spending_summary()
    assert "Total spent:" in result
    assert "$" in result
    assert "transactions" in result


def test_spending_summary_lists_top_categories() -> None:
    result = spending_summary()
    assert "Top categories:" in result
    category_lines = [
        line for line in result.strip().split("\n") if line.startswith("- ")
    ]
    assert len(category_lines) == 3


def test_spending_summary_excludes_income() -> None:
    transactions = json.loads((_DATA_DIR / "transactions.json").read_text())
    expected_total = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)

    result = spending_summary()
    # First line is "Total spent: $X,XXX.XX across N transactions"
    first_line = result.split("\n")[0]
    assert f"${expected_total:,.2f}" in first_line


def test_execute_tool_spending_summary() -> None:
    result = execute_tool("spending_summary", {})
    assert "Total spent:" in result
    assert "Top categories:" in result


def test_account_info_returns_profile() -> None:
    result = account_info()
    assert "Alex Rivera" in result
    assert "Premium" in result
    assert "12,847.32" in result


def test_escalate_to_human() -> None:
    result = escalate_to_human("account closure request")
    assert "escalated" in result.lower()
    assert "account closure request" in result


def test_execute_tool_transaction_lookup() -> None:
    result = execute_tool("transaction_lookup", {"query": "Uber"})
    assert "Uber" in result


def test_execute_tool_account_info() -> None:
    result = execute_tool("account_info", {})
    assert "Alex Rivera" in result


def test_execute_tool_escalate() -> None:
    result = execute_tool("escalate_to_human", {"reason": "dispute"})
    assert "dispute" in result


def test_execute_tool_unknown_raises() -> None:
    with pytest.raises(ValueError, match="Unknown tool"):
        execute_tool("unknown_tool", {})
