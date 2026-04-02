import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary">
          <Bot className="size-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Ask Nova</h2>
          <p className="text-xs text-muted-foreground">NovaPay Support</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </div>
  );
}
