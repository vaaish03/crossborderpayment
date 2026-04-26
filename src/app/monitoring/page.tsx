"use client";
import Card from "@/components/ui/Card";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { MOCK_CORRIDORS } from "@/lib/mockData";
import { Activity, TrendingUp, Users, Globe } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

const PIE_COLORS = ["#A8FF3E", "#FF8C00", "#FF4444"];

export default function MonitoringPage() {
  const { stats, transactions } = useRemittanceStore();

  const pieData = [
    { name: "Completed", value: transactions.filter(t => t.status === "completed").length },
    { name: "Pending",   value: transactions.filter(t => t.status === "pending").length },
    { name: "Failed",    value: transactions.filter(t => t.status === "failed").length },
  ];

  // Build last-7-days chart from real transactions
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 6 - i));
    const dayEnd = day.getTime() + 86400000;
    const dayTxs = transactions.filter(
      (t) => t.timestamp * 1000 >= day.getTime() && t.timestamp * 1000 < dayEnd
    );
    return {
      date: format(day, "MMM dd"),
      completed: dayTxs.filter((t) => t.status === "completed").length,
      pending: dayTxs.filter((t) => t.status === "pending").length,
      failed: dayTxs.filter((t) => t.status === "failed").length,
    };
  });

  // Derive unique senders from real transactions
  const uniqueSenders = new Set(transactions.map((t) => t.sender)).size;

  const metricCards = [
    { icon: TrendingUp, label: "Total Volume",   value: stats.totalVolume > 0 ? `$${stats.totalVolume.toLocaleString()}` : "—", color: "text-accent-green" },
    { icon: Activity,   label: "Success Rate",   value: stats.totalTransactions > 0 ? `${stats.successRate}%` : "—",           color: "text-accent-green" },
    { icon: Users,      label: "Unique Senders", value: uniqueSenders > 0 ? uniqueSenders.toString() : "—",                    color: "text-white" },
    { icon: Globe,      label: "Corridors",      value: stats.activeCorridors.toString(),                                       color: "text-accent-orange" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white font-bold text-3xl tracking-tight">Monitoring</h1>
        <p className="text-text-secondary text-sm mt-1">Real-time network and transaction analytics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center">
                <Icon size={16} className="text-text-secondary" />
              </div>
              <span className="text-text-secondary text-xs">{label}</span>
            </div>
            <p className={`font-bold text-2xl ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart — real data */}
        <Card className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Transaction Volume (last 7 days)</h3>
          {transactions.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-16">No transactions yet. Send money to see data here.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A8FF3E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A8FF3E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF8C00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8 }}
                    labelStyle={{ color: "#888" }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#A8FF3E" fill="url(#greenGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pending"   stroke="#FF8C00" fill="url(#orangeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Pie Chart */}
        <Card>
          <h3 className="text-white font-semibold mb-4">Status Distribution</h3>
          {transactions.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-16">No data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#888", fontSize: 11 }}>{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Corridors Table */}
      <Card>
        <h3 className="text-white font-semibold mb-4">Active Corridors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Corridor", "Rate", "Fee", "Status"].map((h) => (
                  <th key={h} className="text-left text-text-secondary text-xs font-medium px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CORRIDORS.map((c) => (
                <tr key={`${c.sourceAsset}_${c.destAsset}`} className="border-b border-border/50">
                  <td className="px-3 py-3 text-white font-medium">
                    {c.sourceAsset} → {c.destAsset}
                  </td>
                  <td className="px-3 py-3 text-accent-green">
                    {c.rate.toFixed(4)}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {(c.feeBps / 100).toFixed(2)}%
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1.5 text-accent-green text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
