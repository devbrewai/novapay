import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Gamepad2,
  Receipt,
  TrendingUp,
  ArrowLeftRight,
  Heart,
  Plane,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Transaction, TransactionCategory } from "@/types";

const categoryConfig: Record<
  TransactionCategory,
  { icon: LucideIcon; color: string }
> = {
  food: { icon: UtensilsCrossed, color: "bg-orange-100 text-orange-600" },
  transport: { icon: Car, color: "bg-blue-100 text-blue-600" },
  shopping: { icon: ShoppingBag, color: "bg-purple-100 text-purple-600" },
  entertainment: { icon: Gamepad2, color: "bg-pink-100 text-pink-600" },
  bills: { icon: Receipt, color: "bg-slate-100 text-slate-600" },
  income: { icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
  transfer: { icon: ArrowLeftRight, color: "bg-cyan-100 text-cyan-600" },
  health: { icon: Heart, color: "bg-red-100 text-red-600" },
  travel: { icon: Plane, color: "bg-indigo-100 text-indigo-600" },
  subscriptions: { icon: Tv, color: "bg-amber-100 text-amber-600" },
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

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const config = categoryConfig[transaction.category];
  const Icon = config.icon;
  const isIncome = transaction.amount >= 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
        <Icon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{transaction.merchant}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
          {transaction.description ? ` · ${transaction.description}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {transaction.status !== "completed" && (
          <Badge
            variant={transaction.status === "pending" ? "secondary" : "destructive"}
            className="text-[10px] px-1.5 py-0"
          >
            {transaction.status}
          </Badge>
        )}
        <span
          className={`text-sm font-medium tabular-nums ${
            isIncome ? "text-emerald-600" : "text-foreground"
          }`}
        >
          {formatAmount(transaction.amount)}
        </span>
      </div>
    </div>
  );
}
