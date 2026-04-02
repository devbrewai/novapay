"""Tool calling service for LLM agent tools."""

import json
from pathlib import Path
from typing import Any

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _load_json(filename: str) -> Any:  # noqa: ANN401
    return json.loads((_DATA_DIR / filename).read_text())


def transaction_lookup(query: str) -> str:
    """Search transactions by merchant name, amount, or description."""
    transactions = _load_json("transactions.json")
    query_lower = query.lower()

    matches = [
        txn
        for txn in transactions
        if query_lower in txn["merchant"].lower()
        or query_lower in txn.get("description", "").lower()
        or query_lower in str(txn["amount"])
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
    """Escalate the conversation to a human agent."""
    return (
        f"I've escalated this to our support team. "
        f"Reason: {reason}. "
        f"A human agent will reach out within 24 hours."
    )


def execute_tool(name: str, tool_input: dict[str, Any]) -> str:
    """Dispatch a tool call to the correct function."""
    if name == "transaction_lookup":
        return transaction_lookup(tool_input["query"])
    if name == "account_info":
        return account_info()
    if name == "escalate_to_human":
        return escalate_to_human(tool_input["reason"])

    msg = f"Unknown tool: {name}"
    raise ValueError(msg)
