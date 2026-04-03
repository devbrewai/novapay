import { Zap } from "react-feather";

const SUGGESTED_PROMPTS = [
  "What's the international transfer fee?",
  "I see a charge for $47.99",
  "I want to close my account",
  "How do I set up direct deposit?",
];

interface ChatEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

export function ChatEmptyState({ onPromptClick }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center animate-in fade-in duration-500">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <Zap size={24} className="fill-primary/20" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">Ask Nova anything</h3>
        <p className="mt-1.5 text-sm font-medium text-muted-foreground max-w-[250px] mx-auto">
          I can help with your NovaPay account, transactions, and more.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5 mt-4">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="w-full rounded-xl border border-border/50 bg-card px-4 py-3.5 text-left text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-md active:scale-[0.98]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
