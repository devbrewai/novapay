"""Chat orchestrator: retrieve → format → LLM → tool loop → SSE events."""

import json
import logging
from collections.abc import Iterator
from typing import Any

import anthropic
from anthropic.types import (
    MessageParam,
    TextBlockParam,
    ToolResultBlockParam,
    ToolUseBlock,
    ToolUseBlockParam,
)
from chromadb import Collection
from openai import OpenAI

from app.config import settings
from app.services.context import format_context
from app.services.conversation import Conversation
from app.services.llm import TOOLS, build_system_prompt
from app.services.retrieval import retrieve
from app.services.tools import execute_tool

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 3


def orchestrate_chat(
    user_message: str,
    conversation: Conversation,
    anthropic_client: anthropic.Anthropic,
    openai_client: OpenAI,
    collection: Collection,
) -> Iterator[dict[str, Any]]:
    """Full chat pipeline yielding SSE-formatted events.

    Event types:
    - {"type": "text_delta", "content": "..."}
    - {"type": "tool_use", "name": "...", "status": "running"}
    - {"type": "tool_result", "name": "...", "result": "..."}
    - {"type": "done"}
    - {"type": "error", "message": "..."}
    """
    try:
        # 1. Retrieve relevant context
        results = retrieve(user_message, openai_client, collection)
        context = format_context(results)
        system_prompt = build_system_prompt(context)

        # 2. Build message history and record user message
        messages: list[MessageParam] = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in conversation.get_messages()
        ]
        messages.append({"role": "user", "content": user_message})
        conversation.add_message("user", user_message)

        # 3. LLM call loop (handles tool use rounds)
        for _round in range(MAX_TOOL_ROUNDS):
            with anthropic_client.messages.stream(
                model=settings.anthropic_model,
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
                tools=TOOLS,
            ) as stream:
                for event in stream:
                    if event.type == "text":
                        yield {"type": "text_delta", "content": event.text}

                final_message = stream.get_final_message()

            # Collect text and tool use blocks from the assembled message
            text_parts: list[str] = []
            tool_use_blocks: list[ToolUseBlock] = []

            for block in final_message.content:
                if block.type == "text":
                    text_parts.append(block.text)
                elif isinstance(block, ToolUseBlock):
                    tool_use_blocks.append(block)

            # If no tool use, we're done
            if not tool_use_blocks:
                full_text = "".join(text_parts)
                conversation.add_message("assistant", full_text)
                yield {"type": "done"}
                return

            # Execute tools and build results for next round
            tool_result_blocks: list[ToolResultBlockParam] = []
            for tool_block in tool_use_blocks:
                yield {
                    "type": "tool_use",
                    "name": tool_block.name,
                    "status": "running",
                }

                if not isinstance(tool_block.input, dict):
                    logger.error(
                        "Unexpected tool input type: %s",
                        type(tool_block.input),
                    )
                    continue

                result = execute_tool(tool_block.name, tool_block.input)
                yield {
                    "type": "tool_result",
                    "name": tool_block.name,
                    "result": result,
                }
                tool_result_blocks.append(
                    ToolResultBlockParam(
                        type="tool_result",
                        tool_use_id=tool_block.id,
                        content=result,
                    )
                )

            # Feed tool results back to LLM
            assistant_content: list[TextBlockParam | ToolUseBlockParam] = []
            for block in final_message.content:
                if block.type == "text":
                    assistant_content.append(
                        TextBlockParam(type="text", text=block.text)
                    )
                elif isinstance(block, ToolUseBlock):
                    assistant_content.append(
                        ToolUseBlockParam(
                            type="tool_use",
                            id=block.id,
                            name=block.name,
                            input=block.input,
                        )
                    )
            messages.append({"role": "assistant", "content": assistant_content})
            messages.append({"role": "user", "content": tool_result_blocks})

        # If we exhausted tool rounds
        yield {
            "type": "error",
            "message": "Too many tool calls. Please try again.",
        }

    except Exception:
        logger.exception("Chat orchestration error")
        yield {
            "type": "error",
            "message": json.dumps("An error occurred. Please try again."),
        }
