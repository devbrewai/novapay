import { MessageCircle } from "lucide-react";

export function ChatTrigger() {
  return (
    <button
      onClick={() => {
        /* Chat panel — Day 4 */
      }}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-95"
    >
      <MessageCircle className="size-5" />
      <span className="text-sm font-medium">Ask Nova</span>
    </button>
  );
}
