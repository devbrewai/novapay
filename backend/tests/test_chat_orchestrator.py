from unittest.mock import Mock, patch

import anthropic.types

from app.services.chat_orchestrator import orchestrate_chat
from app.services.conversation import Conversation
from app.services.text import strip_emojis
from tests._anthropic_stream import make_anthropic_client


def _make_text_response(text: str) -> anthropic.types.Message:
    """Create a mock Claude response with a text block."""
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
    """Create a mock Claude response with a tool use block."""
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


def _make_text_then_tool_use_response(
    text: str,
    tool_name: str,
    tool_input: dict[str, object],
    tool_id: str = "tool_1",
) -> anthropic.types.Message:
    """Create a mock Claude response with a text block followed by a tool use."""
    return anthropic.types.Message(
        id="msg_test",
        type="message",
        role="assistant",
        model="claude-sonnet-4-6",
        content=[
            anthropic.types.TextBlock(type="text", text=text),
            anthropic.types.ToolUseBlock(
                type="tool_use",
                id=tool_id,
                name=tool_name,
                input=tool_input,
            ),
        ],
        stop_reason="tool_use",
        usage=anthropic.types.Usage(input_tokens=10, output_tokens=5),
    )


@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_text_response(mock_retrieve: Mock) -> None:
    mock_retrieve.return_value = []
    client = make_anthropic_client(_make_text_response("Hello Alex!"))

    conv = Conversation()
    events = list(orchestrate_chat("hi", conv, client, Mock(), Mock()))

    assert events[0] == {"type": "text_delta", "content": "Hello Alex!"}
    assert events[1] == {"type": "done"}
    assert conv.get_messages()[-1]["content"] == "Hello Alex!"


@patch("app.services.chat_orchestrator.execute_tool")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_with_tool_use(mock_retrieve: Mock, mock_execute: Mock) -> None:
    mock_retrieve.return_value = []
    mock_execute.return_value = "Uber | $24.50"

    # First call returns tool use, second returns text
    client = make_anthropic_client(
        _make_tool_use_response("transaction_lookup", {"query": "Uber"}),
        _make_text_response("I found your Uber charge of $24.50."),
    )

    conv = Conversation()
    events = list(orchestrate_chat("find my Uber charge", conv, client, Mock(), Mock()))

    event_types = [e["type"] for e in events]
    assert "tool_use" in event_types
    assert "tool_result" in event_types
    assert "text_delta" in event_types
    assert "done" in event_types


@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_stores_in_conversation(mock_retrieve: Mock) -> None:
    mock_retrieve.return_value = []
    client = make_anthropic_client(_make_text_response("Response text"))

    conv = Conversation()
    list(orchestrate_chat("question", conv, client, Mock(), Mock()))

    messages = conv.get_messages()
    assert messages[0] == {"role": "user", "content": "question"}
    assert messages[1] == {"role": "assistant", "content": "Response text"}


@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_error_yields_error_event(mock_retrieve: Mock) -> None:
    mock_retrieve.side_effect = RuntimeError("API down")

    conv = Conversation()
    events = list(orchestrate_chat("test", conv, Mock(), Mock(), Mock()))

    assert events[0]["type"] == "error"


@patch("app.services.chat_orchestrator.execute_tool")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_separates_consecutive_responses_with_paragraph_break(
    mock_retrieve: Mock, mock_execute: Mock
) -> None:
    mock_retrieve.return_value = []
    mock_execute.return_value = "Premium | $12,847.32"

    pre_text = "I'd be happy to help! Let me pull up your account details right away."
    post_text = "Your balance is $12,847.32."
    client = make_anthropic_client(
        _make_text_then_tool_use_response(pre_text, "account_info", {}),
        _make_text_response(post_text),
    )

    conv = Conversation()
    events = list(
        orchestrate_chat("I need help with my account", conv, client, Mock(), Mock())
    )

    joined = "".join(e["content"] for e in events if e["type"] == "text_delta")
    assert pre_text in joined
    assert post_text in joined
    assert "right away.\n\n" in joined, (
        f"expected paragraph break between segments, got: {joined!r}"
    )


@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_strips_emojis_from_streamed_text(mock_retrieve: Mock) -> None:
    mock_retrieve.return_value = []
    client = make_anthropic_client(
        _make_text_response("Hi Alex! 👋 Your balance is $12,847.32. ✨")
    )

    conv = Conversation()
    events = list(orchestrate_chat("hi", conv, client, Mock(), Mock()))

    text_deltas = [e["content"] for e in events if e["type"] == "text_delta"]
    assert text_deltas, "expected at least one text_delta event"
    for content in text_deltas:
        assert strip_emojis(content) == content, f"emoji leaked into delta: {content!r}"

    stored = conv.get_messages()[-1]["content"]
    assert strip_emojis(stored) == stored, f"emoji leaked into history: {stored!r}"
    assert "Hi Alex!" in stored
    assert "$12,847.32" in stored
