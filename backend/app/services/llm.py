"""LLM service for Claude streaming with tool use."""

from collections.abc import Iterator
from typing import Any

import anthropic
import httpx
from anthropic.types import MessageParam

from app.config import settings

SYSTEM_PROMPT_TEMPLATE = """\
You are Nova, the AI support assistant. You help customers with \
their banking questions, account inquiries, and transaction lookups.

## Persona
- Friendly, professional, and concise
- Use the customer's first name when known
- Never reveal you are a demo or AI unless directly asked
- Keep responses under 100 words unless explaining a multi-step process

## Rules
- Only answer questions related to Nova banking services
- For account closures, complex disputes, or issues unresolved after \
2 attempts, use the escalate_to_human tool
- When looking up transactions, use the transaction_lookup tool
- When asked about account details, use the account_info tool
- Base your answers on the knowledge base context provided below

## Knowledge Base Context
{context}
"""

TOOLS: list[anthropic.types.ToolParam] = [
    {
        "name": "transaction_lookup",
        "description": (
            "Search the user's recent transactions by merchant name, "
            "amount, or description. Use when the user asks about a "
            "specific charge or transaction."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "Search term: merchant name, dollar amount, "
                        "or description keyword"
                    ),
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "account_info",
        "description": (
            "Retrieve the current user's account information including "
            "name, balance, tier, and cards. Use when the user asks "
            "about their account details."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "escalate_to_human",
        "description": (
            "Escalate the conversation to a human support agent. Use "
            "for account closures, complex disputes, or when unable "
            "to resolve after 2 attempts."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Why the conversation is being escalated",
                },
            },
            "required": ["reason"],
        },
    },
]


def get_anthropic_client() -> anthropic.Anthropic:
    """Initialize the Anthropic client with retry and fresh connections."""
    transport = httpx.HTTPTransport(retries=3)
    http_client = httpx.Client(transport=transport)
    return anthropic.Anthropic(
        api_key=settings.anthropic_api_key,
        max_retries=3,
        http_client=http_client,
    )


def build_system_prompt(context: str) -> str:
    """Build the system prompt with injected KB context."""
    if not context:
        return SYSTEM_PROMPT_TEMPLATE.format(
            context="No relevant knowledge base articles found."
        )
    return SYSTEM_PROMPT_TEMPLATE.format(context=context)


def create_response(
    client: anthropic.Anthropic,
    messages: list[MessageParam],
    system_prompt: str,
) -> anthropic.types.Message:
    """Create a non-streaming response from Claude with tool use."""
    return client.messages.create(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
        tools=TOOLS,
    )


def stream_response(
    client: anthropic.Anthropic,
    messages: list[MessageParam],
    system_prompt: str,
) -> Iterator[Any]:
    """Stream a response from Claude with tool use support."""
    with client.messages.stream(
        model=settings.anthropic_model,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
        tools=TOOLS,
    ) as stream:
        yield from stream
