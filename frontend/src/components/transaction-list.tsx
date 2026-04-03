import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionItem } from "@/components/transaction-item";
import { mockTransactions } from "@/data";

export function TransactionList() {
  const recentTransactions = mockTransactions.slice(0, 10);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Recent Transactions
        </h3>
        <Button variant="ghost" className="text-sm font-medium text-primary hover:bg-transparent hover:underline">
          See all
        </Button>
      </div>

      <div className="rounded-xl bg-card border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        {recentTransactions.map((txn, i) => (
          <div key={txn.id}>
            {i > 0 && <Separator className="ml-14" />}
            <TransactionItem transaction={txn} />
          </div>
        ))}
      </div>
    </div>
  );
}
