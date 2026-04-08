"""Tool calling service for LLM agent tools."""

import json
import re
from pathlib import Path
from typing import Any

from app.services.email import send_escalation_email

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_json(filename: str) -> Any:  # noqa: ANN401
    return json.loads((_DATA_DIR / filename).read_text())


def transaction_lookup(query: str) -> str:
    """Search transactions by merchant name, amount, or description."""
    transactions = _load_json("transactions.json")
    query_lower = query.lower()

    # Extract numeric amounts from query (handles "$47.99", "47.99", etc.)
    amounts_in_query = re.findall(r"\d+\.\d+", query_lower)

    matches = [
        txn
        for txn in transactions
        if query_lower in txn["merchant"].lower()
        or query_lower in txn.get("description", "").lower()
        or any(amt in str(abs(txn["amount"])) for amt in amounts_in_query)
    ]

    if not matches:
        return "No transactions found matching your query."

    lines = []
    for txn in matches[:5]:
        lines.append(
            f"- {txn['date']} | {txn['merchant']} | "
            f"${abs(txn['amount']):.2f} | {txn['status']}"
        )
    return "\n".join(lines)


def recent_transactions(limit: int = 5) -> str:
    """Return the most recent transactions sorted by date descending."""
    transactions = _load_json("transactions.json")
    sorted_txns = sorted(transactions, key=lambda t: t["date"], reverse=True)

    lines = []
    for txn in sorted_txns[:limit]:
        lines.append(
            f"- {txn['date']} | {txn['merchant']} | "
            f"${abs(txn['amount']):.2f} | {txn['status']}"
        )
    return "\n".join(lines)


def spending_summary() -> str:
    """Aggregate spending: total, count, and top 3 categories by amount."""
    transactions = _load_json("transactions.json")

    # Spending = negative-amount transactions only (income excluded)
    spending = [t for t in transactions if t["amount"] < 0]
    total = sum(abs(t["amount"]) for t in spending)
    count = len(spending)

    # Top 3 categories by absolute amount spent
    by_category: dict[str, float] = {}
    for t in spending:
        by_category[t["category"]] = by_category.get(t["category"], 0.0) + abs(
            t["amount"]
        )
    top_three = sorted(by_category.items(), key=lambda kv: kv[1], reverse=True)[:3]

    lines = [f"Total spent: ${total:,.2f} across {count} transactions"]
    lines.append("Top categories:")
    for category, amount in top_three:
        lines.append(f"- {category}: ${amount:,.2f}")
    return "\n".join(lines)


def account_info() -> str:
    """Return the current user's account information."""
    account = _load_json("account.json")
    return (
        f"Name: {account['name']}\n"
        f"Account: {account['account_number']}\n"
        f"Tier: {account['tier']}\n"
        f"Balance: ${account['balance']:,.2f}\n"
        f"Cards: {len(account['cards'])} active"
    )


def escalate_to_human(reason: str) -> str:
    """Escalate the conversation to a human agent and send notification email."""
    send_escalation_email(reason)
    return (
        f"I've escalated this to our support team. "
        f"Reason: {reason}. "
        f"A human agent will reach out within 24 hours."
    )


def execute_tool(name: str, tool_input: dict[str, Any]) -> str:
    """Dispatch a tool call to the correct function."""
    if name == "transaction_lookup":
        return transaction_lookup(tool_input["query"])
    if name == "recent_transactions":
        limit = tool_input.get("limit", 5)
        return recent_transactions(limit=int(limit))
    if name == "spending_summary":
        return spending_summary()
    if name == "account_info":
        return account_info()
    if name == "escalate_to_human":
        return escalate_to_human(tool_input["reason"])

    msg = f"Unknown tool: {name}"
    raise ValueError(msg)
