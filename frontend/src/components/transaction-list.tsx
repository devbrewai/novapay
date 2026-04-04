import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionItem } from "@/components/transaction-item";
import { TransactionDetails } from "@/components/transaction-details";
import { mockTransactions } from "@/data";
import type { Transaction } from "@/types";

function formatHeaderDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function TransactionList() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const groupedTransactions = mockTransactions
    .slice(0, 15)
    .reduce<Record<string, Transaction[]>>((acc, txn) => {
      if (!acc[txn.date]) acc[txn.date] = [];
      acc[txn.date].push(txn);
      return acc;
    }, {});

  return (
    <>
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-heading text-lg font-bold text-foreground">
          Recent Transactions
        </h3>
        <Button
          variant="ghost"
          className="text-sm font-semibold text-primary hover:bg-transparent hover:underline"
        >
          See all
        </Button>
      </div>

      <div className="rounded-2xl bg-card border-none shadow-sm ring-1 ring-border/50 overflow-hidden relative">
        {Object.entries(groupedTransactions).map(([date, txns]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-md px-5 py-2 border-b border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {formatHeaderDate(date)}
              </span>
            </div>

            <div>
              {txns.map((txn, i) => (
                <div key={txn.id} className="relative">
                  {i > 0 && (
                    <Separator className="ml-[68px] absolute top-0 right-0 w-[calc(100%-68px)]" />
                  )}
                  <TransactionItem transaction={txn} onClick={() => setSelectedTxn(txn)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <TransactionDetails
      transaction={selectedTxn}
      onClose={() => setSelectedTxn(null)}
    />
    </>
  );
}
