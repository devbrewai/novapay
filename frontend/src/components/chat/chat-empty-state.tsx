import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-6 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">Hi, I'm Nova!</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          I can help with your NovaPay account, transactions, and more.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            className="h-auto whitespace-normal py-2 text-left text-xs"
            onClick={() => onPromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
