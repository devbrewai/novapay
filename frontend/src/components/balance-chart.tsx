import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockAccount } from "@/data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BalanceChart() {
  const data = useMemo(() => {
    const points = [];
    let currentVal = mockAccount.balance * 0.85;
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const variance = (Math.random() - 0.3) * 300;
      currentVal = i === 0 ? mockAccount.balance : currentVal + variance + 50;

      points.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        balance: currentVal,
      });
    }
    return points;
  }, []);

  return (
    <div className="h-[120px] w-full -mt-1 -mb-2 -ml-2 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#054F31" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#054F31" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis domain={["dataMin - 1000", "dataMax + 1000"]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card/90 backdrop-blur-md border border-border/50 px-3 py-2 rounded-lg shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {payload[0].payload.date}
                    </p>
                    <p className="font-heading font-bold text-foreground">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#054F31"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorBalance)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
