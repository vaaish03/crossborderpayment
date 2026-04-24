"use client";
import { useState, useMemo } from "react";
import { ExternalLink, Download, Search, Filter } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import { getStellarExpertUrl } from "@/lib/stellar";
import { format } from "date-fns";
import type { Transaction } from "@/types";

function statusVariant(status: Transaction["status"]) {
  if (status === "completed") return "green";
  if (status === "pending") return "orange";
  return "red";
}

function truncate(s: string, n = 8) {
  return s.length > n * 2 + 3 ? `${s.slice(0, n)}...${s.slice(-n)}` : s;
}

export default function HistoryPage() {
  const { transactions } = useRemittanceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [corridorFilter, setCorridorFilter] = useState<string>("all");

  const corridors = useMemo(() => {
    const set = new Set(transactions.map(t => `${t.sourceAsset}→${t.destAsset}`));
    return ["all", ...Array.from(set)];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        !search ||
        tx.recipient.toLowerCase().includes(search.toLowerCase()) ||
        tx.txHash.toLowerCase().includes(search.toLowerCase()) ||
        tx.sender.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || tx.status === statusFilter;
      const matchCorridor =
        corridorFilter === "all" ||
        `${tx.sourceAsset}→${tx.destAsset}` === corridorFilter;
      return matchSearch && matchStatus && matchCorridor;
    });
  }, [transactions, search, statusFilter, corridorFilter]);

  const exportCSV = () => {
    const headers = ["ID", "Date", "Sender", "Recipient", "Amount Sent", "Asset", "Amount Received", "Dest Asset", "Status", "TX Hash"];
    const rows = filtered.map((tx) => [
      tx.id,
      format(new Date(tx.timestamp * 1000), "yyyy-MM-dd HH:mm"),
      tx.sender,
      tx.recipient,
      tx.amountSent,
      tx.sourceAsset,
      tx.amountReceived.toFixed(4),
      tx.destAsset,
      tx.status,
      tx.txHash,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stellar-send-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white font-bold text-3xl tracking-tight">Transaction History</h1>
          <p className="text-text-secondary text-sm mt-1">
            {filtered.length} of {transactions.length} transactions
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCSV}>
          <Download size={14} className="mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address or hash..."
              className="w-full bg-bg-hover rounded-xl pl-9 pr-4 py-2 text-sm text-white border border-border focus:border-accent-green focus:outline-none placeholder:text-text-muted"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-hover rounded-xl px-3 py-2 text-sm text-white border border-border focus:border-accent-green focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="bg-bg-hover rounded-xl px-3 py-2 text-sm text-white border border-border focus:border-accent-green focus:outline-none"
          >
            {corridors.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Corridors" : c}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Date", "Sender", "Recipient", "Sent", "Received", "Corridor", "Status", "TX"].map((h) => (
                  <th key={h} className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-text-muted py-12">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/50 hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">
                      {format(new Date(tx.timestamp * 1000), "MMM dd, HH:mm")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {truncate(tx.sender)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {truncate(tx.recipient)}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {tx.amountSent} <span className="text-text-muted text-xs">{tx.sourceAsset}</span>
                    </td>
                    <td className="px-4 py-3 text-accent-green font-medium">
                      {tx.amountReceived.toFixed(2)} <span className="text-text-muted text-xs">{tx.destAsset}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {tx.sourceAsset}→{tx.destAsset}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(tx.status)}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={getStellarExpertUrl(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-green hover:underline flex items-center gap-1 text-xs"
                      >
                        {tx.txHash.slice(0, 8)}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
