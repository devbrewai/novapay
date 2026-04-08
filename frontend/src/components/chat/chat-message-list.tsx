import { useEffect, useRef } from "react";
import { AlertCircle, RefreshCw } from "react-feather";
import type { ChatMessage as ChatMessageType, ChatStatus } from "@/types";
import { ChatMessage } from "./chat-message";
import { ChatEmptyState } from "./chat-empty-state";
import { TypingIndicator } from "./typing-indicator";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  status: ChatStatus;
  onSuggestedPrompt: (prompt: string) => void;
  onRetry: () => void;
}

export function ChatMessageList({
  messages,
  status,
  onSuggestedPrompt,
  onRetry,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <ChatEmptyState onPromptClick={onSuggestedPrompt} />;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4">
      <div className="flex flex-col gap-4 py-4">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          const isStreaming =
            isLast &&
            msg.role === "assistant" &&
            (status === "streaming" || status === "tool_calling");
          return (
            <ChatMessage key={msg.id} message={msg} isStreaming={isStreaming} />
          );
        })}
        {status === "streaming" && messages[messages.length - 1]?.content === "" && (
          <TypingIndicator />
        )}
        {status === "error" && messages.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">Connection failed.</span>
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-xs underline hover:no-underline"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
