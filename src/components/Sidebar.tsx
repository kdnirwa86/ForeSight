"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  TrendingUp,
  Brain,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Workspaces", href: "/workspaces", icon: FolderOpen },
  { label: "Trends", href: "/trends", icon: TrendingUp },
  { label: "AI Insights", href: "/ai-insights", icon: Brain },
  { label: "Agent5i", href: "/agent5i", icon: BarChart2, isNew: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-screen"
      style={{ backgroundColor: "#162057" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">IH</span>
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">
              INTELHUB
            </div>
            <div className="text-blue-300 text-[10px] leading-tight">
              Competitive Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon, isNew }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {isNew && (
                <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Settings size={17} />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={17} />
          Sign Out
        </button>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-sm font-medium truncate">Admin</div>
            <div className="text-blue-300 text-xs truncate">
              admin@example.com
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
