"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal } from "lucide-react";
import { useRemittanceStore } from "@/store/useRemittanceStore";

interface BubbleData {
  corridor: string;
  completed: number;
  pendingFailed: number;
}

function LollipopBar({ corridor, completed, pendingFailed }: BubbleData) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      {/* Completed bubble (top) */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ backgroundColor: "#A8FF3E" }}
        title={`${corridor}: ${completed} completed`}
      >
        {completed}
      </div>
      <div className="w-0.5 h-6 bg-border" />
      <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
      <div className="w-0.5 h-6 bg-border" />
      {/* Pending/Failed bubble (bottom) */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ backgroundColor: pendingFailed > 0 ? "#FF8C00" : "#555" }}
        title={`${corridor}: ${pendingFailed} pending/failed`}
      >
        {pendingFailed}
      </div>
      <span className="text-text-muted text-xs truncate w-full text-center mt-1">
        {corridor}
      </span>
    </div>
  );
}

export default function VolumeChart() {
  const { transactions } = useRemittanceStore();

  const corridorMap: Record<string, { completed: number; pendingFailed: number }> = {};
  transactions.forEach((tx) => {
    const key = `${tx.sourceAsset}→${tx.destAsset}`;
    if (!corridorMap[key]) corridorMap[key] = { completed: 0, pendingFailed: 0 };
    if (tx.status === "completed") corridorMap[key].completed++;
    else corridorMap[key].pendingFailed++;
  });

  const bubbles = Object.entries(corridorMap).map(([corridor, counts]) => ({
    corridor,
    ...counts,
  }));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Volume by Corridor
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {bubbles.length === 0 ? (
        <p className="text-text-muted text-xs text-center py-8">
          No transactions yet. Send money to see corridor volume.
        </p>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {bubbles.map((b) => (
            <LollipopBar key={b.corridor} {...b} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <span className="text-text-secondary text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
          <span className="text-text-secondary text-xs">Pending / Failed</span>
        </div>
        <span className="ml-auto text-text-secondary text-xs">
          Total: <span className="text-white font-semibold">{transactions.length}</span>
        </span>
      </div>
    </Card>
  );
}
