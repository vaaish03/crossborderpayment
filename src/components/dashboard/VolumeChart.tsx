"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal } from "lucide-react";
import { useRemittanceStore } from "@/store/useRemittanceStore";

interface BubbleData {
  corridor: string;
  top: number;
  bottom: number;
  topColor: string;
  bottomColor: string;
}

function LollipopBar({ top, bottom, topColor, bottomColor, corridor }: BubbleData) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      {/* Top bubble */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ backgroundColor: topColor }}
        title={`${corridor}: ${top}`}
      >
        {top}
      </div>
      {/* Stem */}
      <div className="w-0.5 h-6 bg-border" />
      {/* Dot */}
      <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
      {/* Stem */}
      <div className="w-0.5 h-6 bg-border" />
      {/* Bottom bubble */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
        style={{ backgroundColor: bottomColor }}
        title={`${corridor}: ${bottom}`}
      >
        {bottom}
      </div>
      <span className="text-text-muted text-xs truncate w-full text-center mt-1">
        {corridor}
      </span>
    </div>
  );
}

export default function VolumeChart() {
  const { transactions } = useRemittanceStore();

  // Build corridor volumes
  const corridorMap: Record<string, { completed: number; pending: number; failed: number }> = {};
  transactions.forEach((tx) => {
    const key = `${tx.sourceAsset}→${tx.destAsset}`;
    if (!corridorMap[key]) corridorMap[key] = { completed: 0, pending: 0, failed: 0 };
    corridorMap[key][tx.status]++;
  });

  const bubbles: BubbleData[] = Object.entries(corridorMap).map(([corridor, counts]) => ({
    corridor: corridor.replace("→", "→"),
    top: counts.completed,
    bottom: counts.pending + counts.failed,
    topColor: "#A8FF3E",
    bottomColor: counts.failed > 0 ? "#FF8C00" : "#555",
  }));

  const total = transactions.length;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Volume
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {bubbles.map((b) => (
          <LollipopBar key={b.corridor} {...b} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="text-text-secondary text-xs">Resources</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <span className="text-text-secondary text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
          <span className="text-text-secondary text-xs">Pending/Failed</span>
        </div>
        <span className="ml-auto text-text-secondary text-xs">
          Total: <span className="text-white font-semibold">{total.toLocaleString()}</span>
        </span>
      </div>
    </Card>
  );
}
