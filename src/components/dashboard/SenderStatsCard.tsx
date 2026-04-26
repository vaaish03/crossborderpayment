"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import { format, subDays, startOfDay } from "date-fns";

export default function SenderStatsCard() {
  const { stats, transactions } = useRemittanceStore();
  const failRate = stats.totalTransactions > 0 ? 100 - stats.successRate : 0;

  // Build last-7-days line chart from real transactions
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const dayEnd = day.getTime() + 86400000;
    const dayTxs = transactions.filter(
      (t) => t.timestamp * 1000 >= day.getTime() && t.timestamp * 1000 < dayEnd
    );
    return {
      date: format(day, "MMM dd"),
      completed: dayTxs.filter((t) => t.status === "completed").length,
      failed: dayTxs.filter((t) => t.status === "failed").length,
    };
  });

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Transactions
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-end gap-6">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp size={12} className="text-accent-green" />
            <span className="text-accent-green text-2xl font-bold">
              {stats.totalTransactions > 0 ? `${stats.successRate}%` : "—"}
            </span>
          </div>
          <p className="text-text-secondary text-xs">Completed</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingDown size={12} className="text-accent-orange" />
            <span className="text-accent-orange text-2xl font-bold">
              {stats.totalTransactions > 0 ? `${failRate}%` : "—"}
            </span>
          </div>
          <p className="text-text-secondary text-xs">Failed</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-text-muted text-xs text-center py-4">
          Send a transaction to see stats.
        </p>
      ) : (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8 }}
                labelStyle={{ color: "#888" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line type="monotone" dataKey="completed" stroke="#A8FF3E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="failed"    stroke="#FF8C00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
