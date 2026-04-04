import { useEffect, useState } from "react";
import { X, AlertCircle, Users, Download } from "react-feather";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { merchantDomains, LOGO_API_KEY, categoryConfig } from "@/components/transaction-item";
import type { Transaction } from "@/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface TransactionDetailsProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionDetails({
  transaction,
  onClose,
}: TransactionDetailsProps) {
  const open = transaction !== null;
  const [imgError, setImgError] = useState(false);

  // Reset image error state when transaction changes
  useEffect(() => {
    setImgError(false);
  }, [transaction?.id]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!transaction) return null;

  const isIncome = transaction.amount >= 0;
  const domain = merchantDomains[transaction.merchant];
  const logoUrl =
    domain && !imgError && LOGO_API_KEY
      ? `https://img.logo.dev/${domain}?token=${LOGO_API_KEY}&size=160`
      : null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex h-full w-full flex-col overflow-y-auto bg-card/95 backdrop-blur-xl outline-none transition-transform duration-400 ease-out shadow-[0_12px_40px_rgb(0,0,0,0.12)] md:w-[400px] md:rounded-l-3xl md:my-2 md:h-[calc(100%-16px)] md:border md:border-r-0 md:border-border/50",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="text-sm font-bold text-foreground">
            Transaction Details
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {(() => {
            const config = categoryConfig[transaction.category];
            const Icon = config.icon;
            return (
              <div className={cn(
                "size-16 rounded-full flex items-center justify-center mb-4 shadow-sm ring-1 ring-border/50 overflow-hidden",
                logoUrl ? "bg-white" : config.color,
              )}>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={transaction.merchant}
                    className="size-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Icon size={28} />
                )}
              </div>
            );
          })()}

          <h3 className="text-xl font-bold font-heading text-foreground mb-1">
            {transaction.merchant}
          </h3>

          <p className="text-sm font-medium text-muted-foreground mb-4">
            {formatFullDate(transaction.date)}
          </p>

          <h1
            className={cn(
              "text-4xl font-heading font-bold tracking-tighter tabular-nums mb-3",
              isIncome ? "text-green-600" : "text-foreground",
            )}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </h1>

          {transaction.status !== "completed" && (
            <Badge
              variant={
                transaction.status === "pending" ? "secondary" : "destructive"
              }
              className="uppercase tracking-wider"
            >
              {transaction.status}
            </Badge>
          )}
        </div>

        <Separator className="w-[calc(100%-48px)] mx-auto opacity-50" />

        {/* Details List */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">
              Category
            </span>
            <span className="text-sm font-semibold capitalize text-foreground">
              {transaction.category}
            </span>
          </div>
          {transaction.description && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-medium">
                Note
              </span>
              <span className="text-sm font-semibold text-foreground">
                {transaction.description}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-medium">
              Transaction ID
            </span>
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {transaction.id}
            </span>
          </div>
        </div>

        {/* Contextual Actions */}
        <div className="mt-auto p-6 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-xl text-muted-foreground font-semibold hover:bg-muted/50"
          >
            <Users size={16} className="mr-3" />
            Split this bill
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-xl text-muted-foreground font-semibold hover:bg-muted/50"
          >
            <Download size={16} className="mr-3" />
            Download receipt
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-xl text-red-600 font-semibold hover:bg-red-50 hover:text-red-700"
          >
            <AlertCircle size={16} className="mr-3" />
            Report an issue
          </Button>
        </div>
      </div>
    </>
  );
}
