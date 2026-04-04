import { MessageCircle } from "react-feather";

interface ChatTriggerProps {
  onOpen: () => void;
}

export function ChatTrigger({ onOpen }: ChatTriggerProps) {
  return (
    <button
      onClick={onOpen}
      className="group fixed bottom-6 right-6 z-50 flex cursor-pointer items-center justify-center size-12 rounded-full bg-card text-primary shadow-[0_4px_20px_rgb(0,0,0,0.08)] ring-1 ring-border/50 transition-all duration-200 hover:scale-110 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95"
    >
      <MessageCircle size={18} />
      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap shadow-lg">
        Ask Nova
      </div>
    </button>
  );
}
