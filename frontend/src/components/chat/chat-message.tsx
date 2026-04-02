import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";
import { ChatToolStatus } from "./chat-tool-status";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-foreground" : "bg-primary",
        )}
      >
        {isUser ? (
          <User className="size-3.5 text-background" />
        ) : (
          <Bot className="size-3.5 text-primary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-foreground text-background"
            : "bg-muted text-foreground",
        )}
      >
        {message.toolUse && <ChatToolStatus toolUse={message.toolUse} />}
        {message.content && (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
