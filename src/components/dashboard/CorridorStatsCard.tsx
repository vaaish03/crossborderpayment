"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal } from "lucide-react";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import { CORRIDOR_FLAGS } from "@/lib/mockData";

export default function CorridorStatsCard() {
  const { transactions } = useRemittanceStore();

  // Count transactions per corridor from real data
  const corridorCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    const key = `${tx.sourceAsset}_${tx.destAsset}`;
    corridorCounts[key] = (corridorCounts[key] ?? 0) + 1;
  });

  const sorted = Object.entries(corridorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const total = transactions.length;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Corridors
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {total === 0 ? (
        <p className="text-text-muted text-xs py-4 text-center">
          No transactions yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(([key, count]) => {
            const flag = CORRIDOR_FLAGS[key] ?? "🌍";
            const label = key.replace("_", "→");
            const pct = Math.round((count / total) * 100);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-sm flex-shrink-0">{flag}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-text-secondary">{label}</span>
                    <span className="text-white font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-green"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-text-muted text-xs mt-1">
        {total} total transaction{total !== 1 ? "s" : ""}
      </p>
    </Card>
  );
}
