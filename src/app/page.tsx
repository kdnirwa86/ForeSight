"use client";

import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Lightbulb,
  FileText,
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  Target,
} from "lucide-react";

const stats = [
  {
    label: "Active Projects",
    value: 9,
    icon: Briefcase,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    label: "Trends Tracked",
    value: 15,
    icon: TrendingUp,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    label: "Ideas Generated",
    value: 14,
    icon: Lightbulb,
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
  {
    label: "Reports Created",
    value: 10,
    icon: FileText,
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
];

const workspaces = [
  {
    id: "1",
    name: "Laptop Trends 2",
    description: "No description",
    type: "Competitive",
    status: "ACTIVE",
    updated: "Apr 10, 2026",
  },
  {
    id: "2",
    name: "Laptop Trends",
    description: "No description",
    type: "Ideation",
    status: "ACTIVE",
    updated: "Apr 10, 2026",
  },
  {
    id: "3",
    name: "Q1 2026 Crackers & Crisp Breads Innovation Analysis",
    description:
      "Comprehensive analysis of the rapidly evolving crackers and crisp breads category, where...",
    type: "Competitive",
    status: "ACTIVE",
    updated: "Apr 7, 2026",
  },
  {
    id: "4",
    name: "Premium Chocolate Market Watch",
    description: "Tracking premium positioning moves across top confectionery brands globally.",
    type: "Competitive",
    status: "ACTIVE",
    updated: "Apr 5, 2026",
  },
  {
    id: "5",
    name: "Health Snack Innovation Radar",
    description: "Monitoring reformulation and health claim trends in the snacking segment.",
    type: "Ideation",
    status: "ACTIVE",
    updated: "Apr 3, 2026",
  },
  {
    id: "6",
    name: "South Asia Distribution Strategy",
    description: "Competitive distribution and channel analysis for South Asian markets.",
    type: "Strategy",
    status: "ACTIVE",
    updated: "Apr 1, 2026",
  },
  {
    id: "7",
    name: "Q4 2025 Beverage Trends",
    description: "Annual beverage market intelligence and competitor tracking.",
    type: "Competitive",
    status: "ACTIVE",
    updated: "Mar 28, 2026",
  },
  {
    id: "8",
    name: "Sustainable Packaging Tracker",
    description: "Tracking sustainable packaging adoption across FMCG categories.",
    type: "Ideation",
    status: "ACTIVE",
    updated: "Mar 25, 2026",
  },
  {
    id: "9",
    name: "Pricing Intelligence — India",
    description: "Price tier and promotional mechanics monitoring for India market.",
    type: "Strategy",
    status: "ACTIVE",
    updated: "Mar 20, 2026",
  },
];

const typeColors: Record<string, string> = {
  Competitive: "bg-blue-50 text-blue-700",
  Ideation: "bg-purple-50 text-purple-700",
  Strategy: "bg-orange-50 text-orange-700",
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, Admin.{" "}
            <span className="text-blue-600">
              Manage your innovation projects.
            </span>
          </p>
        </div>
        <Link
          href="/workspace/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          New Workspace
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`${bg} rounded-xl p-3`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {label}
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-0.5">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search workspaces..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 font-medium">
          All Status
          <ChevronDown size={14} />
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 font-medium">
          All Types
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/workspace/${ws.id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Target size={14} className="text-blue-600" />
                </div>
                <span className="badge-active">{ws.status}</span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
              {ws.name}
            </h3>
            <p className="text-xs text-gray-400 mb-4 line-clamp-2">
              {ws.description}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColors[ws.type] || "bg-gray-100 text-gray-600"}`}
              >
                {ws.type}
              </span>
              <span className="text-xs text-gray-400">
                Updated {ws.updated}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
