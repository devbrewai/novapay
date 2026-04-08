import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date";
import type { ChatMessage as ChatMessageType } from "@/types";
import { ChatToolStatus } from "./chat-tool-status";
import { MarkdownRenderer } from "./markdown-renderer";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const showMeta = !isStreaming && message.content !== "";
  const metaClasses =
    "mt-1 text-[11px] text-muted-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100";

  return (
    <div className="group flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      {isUser ? (
        <div className="ml-auto max-w-[85%] mt-2">
          <div className="rounded-2xl rounded-tr-sm bg-primary/10 text-foreground px-4 py-2.5 text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          </div>
          {showMeta && (
            <div className={cn(metaClasses, "text-right")}>
              {formatTime(message.timestamp)} · Sent
            </div>
          )}
        </div>
      ) : (
        <div className={cn("max-w-[90%] py-2 text-foreground")}>
          {message.toolUse && <ChatToolStatus toolUse={message.toolUse} />}
          {message.content && (
            <div className="text-sm text-foreground/90 leading-relaxed">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
          {showMeta && (
            <div className={metaClasses}>
              Nova AI · {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
