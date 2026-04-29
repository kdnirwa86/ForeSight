"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, TrendingUp, Lightbulb, FileText,
  Plus, Search, ChevronDown, MoreHorizontal, Target, Trash2,
} from "lucide-react";
import type { SavedWorkspace } from "@/components/workspace/CreateWorkspace";

// ─── STATIC DEMO WORKSPACES ───────────────────────────────────────────────────

const STATIC_WORKSPACES = [
  { id: "1", name: "Laptop Trends 2",                                       description: "No description",                                                                                        type: "Competitive", status: "ACTIVE", updated: "Apr 10, 2026" },
  { id: "2", name: "Laptop Trends",                                          description: "No description",                                                                                        type: "Ideation",    status: "ACTIVE", updated: "Apr 10, 2026" },
  { id: "3", name: "Q1 2026 Crackers & Crisp Breads Innovation Analysis",   description: "Comprehensive analysis of the rapidly evolving crackers and crisp breads category, where...",           type: "Competitive", status: "ACTIVE", updated: "Apr 7, 2026"  },
  { id: "4", name: "Premium Chocolate Market Watch",                         description: "Tracking premium positioning moves across top confectionery brands globally.",                           type: "Competitive", status: "ACTIVE", updated: "Apr 5, 2026"  },
  { id: "5", name: "Health Snack Innovation Radar",                          description: "Monitoring reformulation and health claim trends in the snacking segment.",                              type: "Ideation",    status: "ACTIVE", updated: "Apr 3, 2026"  },
  { id: "6", name: "South Asia Distribution Strategy",                       description: "Competitive distribution and channel analysis for South Asian markets.",                                 type: "Strategy",    status: "ACTIVE", updated: "Apr 1, 2026"  },
  { id: "7", name: "Q4 2025 Beverage Trends",                               description: "Annual beverage market intelligence and competitor tracking.",                                           type: "Competitive", status: "ACTIVE", updated: "Mar 28, 2026" },
  { id: "8", name: "Sustainable Packaging Tracker",                          description: "Tracking sustainable packaging adoption across FMCG categories.",                                        type: "Ideation",    status: "ACTIVE", updated: "Mar 25, 2026" },
  { id: "9", name: "Pricing Intelligence — India",                           description: "Price tier and promotional mechanics monitoring for India market.",                                      type: "Strategy",    status: "ACTIVE", updated: "Mar 20, 2026" },
];

const TYPE_COLORS: Record<string, string> = {
  Competitive: "bg-blue-50 text-blue-700",
  Ideation:    "bg-purple-50 text-purple-700",
  Strategy:    "bg-orange-50 text-orange-700",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("foresight_workspaces");
      if (raw) setSavedWorkspaces(JSON.parse(raw));
    } catch (_) {}
  }, []);

  function deleteWorkspace(id: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this workspace?")) return;
    const updated = savedWorkspaces.filter(ws => ws.id !== id);
    setSavedWorkspaces(updated);
    try {
      localStorage.setItem("foresight_workspaces", JSON.stringify(updated));
      localStorage.removeItem(`foresight_ws_config_${id}`);
    } catch (_) {}
  }

  const allWorkspaces = [
    ...savedWorkspaces.map(ws => ({ ...ws, isDynamic: true })),
    ...STATIC_WORKSPACES.map(ws => ({ ...ws, isDynamic: false, category: "", subCategory: "", region: "", country: "" })),
  ];

  const filtered = allWorkspaces.filter(ws => {
    const matchSearch = !search || ws.name.toLowerCase().includes(search.toLowerCase()) || ws.description.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === "All Types" || ws.type === filterType;
    return matchSearch && matchType;
  });

  const totalCount = savedWorkspaces.length + STATIC_WORKSPACES.length;

  const stats = [
    { label: "Active Projects",  value: totalCount,                     icon: Briefcase, bg: "bg-blue-50",    color: "text-blue-600"   },
    { label: "Trends Tracked",   value: totalCount + 6,                 icon: TrendingUp,bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Ideas Generated",  value: 14,                             icon: Lightbulb, bg: "bg-amber-50",   color: "text-amber-600"  },
    { label: "Reports Created",  value: 10 + savedWorkspaces.length,    icon: FileText,  bg: "bg-purple-50",  color: "text-purple-600" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workspace Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, Kuldeep.{" "}
            <span style={{ color: "#7300FF" }}>Manage your intelligence workspaces.</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/workspace/new"
            className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors hover:opacity-90"
            style={{ backgroundColor: "#7300FF" }}
          >
            <Plus size={16} />
            New Workspace
          </Link>
          <Link
            href="/workspaces"
            className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${bg} rounded-xl p-3`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${totalCount} workspaces...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {["All Types", "Competitive", "Ideation", "Strategy"].map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {savedWorkspaces.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Workspaces</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#7300FF" }}>
            {savedWorkspaces.length} new
          </span>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(ws => (
          <Link
            key={ws.id}
            href={`/workspace/${ws.id}`}
            className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group ${
              ws.isDynamic ? "border-purple-100 hover:border-purple-300" : "border-gray-100 hover:border-purple-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={ws.isDynamic ? { background: "#7300FF" } : { background: "#f3e8ff" }}
                >
                  <Target size={14} style={ws.isDynamic ? { color: "white" } : { color: "#7300FF" }} />
                </div>
                <span className="badge-active">{ws.status}</span>
                {ws.isDynamic && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#7300FF" }}>
                    New
                  </span>
                )}
              </div>
              {ws.isDynamic ? (
                <button
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  onClick={e => deleteWorkspace(ws.id, e)}
                  title="Delete workspace"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={e => e.preventDefault()}
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
              {ws.name}
            </h3>
            <p className="text-xs text-gray-400 mb-4 line-clamp-2">{ws.description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[ws.type] || "bg-gray-100 text-gray-600"}`}>
                {ws.type}
              </span>
              <span className="text-xs text-gray-400">Updated {ws.updated}</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-sm text-gray-400">
            No workspaces match your search.
          </div>
        )}
      </div>
    </div>
  );
}
