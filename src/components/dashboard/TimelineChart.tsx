"use client";
import Card from "@/components/ui/Card";
import { MoreHorizontal } from "lucide-react";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import { CORRIDOR_FLAGS } from "@/lib/mockData";
import { format } from "date-fns";

const MAX_VALUE = 5000;

function TimelineBar({
  date,
  amount,
  corridor,
  status,
  flag,
}: {
  date: string;
  amount: number;
  corridor: string;
  status: string;
  flag: string;
}) {
  const width = Math.max(Math.round((amount / MAX_VALUE) * 100), 8);
  const color =
    status === "completed"
      ? "#A8FF3E"
      : status === "pending"
      ? "#FF8C00"
      : "#555";

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-text-secondary text-xs w-12 flex-shrink-0">{date}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-base flex-shrink-0">{flag}</span>
        <div className="flex-1 relative h-7 flex items-center">
          <div
            className="h-7 rounded-lg flex items-center px-2 transition-all duration-300 group-hover:opacity-90"
            style={{ width: `${width}%`, backgroundColor: color, minWidth: 40 }}
          >
            <span className="text-black text-xs font-bold truncate">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimelineChart() {
  const { transactions } = useRemittanceStore();

  const recent = transactions.slice(0, 8);

  return (
    <Card className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
          Recent Transactions
        </span>
        <button className="text-text-muted hover:text-white transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {recent.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-8">
            No transactions yet. Send money to see activity here.
          </p>
        ) : (
          recent.map((tx) => {
            const corridorKey = `${tx.sourceAsset}_${tx.destAsset}`;
            const flag = CORRIDOR_FLAGS[corridorKey] ?? "🌍";
            const date = format(new Date(tx.timestamp * 1000), "dd.MM");
            return (
              <TimelineBar
                key={tx.id}
                date={date}
                amount={tx.amountSent}
                corridor={`${tx.sourceAsset}→${tx.destAsset}`}
                status={tx.status}
                flag={flag}
              />
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-border pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <span className="text-text-secondary text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-orange" />
          <span className="text-text-secondary text-xs">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#555" }} />
          <span className="text-text-secondary text-xs">Failed</span>
        </div>
        <span className="ml-auto text-text-secondary text-xs">
          Total: <span className="text-white font-semibold">{transactions.length}</span>
        </span>
      </div>
    </Card>
  );
}
