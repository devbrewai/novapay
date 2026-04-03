import { ArrowUpRight, Send, Download, FileText } from "react-feather";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAccount } from "@/data";

const quickActions = [
  { label: "Send", icon: Send },
  { label: "Request", icon: Download },
  { label: "Pay Bills", icon: FileText },
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
            <p className="font-heading mt-1 text-3xl font-semibold tracking-tight">
              {formatCurrency(mockAccount.balance)}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  changeIsPositive ? "text-primary" : "text-destructive"
                }`}
              >
                <ArrowUpRight
                  size={12}
                  className={!changeIsPositive ? "rotate-90" : ""}
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
              <action.icon size={16} />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
