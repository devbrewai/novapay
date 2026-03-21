import { ArrowUpRight, Send, Download, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAccount } from "@/data";

const quickActions = [
  { label: "Send", icon: Send },
  { label: "Request", icon: Download },
  { label: "Pay Bills", icon: Receipt },
] as const;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function AccountSummary() {
  const changeIsPositive = mockAccount.monthlyChange >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {formatCurrency(mockAccount.balance)}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  changeIsPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <ArrowUpRight
                  className={`size-3 ${!changeIsPositive ? "rotate-90" : ""}`}
                />
                {changeIsPositive ? "+" : ""}
                {mockAccount.monthlyChange}%
              </span>
              <span className="text-xs text-muted-foreground">
                from last month
              </span>
            </div>
          </div>
          <Badge variant="secondary">{mockAccount.tier}</Badge>
        </div>

        <div className="mt-6 flex gap-2">
          {quickActions.map((action) => (
            <Button key={action.label} variant="outline" size="sm">
              <action.icon data-icon="inline-start" className="size-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
