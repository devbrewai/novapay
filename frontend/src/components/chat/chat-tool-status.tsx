import { Loader, CheckCircle } from "react-feather";
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
        <Loader size={12} className="animate-spin" />
      ) : (
        <CheckCircle size={12} className="text-primary" />
      )}
      <span>{label}{isRunning ? "..." : ""}</span>
    </div>
  );
}
