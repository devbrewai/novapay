import type { ComponentType } from "react";
import { useState } from "react";
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

export const categoryConfig: Record<
  TransactionCategory,
  { icon: FeatherIcon; color: string }
> = {
  food: { icon: Coffee, color: "bg-primary/5 text-primary" },
  transport: { icon: Navigation, color: "bg-primary/5 text-primary" },
  shopping: { icon: ShoppingBag, color: "bg-primary/5 text-primary" },
  entertainment: { icon: Film, color: "bg-primary/5 text-primary" },
  bills: { icon: FileText, color: "bg-primary/5 text-primary" },
  income: { icon: TrendingUp, color: "bg-primary/5 text-primary" },
  transfer: { icon: Shuffle, color: "bg-primary/5 text-primary" },
  health: { icon: Heart, color: "bg-primary/5 text-primary" },
  travel: { icon: Map, color: "bg-primary/5 text-primary" },
  subscriptions: { icon: Tv, color: "bg-primary/5 text-primary" },
};

export const merchantDomains: Record<string, string> = {
  Uber: "uber.com",
  Spotify: "spotify.com",
  Amazon: "amazon.com",
  Starbucks: "starbucks.com",
  Netflix: "netflix.com",
  "Delta Airlines": "delta.com",
  Apple: "apple.com",
  Lyft: "lyft.com",
  Target: "target.com",
  Chipotle: "chipotle.com",
  "Whole Foods Market": "wholefoodsmarket.com",
  Airbnb: "airbnb.com",
  Costco: "costco.com",
  "Trader Joe's": "traderjoes.com",
  "Google Cloud": "cloud.google.com",
  "Adobe Creative Cloud": "adobe.com",
  "AT&T": "att.com",
  Verizon: "verizon.com",
  DoorDash: "doordash.com",
  "Uber Eats": "ubereats.com",
};

export const LOGO_API_KEY = import.meta.env.VITE_LOGO_DEV_API_KEY;

function formatAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function TransactionItem({
  transaction,
  onClick,
}: {
  transaction: Transaction;
  onClick?: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const config = categoryConfig[transaction.category];
  const Icon = config.icon;
  const isIncome = transaction.amount >= 0;

  const domain = merchantDomains[transaction.merchant];
  const logoUrl =
    domain && !imgError && LOGO_API_KEY
      ? `https://img.logo.dev/${domain}?token=${LOGO_API_KEY}&size=80`
      : null;

  return (
    <div onClick={onClick} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99] select-none group">
      <div
        className={`relative flex size-10 shrink-0 items-center justify-center rounded-full overflow-hidden ${!logoUrl ? config.color : "bg-white ring-1 ring-border/50"}`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={transaction.merchant}
            className="size-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Icon size={18} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {transaction.merchant}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {transaction.category.charAt(0).toUpperCase() +
            transaction.category.slice(1)}
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
            variant={
              transaction.status === "pending" ? "secondary" : "destructive"
            }
            className="text-[10px] px-1.5 py-0 uppercase tracking-wider font-bold"
          >
            {transaction.status}
          </Badge>
        )}
      </div>
    </div>
  );
}
