import { MessageCircle } from "react-feather";

interface ChatTriggerProps {
  onOpen: () => void;
}

export function ChatTrigger({ onOpen }: ChatTriggerProps) {
  return (
    <button
      onClick={onOpen}
      className="group fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-95"
    >
      <MessageCircle size={20} />
      <span className="text-sm font-medium">Ask Nova</span>
    </button>
  );
}
