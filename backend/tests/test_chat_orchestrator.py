from unittest.mock import Mock, patch

import anthropic.types

from app.services.chat_orchestrator import orchestrate_chat
from app.services.conversation import Conversation


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


@patch("app.services.chat_orchestrator.create_response")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_text_response(mock_retrieve: Mock, mock_create: Mock) -> None:
    mock_retrieve.return_value = []
    mock_create.return_value = _make_text_response("Hello Alex!")

    conv = Conversation()
    events = list(orchestrate_chat("hi", conv, Mock(), Mock(), Mock()))

    assert events[0] == {"type": "text_delta", "content": "Hello Alex!"}
    assert events[1] == {"type": "done"}
    assert conv.get_messages()[-1]["content"] == "Hello Alex!"


@patch("app.services.chat_orchestrator.execute_tool")
@patch("app.services.chat_orchestrator.create_response")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_with_tool_use(
    mock_retrieve: Mock, mock_create: Mock, mock_execute: Mock
) -> None:
    mock_retrieve.return_value = []
    mock_execute.return_value = "Uber | $24.50"

    # First call returns tool use, second returns text
    mock_create.side_effect = [
        _make_tool_use_response("transaction_lookup", {"query": "Uber"}),
        _make_text_response("I found your Uber charge of $24.50."),
    ]

    conv = Conversation()
    events = list(orchestrate_chat("find my Uber charge", conv, Mock(), Mock(), Mock()))

    event_types = [e["type"] for e in events]
    assert "tool_use" in event_types
    assert "tool_result" in event_types
    assert "text_delta" in event_types
    assert "done" in event_types


@patch("app.services.chat_orchestrator.create_response")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_stores_in_conversation(
    mock_retrieve: Mock, mock_create: Mock
) -> None:
    mock_retrieve.return_value = []
    mock_create.return_value = _make_text_response("Response text")

    conv = Conversation()
    list(orchestrate_chat("question", conv, Mock(), Mock(), Mock()))

    messages = conv.get_messages()
    assert messages[0] == {"role": "user", "content": "question"}
    assert messages[1] == {"role": "assistant", "content": "Response text"}


@patch("app.services.chat_orchestrator.create_response")
@patch("app.services.chat_orchestrator.retrieve")
def test_orchestrate_error_yields_error_event(
    mock_retrieve: Mock, mock_create: Mock
) -> None:
    mock_retrieve.side_effect = RuntimeError("API down")

    conv = Conversation()
    events = list(orchestrate_chat("test", conv, Mock(), Mock(), Mock()))

    assert events[0]["type"] == "error"
