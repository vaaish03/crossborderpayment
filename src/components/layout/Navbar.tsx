"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Search, Bell, ChevronDown, Wallet } from "lucide-react";
import { useRemittanceStore } from "@/store/useRemittanceStore";
import { connectWallet } from "@/lib/freighter";
import { truncateAddress } from "@/lib/freighter";
import Button from "@/components/ui/Button";
import { useState } from "react";
import toast from "react-hot-toast";

const navTabs = [
  { href: "/",           label: "Dashboard" },
  { href: "/send",       label: "Send Money" },
  { href: "/monitoring", label: "Monitoring" },
  { href: "/history",    label: "Support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { wallet, setWallet } = useRemittanceStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const state = await connectWallet();
      if (state.isConnected) {
        setWallet(state);
        toast.success("Wallet connected!");
      } else {
        toast.error("Freighter not found. Install the Freighter extension.");
      }
    } catch {
      toast.error("Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="fixed top-0 left-16 right-0 h-14 bg-bg-primary border-b border-border flex items-center px-6 z-40">
      {/* Nav Tabs */}
      <nav className="flex items-center gap-1 flex-1">
        {navTabs.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-bg-card text-white border border-border"
                  : "text-text-secondary hover:text-white"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Search */}
      <button className="w-8 h-8 rounded-lg text-text-secondary hover:text-white hover:bg-bg-hover flex items-center justify-center transition-all mr-3">
        <Search size={16} />
      </button>

      {/* Wallet */}
      {wallet.isConnected ? (
        <div className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-white text-sm font-medium">
            {truncateAddress(wallet.address ?? "")}
          </span>
          <ChevronDown size={14} className="text-text-secondary" />
        </div>
      ) : (
        <Button size="sm" onClick={handleConnect} loading={connecting}>
          <Wallet size={14} className="mr-1.5" />
          Connect Wallet
        </Button>
      )}

      {/* Notification */}
      <button className="relative w-8 h-8 rounded-lg text-text-secondary hover:text-white hover:bg-bg-hover flex items-center justify-center transition-all ml-3">
        <Bell size={16} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-accent-orange rounded-full" />
      </button>

      {/* Profile */}
      <div className="flex items-center gap-2 ml-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green to-accent-orange flex items-center justify-center">
          <span className="text-black text-xs font-bold">V</span>
        </div>
        <div className="hidden md:block">
          <p className="text-white text-xs font-medium leading-none">Vaishnavi</p>
          <p className="text-text-secondary text-xs">@vaaish03</p>
        </div>
      </div>
    </header>
  );
}
