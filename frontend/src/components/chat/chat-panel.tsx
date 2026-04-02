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
  const { messages, status, sendMessage } = useChat();

  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out md:w-[40%] md:min-w-[400px]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <ChatHeader onClose={onClose} />
        <ChatMessageList
          messages={messages}
          status={status}
          onSuggestedPrompt={sendMessage}
        />
        <ChatInput onSend={sendMessage} status={status} />
      </div>
    </>
  );
}
