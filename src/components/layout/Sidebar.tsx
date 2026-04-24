"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Send,
  History,
  Activity,
  Settings,
  Plus,
  Gem,
} from "lucide-react";

const navItems = [
  { href: "/",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/send",       icon: Send,            label: "Send Money" },
  { href: "/history",    icon: History,         label: "History" },
  { href: "/monitoring", icon: Activity,        label: "Monitoring" },
  { href: "/settings",   icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 bg-bg-primary border-r border-border flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-8 flex-shrink-0">
        <span className="text-black font-bold text-sm">SS</span>
      </div>

      {/* Nav Icons */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                active
                  ? "bg-accent-green/20 text-accent-green"
                  : "text-text-muted hover:text-white hover:bg-bg-hover"
              )}
            >
              <Icon size={18} />
              {/* Tooltip */}
              <span className="absolute left-14 bg-bg-card border border-border text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Plus button at bottom */}
      <button
        className="w-10 h-10 rounded-xl bg-accent-green/10 text-accent-green hover:bg-accent-green/20 flex items-center justify-center transition-all duration-200"
        title="New Transaction"
      >
        <Plus size={18} />
      </button>
    </aside>
  );
}
