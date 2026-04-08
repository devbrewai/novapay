import { useCallback, useEffect, useRef, useState } from "react";

import { sendChatMessage } from "@/services/api";
import type { ChatMessage, ChatStatus, SSEEvent } from "@/types";

const TYPEWRITER_TICK_MS = 16;
const TYPEWRITER_CATCHUP_DIVISOR = 30;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const conversationIdRef = useRef<string | null>(null);
  const lastUserTextRef = useRef<string>("");

  // Typewriter buffer state
  const pendingTextRef = useRef<string>("");
  const streamFinishedRef = useRef<boolean>(false);
  const drainTimerRef = useRef<number | null>(null);
  const activeAssistantIdRef = useRef<string | null>(null);

  const stopDrainTimer = useCallback(() => {
    if (drainTimerRef.current !== null) {
      clearInterval(drainTimerRef.current);
      drainTimerRef.current = null;
    }
  }, []);

  const resetTypewriter = useCallback(() => {
    stopDrainTimer();
    pendingTextRef.current = "";
    streamFinishedRef.current = false;
    activeAssistantIdRef.current = null;
  }, [stopDrainTimer]);

  const startDrainTimer = useCallback(() => {
    if (drainTimerRef.current !== null) return;
    drainTimerRef.current = window.setInterval(() => {
      const buffer = pendingTextRef.current;
      const assistantId = activeAssistantIdRef.current;

      if (buffer.length === 0) {
        if (streamFinishedRef.current) {
          stopDrainTimer();
          if (assistantId) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, timestamp: Date.now() }
                  : msg,
              ),
            );
          }
          setStatus("idle");
          activeAssistantIdRef.current = null;
          streamFinishedRef.current = false;
        }
        return;
      }

      if (!assistantId) return;

      const charsThisTick = Math.max(
        1,
        Math.ceil(buffer.length / TYPEWRITER_CATCHUP_DIVISOR),
      );
      const slice = buffer.slice(0, charsThisTick);
      pendingTextRef.current = buffer.slice(charsThisTick);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: msg.content + slice }
            : msg,
        ),
      );
    }, TYPEWRITER_TICK_MS);
  }, [stopDrainTimer]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopDrainTimer();
    };
  }, [stopDrainTimer]);

  const sendMessage = useCallback(
    async (text: string) => {
      lastUserTextRef.current = text;

      // Reset any in-flight typewriter state from a previous message
      resetTypewriter();

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
      activeAssistantIdRef.current = assistantId;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        },
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
                pendingTextRef.current += event.content ?? "";
                startDrainTimer();
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
                // Don't flip status immediately — let the typewriter finish
                // draining the buffer first.
                streamFinishedRef.current = true;
                break;

              case "error":
                resetTypewriter();
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
        resetTypewriter();
        setStatus("error");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: "Failed to connect. Please try again." }
              : msg,
          ),
        );
      }
    },
    [resetTypewriter, startDrainTimer],
  );

  const retry = useCallback(() => {
    const text = lastUserTextRef.current;
    if (!text) return;
    // Remove the last two messages (user message + error assistant placeholder)
    setMessages((prev) => prev.slice(0, -2));
    sendMessage(text);
  }, [sendMessage]);

  const resetConversation = useCallback(() => {
    resetTypewriter();
    setMessages([]);
    setStatus("idle");
    conversationIdRef.current = null;
    lastUserTextRef.current = "";
  }, [resetTypewriter]);

  return {
    messages,
    status,
    conversationId: conversationIdRef.current,
    sendMessage,
    retry,
    resetConversation,
  };
}
