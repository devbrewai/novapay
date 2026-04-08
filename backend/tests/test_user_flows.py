"""End-to-end tests for the four user flows.

Each test exercises the full orchestration pipeline (orchestrate_chat),
mocking only external API boundaries (retrieve + the Anthropic stream).
Real tool execution runs against actual data files.
"""

from unittest.mock import Mock, patch

import anthropic.types

from app.services.chat_orchestrator import orchestrate_chat
from app.services.conversation import Conversation
from app.types import RetrievalResult
from tests._anthropic_stream import make_anthropic_client


def _make_text_response(text: str) -> anthropic.types.Message:
    return anthropic.types.Message(
        id="msg_test",
        type="message",
        role="assistant",
        model="claude-sonnet-4-6",
        content=[anthropic.types.TextBlock(type="text", text=text)],
        stop_reason="end_turn",
        usage=anthropic.types.Usage(input_tokens=10, output_tokens=5),
    )


def _make_tool_use_response(
    tool_name: str, tool_input: dict[str, object], tool_id: str = "tool_1"
) -> anthropic.types.Message:
    return anthropic.types.Message(
        id="msg_test",
        type="message",
        role="assistant",
        model="claude-sonnet-4-6",
        content=[
            anthropic.types.ToolUseBlock(
                type="tool_use",
                id=tool_id,
                name=tool_name,
                input=tool_input,
            )
        ],
        stop_reason="tool_use",
        usage=anthropic.types.Usage(input_tokens=10, output_tokens=5),
    )


# -- Flow 1: Knowledge Base Q&A (international transfer fees) -----------------


@patch("app.services.chat_orchestrator.retrieve")
def test_flow_kb_qa_transfer_fees(mock_retrieve: Mock) -> None:
    """User asks about international transfer fees.
    Agent retrieves from KB and answers with specific fee info."""
    mock_retrieve.return_value = [
        RetrievalResult(
            text=(
                "Standard accounts: 1.5% fee on the transfer amount, "
                "with a minimum fee of $5. Premium accounts: 1.0% fee."
            ),
            source="transfer-fees.md",
            distance=0.3,
        )
    ]
    client = make_anthropic_client(
        _make_text_response(
            "International transfers have a flat 1.5% fee on Standard accounts "
            "(min $5). Premium accounts get a reduced 1.0% rate. "
            "Would you like to start a transfer?"
        )
    )

    conv = Conversation()
    events = list(
        orchestrate_chat(
            "What's the fee for international transfers?",
            conv,
            client,
            Mock(),
            Mock(),
        )
    )

    event_types = [e["type"] for e in events]
    assert "text_delta" in event_types
    assert "done" in event_types
    assert "tool_use" not in event_types

    messages = conv.get_messages()
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
    assert "1.5%" in messages[1]["content"]


# -- Flow 2: Transaction Lookup ($47.99 unrecognized charge) ------------------


@patch("app.services.chat_orchestrator.retrieve")
def test_flow_transaction_lookup_unrecognized_charge(
    mock_retrieve: Mock,
) -> None:
    """User reports unrecognized $47.99 charge.
    Agent uses transaction_lookup tool, finds StreamVault Inc."""
    mock_retrieve.return_value = []
    client = make_anthropic_client(
        _make_tool_use_response("transaction_lookup", {"query": "47.99"}),
        _make_text_response(
            "I found that charge — it's $47.99 from StreamVault Inc on March 16 "
            "for an annual subscription. Does this look familiar, or would you "
            "like to dispute it?"
        ),
    )

    conv = Conversation()
    events = list(
        orchestrate_chat(
            "I see a charge for $47.99 that I don't recognize",
            conv,
            client,
            Mock(),
            Mock(),
        )
    )

    event_types = [e["type"] for e in events]
    assert "tool_use" in event_types
    assert "tool_result" in event_types
    assert "text_delta" in event_types
    assert "done" in event_types

    tool_result = next(e for e in events if e["type"] == "tool_result")
    assert "StreamVault" in tool_result["result"]
    assert "47.99" in tool_result["result"]


# -- Flow 3: Escalation (account closure) ------------------------------------


@patch("app.services.tools.send_escalation_email")
@patch("app.services.chat_orchestrator.retrieve")
def test_flow_escalation_account_closure(mock_retrieve: Mock, mock_email: Mock) -> None:
    """User wants to close account.
    Agent uses escalate_to_human tool to hand off."""
    mock_retrieve.return_value = [
        RetrievalResult(
            text="Account closures require verification from our team.",
            source="account-closing.md",
            distance=0.4,
        )
    ]
    mock_email.return_value = True

    client = make_anthropic_client(
        _make_tool_use_response(
            "escalate_to_human",
            {"reason": "Customer requesting account closure"},
        ),
        _make_text_response(
            "I've connected you with a specialist who can walk you through "
            "the account closure process. They'll reach out within 24 hours."
        ),
    )

    conv = Conversation()
    events = list(
        orchestrate_chat(
            "I want to close my account",
            conv,
            client,
            Mock(),
            Mock(),
        )
    )

    event_types = [e["type"] for e in events]
    assert "tool_use" in event_types
    assert "tool_result" in event_types
    assert "text_delta" in event_types
    assert "done" in event_types

    tool_result = next(e for e in events if e["type"] == "tool_result")
    assert "escalated" in tool_result["result"].lower()


# -- Flow 4: Onboarding Help (direct deposit setup) --------------------------


@patch("app.services.chat_orchestrator.retrieve")
def test_flow_onboarding_direct_deposit(mock_retrieve: Mock) -> None:
    """User asks how to set up direct deposit.
    Agent retrieves from KB with step-by-step instructions."""
    mock_retrieve.return_value = [
        RetrievalResult(
            text=(
                "1. Go to Settings > Payments > Direct Deposit\n"
                "2. You'll see your Nova routing number and account number\n"
                "3. Share these details with your employer's payroll department"
            ),
            source="feature-direct-deposit.md",
            distance=0.25,
        )
    ]
    client = make_anthropic_client(
        _make_text_response(
            "Here's how to set up direct deposit:\n"
            "1. Go to Settings > Payments > Direct Deposit\n"
            "2. You'll find your routing number and account number\n"
            "3. Share these with your employer's payroll department"
        )
    )

    conv = Conversation()
    events = list(
        orchestrate_chat(
            "How do I set up direct deposit?",
            conv,
            client,
            Mock(),
            Mock(),
        )
    )

    event_types = [e["type"] for e in events]
    assert "text_delta" in event_types
    assert "done" in event_types
    assert "tool_use" not in event_types

    messages = conv.get_messages()
    assert messages[1]["role"] == "assistant"
    assert "Settings" in messages[1]["content"]
