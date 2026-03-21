import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransactionItem } from "@/components/transaction-item";
import { mockTransactions } from "@/data";

export function TransactionList() {
  const recentTransactions = mockTransactions.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Recent Transactions
        </CardTitle>
        <Button variant="link" size="sm" className="text-xs">
          View all
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {recentTransactions.map((txn, i) => (
          <div key={txn.id}>
            {i > 0 && <Separator />}
            <TransactionItem transaction={txn} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
