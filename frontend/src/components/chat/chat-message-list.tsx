import { useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType, ChatStatus } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatEmptyState } from "./chat-empty-state";
import { TypingIndicator } from "./typing-indicator";

interface ChatMessageListProps {
  messages: ChatMessageType[];
  status: ChatStatus;
  onSuggestedPrompt: (prompt: string) => void;
}

export function ChatMessageList({
  messages,
  status,
  onSuggestedPrompt,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <ChatEmptyState onPromptClick={onSuggestedPrompt} />;
  }

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="flex flex-col gap-4 py-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {status === "streaming" && messages[messages.length - 1]?.content === "" && (
          <TypingIndicator />
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
