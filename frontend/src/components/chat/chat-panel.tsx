import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/use-chat";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInput } from "./chat-input";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { messages, status, sendMessage, retry, resetConversation } = useChat();
  const panelRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus panel when opened
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Backdrop — click to dismiss (mobile only; desktop chat is a
          floating bubble that should not block the dashboard) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm transition-all md:hidden"
          onClick={onClose}
        />
      )}

      {/* Floating chat bubble */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-card outline-none shadow-[0_16px_70px_rgb(0,0,0,0.12)] transition-all duration-300 ease-out",
          // Mobile: fullscreen
          "inset-0 h-full w-full rounded-none",
          // Desktop: floating bubble, bottom-right
          "md:inset-auto md:bottom-6 md:right-6 md:h-[min(75vh,640px)] md:w-[400px] md:rounded-2xl md:border md:border-border/50",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0 md:translate-y-4",
        )}
      >
        <ChatHeader
          title={hasMessages ? "Chat with Nova" : "New conversation"}
          onClose={onClose}
          onNewConversation={hasMessages ? resetConversation : undefined}
        />
        <ChatMessageList
          messages={messages}
          status={status}
          onSuggestedPrompt={sendMessage}
          onRetry={retry}
        />
        <ChatInput onSend={sendMessage} status={status} />
      </div>
    </>
  );
}
