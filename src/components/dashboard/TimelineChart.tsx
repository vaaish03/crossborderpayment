"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal } from "lucide-react";
import { TIMELINE_DATA } from "@/lib/mockData";

const MAX_VALUE = 30;

function TimelineBar({
  date,
  recipient,
  amount,
  corridor,
  status,
  flag,
}: (typeof TIMELINE_DATA)[0]) {
  const width = Math.round((amount / MAX_VALUE) * 100);
  const color =
    status === "completed"
      ? "#A8FF3E"
      : status === "pending"
      ? "#FF8C00"
      : "#555";

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-text-secondary text-xs w-10 flex-shrink-0">{date}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{flag}</span>
        <div className="flex-1 relative h-7 flex items-center">
          <div
            className="h-7 rounded-lg flex items-center px-2 transition-all duration-300 group-hover:opacity-90"
            style={{ width: `${width}%`, backgroundColor: color, minWidth: 32 }}
          >
            <span className="text-black text-xs font-bold">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelineChart() {
  return (
    <Card className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Projects Timeline
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {TIMELINE_DATA.map((entry, i) => (
          <TimelineBar key={i} {...entry} />
        ))}
      </div>

      {/* X-axis */}
      <div className="flex items-center gap-0 border-t border-border pt-2">
        {[0, 5, 10, 15, 20, 25, 30].map((v) => (
          <span
            key={v}
            className="text-text-muted text-xs flex-1 text-center"
          >
            {v}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <span className="text-text-secondary text-xs">Sender</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
          <span className="text-text-secondary text-xs">Corridor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          <span className="text-text-secondary text-xs">Web</span>
        </div>
        <span className="ml-auto text-text-secondary text-xs">
          Total: <span className="text-white font-semibold">284</span>
        </span>
      </div>
    </Card>
  );
}
