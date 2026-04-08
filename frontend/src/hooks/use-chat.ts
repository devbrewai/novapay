import { useCallback, useRef, useState } from "react";

import { sendChatMessage } from "@/services/api";
import type { ChatMessage, ChatStatus, SSEEvent } from "@/types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const conversationIdRef = useRef<string | null>(null);
  const lastUserTextRef = useRef<string>("");

  const sendMessage = useCallback(async (text: string) => {
    lastUserTextRef.current = text;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStatus("streaming");

    // Placeholder for assistant response — will be built up progressively
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
    ]);

    try {
      const response = await sendChatMessage(
        text,
        conversationIdRef.current ?? undefined,
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;

          const event: SSEEvent = JSON.parse(data);

          switch (event.type) {
            case "conversation_id":
              conversationIdRef.current = event.id ?? null;
              break;

            case "text_delta":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: msg.content + (event.content ?? "") }
                    : msg,
                ),
              );
              break;

            case "tool_use":
              setStatus("tool_calling");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? {
                        ...msg,
                        toolUse: {
                          name: event.name ?? "",
                          status: "running" as const,
                        },
                      }
                    : msg,
                ),
              );
              break;

            case "tool_result":
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? {
                        ...msg,
                        toolUse: {
                          name: event.name ?? "",
                          status: "complete" as const,
                          result: event.result,
                        },
                      }
                    : msg,
                ),
              );
              setStatus("streaming");
              break;

            case "done":
              setStatus("idle");
              break;

            case "error":
              setStatus("error");
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? {
                        ...msg,
                        content:
                          event.message ??
                          "Something went wrong. Please try again.",
                      }
                    : msg,
                ),
              );
              break;
          }
        }
      }
    } catch {
      setStatus("error");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Failed to connect. Please try again." }
            : msg,
        ),
      );
    }
  }, []);

  const retry = useCallback(() => {
    const text = lastUserTextRef.current;
    if (!text) return;
    // Remove the last two messages (user message + error assistant placeholder)
    setMessages((prev) => prev.slice(0, -2));
    sendMessage(text);
  }, [sendMessage]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setStatus("idle");
    conversationIdRef.current = null;
    lastUserTextRef.current = "";
  }, []);

  return {
    messages,
    status,
    conversationId: conversationIdRef.current,
    sendMessage,
    retry,
    resetConversation,
  };
}
