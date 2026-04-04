import { ArrowUpRight, Send, Download, FileText, Plus } from "react-feather";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAccount } from "@/data";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { BalanceChart } from "./balance-chart";

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
    maximumFractionDigits: 2,
  }).format(amount);
}

export function AccountSummary() {
  const changeIsPositive = mockAccount.monthlyChange >= 0;
  const animatedBalance = useAnimatedCounter(mockAccount.balance, 1200);

  const monthlyBudget = 5000;
  const spentThisMonth = 3240.5;
  const spendPercentage = Math.min(
    (spentThisMonth / monthlyBudget) * 100,
    100,
  );
  const animatedPercentage = useAnimatedCounter(spendPercentage, 1200);

  return (
    <Card className="border-none shadow-sm ring-1 ring-border/50 rounded-3xl py-2">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center size-7 rounded-full bg-muted shadow-inner">
                <span className="text-sm font-medium">🇺🇸</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                US Dollar
              </p>
              <Badge variant="secondary" className="font-semibold px-2.5 py-0.5">
                {mockAccount.tier}
              </Badge>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <h2 className="font-heading text-5xl md:text-6xl font-bold tracking-tighter text-foreground tabular-nums">
                  {formatCurrency(animatedBalance)}
                </h2>

                <div className="mt-3 flex items-center gap-2 animate-in fade-in duration-700 delay-300 fill-mode-backwards">
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

              {/* Monthly Spend Progress */}
              <div className="w-full md:w-64 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-backwards">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-muted-foreground">
                    Spent this month
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(spentThisMonth)}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {formatCurrency(monthlyBudget - spentThisMonth)} left of your
                  budget
                </p>
              </div>
            </div>
          </div>

          <BalanceChart />

          <div className="flex gap-3 pt-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant={action.primary ? "default" : "secondary"}
                className={`rounded-xl px-5 h-12 font-bold ${action.primary ? "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30" : ""}`}
              >
                <action.icon size={18} className="mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
