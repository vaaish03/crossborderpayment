"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";

// Dot matrix visualization
function DotMatrix({ rows = 8, cols = 12 }: { rows?: number; cols?: number }) {
  const dots = Array.from({ length: rows * cols }, (_, i) => {
    const rand = Math.random();
    if (rand < 0.4) return "green";
    if (rand < 0.7) return "orange";
    return "white";
  });

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {dots.map((color, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor:
              color === "green"
                ? "#A8FF3E"
                : color === "orange"
                ? "#FF8C00"
                : "#444",
          }}
        />
      ))}
    </div>
  );
}

export default function CorridorStatsCard() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Product
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-end gap-6">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp size={12} className="text-accent-green" />
            <span className="text-accent-green text-2xl font-bold">2.8%</span>
          </div>
          <p className="text-text-secondary text-xs">Partners</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingDown size={12} className="text-accent-orange" />
            <span className="text-accent-orange text-2xl font-bold">3.2%</span>
          </div>
          <p className="text-text-secondary text-xs">Owners</p>
        </div>
      </div>

      <DotMatrix rows={6} cols={12} />
    </Card>
  );
}
