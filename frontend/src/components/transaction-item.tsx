import type { ComponentType } from "react";
import {
  Coffee,
  Navigation,
  ShoppingBag,
  Film,
  FileText,
  TrendingUp,
  Shuffle,
  Heart,
  Map,
  Tv,
} from "react-feather";
import { Badge } from "@/components/ui/badge";
import type { Transaction, TransactionCategory } from "@/types";

type FeatherIcon = ComponentType<{ size?: number; className?: string }>;

const categoryConfig: Record<
  TransactionCategory,
  { icon: FeatherIcon; color: string }
> = {
  food:          { icon: Coffee,      color: "bg-orange-100 text-orange-700" },
  transport:     { icon: Navigation,  color: "bg-blue-100 text-blue-700" },
  shopping:      { icon: ShoppingBag, color: "bg-pink-100 text-pink-700" },
  entertainment: { icon: Film,        color: "bg-purple-100 text-purple-700" },
  bills:         { icon: FileText,    color: "bg-gray-100 text-gray-700" },
  income:        { icon: TrendingUp,  color: "bg-green-100 text-green-700" },
  transfer:      { icon: Shuffle,     color: "bg-gray-100 text-gray-700" },
  health:        { icon: Heart,       color: "bg-red-100 text-red-700" },
  travel:        { icon: Map,         color: "bg-sky-100 text-sky-700" },
  subscriptions: { icon: Tv,          color: "bg-indigo-100 text-indigo-700" },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const config = categoryConfig[transaction.category];
  const Icon = config.icon;
  const isIncome = transaction.amount >= 0;

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${config.color}`}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{transaction.merchant}</p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatDate(transaction.date)}
          {transaction.description ? ` • ${transaction.description}` : ""}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? "text-green-600" : "text-foreground"
          }`}
        >
          {formatAmount(transaction.amount)}
        </span>
        {transaction.status !== "completed" && (
          <Badge
            variant={transaction.status === "pending" ? "secondary" : "destructive"}
            className="text-[10px] px-1.5 py-0 uppercase tracking-wider font-semibold"
          >
            {transaction.status}
          </Badge>
        )}
      </div>
    </div>
  );
}
