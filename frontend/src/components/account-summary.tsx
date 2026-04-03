import { ArrowUpRight, Send, Download, FileText, Plus } from "react-feather";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAccount } from "@/data";

const quickActions = [
  { label: "Add money", icon: Plus, primary: true as const },
  { label: "Send", icon: Send, primary: false as const },
  { label: "Request", icon: Download, primary: false as const },
  { label: "Pay Bills", icon: FileText, primary: false as const },
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
    <Card className="border-none shadow-sm ring-1 ring-border/50">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center size-6 rounded-full bg-muted">
                <span className="text-xs font-medium">🇺🇸</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                US Dollar
              </p>
              <Badge variant="secondary" className="font-normal">{mockAccount.tier}</Badge>
            </div>

            <h2 className="font-heading text-5xl font-bold tracking-tighter text-foreground">
              {formatCurrency(mockAccount.balance)}
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`flex items-center gap-0.5 text-sm font-medium px-2 py-0.5 rounded-md ${
                  changeIsPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <ArrowUpRight
                  size={14}
                  className={!changeIsPositive ? "rotate-90" : ""}
                />
                {changeIsPositive ? "+" : ""}
                {mockAccount.monthlyChange}%
              </span>
              <span className="text-sm text-muted-foreground">
                vs last month
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.primary ? "default" : "secondary"}
                className={`rounded-full px-5 font-semibold ${action.primary ? 'shadow-md' : ''}`}
              >
                <action.icon size={16} className="mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
