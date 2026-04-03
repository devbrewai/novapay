import { Minus, X } from "react-feather";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <h2 className="text-sm font-semibold">Ask Nova</h2>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-7">
          <Minus size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
