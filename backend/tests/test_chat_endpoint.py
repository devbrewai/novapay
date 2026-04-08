import json
from unittest.mock import Mock, patch

import anthropic.types
from fastapi.testclient import TestClient

from app.main import app
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


@patch("app.services.chat_orchestrator.retrieve")
def test_chat_returns_sse_content_type(mock_retrieve: Mock, client: TestClient) -> None:
    mock_retrieve.return_value = []
    app.state.anthropic_client = make_anthropic_client(_make_text_response("Hello!"))

    response = client.post(
        "/api/chat",
        json={"message": "hi"},
    )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]


@patch("app.services.chat_orchestrator.retrieve")
def test_chat_streams_events(mock_retrieve: Mock, client: TestClient) -> None:
    mock_retrieve.return_value = []
    app.state.anthropic_client = make_anthropic_client(
        _make_text_response("Hello Alex!")
    )

    response = client.post(
        "/api/chat",
        json={"message": "hi"},
    )

    lines = [line for line in response.text.split("\n") if line.startswith("data:")]
    events = [json.loads(line.removeprefix("data:").strip()) for line in lines]

    event_types = [e["type"] for e in events]
    assert "conversation_id" in event_types
    assert "text_delta" in event_types
    assert "done" in event_types


@patch("app.services.chat_orchestrator.retrieve")
def test_chat_returns_conversation_id(mock_retrieve: Mock, client: TestClient) -> None:
    mock_retrieve.return_value = []
    app.state.anthropic_client = make_anthropic_client(_make_text_response("Hi!"))

    response = client.post(
        "/api/chat",
        json={"message": "hello"},
    )

    lines = [line for line in response.text.split("\n") if line.startswith("data:")]
    events = [json.loads(line.removeprefix("data:").strip()) for line in lines]

    conv_event = next(e for e in events if e["type"] == "conversation_id")
    assert "id" in conv_event
    assert len(conv_event["id"]) > 0


@patch("app.services.chat_orchestrator.retrieve")
def test_chat_reuses_conversation(mock_retrieve: Mock, client: TestClient) -> None:
    mock_retrieve.return_value = []
    app.state.anthropic_client = make_anthropic_client(
        _make_text_response("First response"),
        _make_text_response("Second response"),
    )

    # First request — get conversation_id
    response1 = client.post(
        "/api/chat",
        json={"message": "hello"},
    )
    lines1 = [line for line in response1.text.split("\n") if line.startswith("data:")]
    events1 = [json.loads(line.removeprefix("data:").strip()) for line in lines1]
    conv_id = next(e for e in events1 if e["type"] == "conversation_id")["id"]

    # Second request — reuse conversation_id
    response2 = client.post(
        "/api/chat",
        json={"message": "follow up", "conversation_id": conv_id},
    )
    lines2 = [line for line in response2.text.split("\n") if line.startswith("data:")]
    events2 = [json.loads(line.removeprefix("data:").strip()) for line in lines2]
    conv_id2 = next(e for e in events2 if e["type"] == "conversation_id")["id"]

    assert conv_id == conv_id2


def test_chat_rejects_empty_message(client: TestClient) -> None:
    response = client.post("/api/chat", json={})
    assert response.status_code == 422
