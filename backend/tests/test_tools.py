import pytest

from app.services.tools import (
    account_info,
    escalate_to_human,
    execute_tool,
    transaction_lookup,
)


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
