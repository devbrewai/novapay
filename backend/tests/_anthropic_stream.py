"""Test helpers for mocking the Anthropic streaming API."""

from collections.abc import Iterator
from typing import Any
from unittest.mock import Mock

import anthropic.types


class _FakeStream:
    """Iterable fake stream yielding text events with get_final_message()."""

    def __init__(self, message: anthropic.types.Message) -> None:
        self._message = message
        self._events: list[Mock] = []
        for block in message.content:
            if block.type == "text":
                event = Mock()
                event.type = "text"
                event.text = block.text
                self._events.append(event)

    def __iter__(self) -> Iterator[Mock]:
        return iter(self._events)

    def get_final_message(self) -> anthropic.types.Message:
        return self._message


class _FakeStreamCtx:
    """Context manager wrapper around _FakeStream."""

    def __init__(self, message: anthropic.types.Message) -> None:
        self._stream = _FakeStream(message)

    def __enter__(self) -> _FakeStream:
        return self._stream

    def __exit__(self, *exc: Any) -> None:
        return None


def make_anthropic_client(*messages: anthropic.types.Message) -> Mock:
    """Create a mock Anthropic client whose messages.stream() returns
    pre-baked streams in sequence — one per call."""
    client = Mock()
    streams = iter([_FakeStreamCtx(m) for m in messages])
    client.messages.stream = Mock(side_effect=lambda **_: next(streams))
    return client
