from typing import Any, cast

from app.services.llm import TOOLS, build_system_prompt


def test_build_system_prompt_with_context() -> None:
    context = "[Source: transfer-fees.md]\nTransfer fees are $5."
    prompt = build_system_prompt(context)

    assert "Nova" in prompt
    assert "transfer-fees.md" in prompt
    assert "Transfer fees are $5." in prompt


def test_build_system_prompt_empty_context() -> None:
    prompt = build_system_prompt("")

    assert "Nova" in prompt
    assert "No relevant knowledge base articles found." in prompt


def test_system_prompt_forbids_emojis() -> None:
    prompt = build_system_prompt("")

    assert "emoji" in prompt.lower()


def test_tools_have_required_fields() -> None:
    for tool in TOOLS:
        assert "name" in tool
        assert "description" in tool
        assert "input_schema" in tool
        assert tool["input_schema"]["type"] == "object"


def test_tools_list_contains_expected_tools() -> None:
    tool_names = {tool["name"] for tool in TOOLS}
    assert tool_names == {
        "transaction_lookup",
        "account_info",
        "escalate_to_human",
    }


def test_transaction_lookup_tool_has_query_param() -> None:
    tool = next(t for t in TOOLS if t["name"] == "transaction_lookup")
    schema = cast(dict[str, Any], tool["input_schema"])
    assert "query" in schema["properties"]
    assert "query" in schema["required"]


def test_escalate_tool_has_reason_param() -> None:
    tool = next(t for t in TOOLS if t["name"] == "escalate_to_human")
    schema = cast(dict[str, Any], tool["input_schema"])
    assert "reason" in schema["properties"]
    assert "reason" in schema["required"]
