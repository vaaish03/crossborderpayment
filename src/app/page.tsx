"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SenderStatsCard from "@/components/dashboard/SenderStatsCard";
import CorridorStatsCard from "@/components/dashboard/CorridorStatsCard";
import VolumeChart from "@/components/dashboard/VolumeChart";
import TimelineChart from "@/components/dashboard/TimelineChart";
import { useRemittanceStore } from "@/store/useRemittanceStore";

function FilterDropdown({ label, value }: { label: string; value: string }) {
  return (
    <button className="flex items-center gap-1.5 bg-bg-card border border-border rounded-xl px-3 py-1.5 text-sm text-white hover:bg-bg-hover transition-colors">
      <span className="text-text-secondary text-xs">{label}:</span>
      <span>{value}</span>
      <ChevronDown size={12} className="text-text-secondary" />
    </button>
  );
}

export default function DashboardPage() {
  const { stats } = useRemittanceStore();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white font-bold text-3xl tracking-tight">STELLAR SEND</h1>
          <p className="text-text-secondary text-sm mt-1">
            Cross-border remittance on Stellar blockchain
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown label="Date" value="Now" />
          <FilterDropdown label="Corridor" value="All" />
          <FilterDropdown label="Profile" value="User" />
          <button className="w-8 h-8 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:text-white hover:bg-bg-hover transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Volume", value: `$${stats.totalVolume.toLocaleString()}`, color: "text-white" },
          { label: "Transactions", value: stats.totalTransactions.toString(), color: "text-accent-green" },
          { label: "Success Rate", value: `${stats.successRate}%`, color: "text-accent-green" },
          { label: "Active Corridors", value: stats.activeCorridors.toString(), color: "text-accent-orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-text-secondary text-xs mb-1">{label}</p>
            <p className={`font-bold text-xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid — matches screenshot layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: 2 small cards stacked */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SenderStatsCard />
          <CorridorStatsCard />
          <div className="sm:col-span-2">
            <VolumeChart />
          </div>
        </div>

        {/* Right column: tall timeline */}
        <div className="lg:col-span-1">
          <TimelineChart />
        </div>
      </div>
    </div>
  );
}
