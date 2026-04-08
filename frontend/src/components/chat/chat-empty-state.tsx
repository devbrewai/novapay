import { Info, TrendingUp, type Icon } from "react-feather";

interface QuickAction {
  icon: Icon;
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Info,
    label: "Get support",
    prompt: "I need help with my account",
  },
  {
    icon: TrendingUp,
    label: "Understand my data",
    prompt: "Show me my recent transactions and spending",
  },
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 px-6 pb-6 animate-in fade-in duration-500">
      <h3 className="text-base font-semibold text-foreground">
        Hey, Alex. How can I be helpful?
      </h3>
      <ul className="flex flex-col">
        {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => onPromptClick(prompt)}
              className="group flex w-full cursor-pointer items-center gap-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Icon
                size={16}
                className="text-muted-foreground transition-colors group-hover:text-primary"
              />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
