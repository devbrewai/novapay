import { Loader2, CheckCircle2 } from "lucide-react";
import type { ToolUseEvent } from "@/types";

const TOOL_LABELS: Record<string, string> = {
  transaction_lookup: "Searching transactions",
  account_info: "Looking up account",
  escalate_to_human: "Escalating to support",
};

interface ChatToolStatusProps {
  toolUse: ToolUseEvent;
}

export function ChatToolStatus({ toolUse }: ChatToolStatusProps) {
  const label = TOOL_LABELS[toolUse.name] ?? toolUse.name;
  const isRunning = toolUse.status === "running";

  return (
    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
      {isRunning ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <CheckCircle2 className="size-3 text-primary" />
      )}
      <span>{label}{isRunning ? "..." : ""}</span>
    </div>
  );
}
