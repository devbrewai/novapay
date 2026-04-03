import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "react-feather";
import type { ChatStatus } from "@/types";

interface ChatInputProps {
  onSend: (message: string) => void;
  status: ChatStatus;
}

export function ChatInput({ onSend, status }: ChatInputProps) {
  const [value, setValue] = useState("");
  const disabled = status === "streaming" || status === "tool_calling";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="p-4 bg-card/80 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-muted/30 p-2 shadow-sm focus-within:border-primary/40 focus-within:bg-card focus-within:ring-4 focus-within:ring-primary/5 transition-all"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nova anything..."
          disabled={disabled}
          rows={1}
          className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2.5 text-sm font-medium placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="mb-1 mr-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          <ArrowUp size={16} strokeWidth={3} />
        </button>
      </form>
    </div>
  );
}
