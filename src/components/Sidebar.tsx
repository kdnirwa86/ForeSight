"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen } from "lucide-react";

const navItems = [
  { label: "Dashboard",  href: "/",           icon: LayoutDashboard },
  { label: "Workspaces", href: "/workspaces",  icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col w-52 shrink-0 h-full"
      style={{ background: "linear-gradient(180deg, #0D1857 0%, #2E0080 100%)" }}
    >
      <nav className="flex-1 px-3 pt-5 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "text-white shadow-md"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              }`}
              style={active ? { backgroundColor: "#7300FF" } : undefined}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
