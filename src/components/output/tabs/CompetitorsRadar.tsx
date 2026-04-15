"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Eye,
  ChevronRight,
  BarChart2,
  Search,
  MessageSquare,
  Repeat2,
  FileText,
} from "lucide-react";

const HIGH_IMPACT_EVENTS = [
  {
    id: 1,
    title: "Pepsi launches low-sugar Lays variant in India",
    impact: 82,
    level: "high",
    company: "Pepsi",
    type: "Product & Innovation",
    date: "Apr 10, 2026",
  },
  {
    id: 2,
    title: "ITC increases promotional frequency in premium snacks segment",
    impact: 68,
    level: "medium",
    company: "ITC",
    type: "Pricing & Commercial",
    date: "Apr 8, 2026",
  },
  {
    id: 3,
    title: "Hershey hiring surge in R&D and innovation team",
    impact: 54,
    level: "medium",
    company: "Hershey",
    type: "Organisational Signals",
    date: "Apr 5, 2026",
  },
  {
    id: 4,
    title: "Nestlé files clean-label reformulation patent",
    impact: 71,
    level: "high",
    company: "Nestlé",
    type: "Formulation / Ingredients",
    date: "Apr 3, 2026",
  },
  {
    id: 5,
    title: "Mondelez shifts messaging to 'natural ingredients' across APAC",
    impact: 66,
    level: "medium",
    company: "Mondelez",
    type: "Market Positioning",
    date: "Mar 30, 2026",
  },
];

const COMPETITOR_MOMENTUM = [
  { name: "Pepsi", momentum: "up-strong", change: "+18%", signals: 12 },
  { name: "ITC", momentum: "up", change: "+9%", signals: 7 },
  { name: "Nestlé", momentum: "down", change: "-4%", signals: 5 },
  { name: "Hershey", momentum: "flat", change: "0%", signals: 4 },
  { name: "Mondelez", momentum: "up", change: "+6%", signals: 6 },
];

const EARLY_WARNINGS = [
  {
    label: "Share of voice",
    direction: "down",
    value: "-12%",
    icon: Search,
    color: "text-red-600 bg-red-50",
    valueColor: "text-red-600",
  },
  {
    label: "Competitor sentiment",
    direction: "up",
    value: "+8%",
    icon: MessageSquare,
    color: "text-green-600 bg-green-50",
    valueColor: "text-green-600",
  },
  {
    label: "Search substitution intent",
    direction: "up",
    value: "+15%",
    icon: Repeat2,
    color: "text-orange-600 bg-orange-50",
    valueColor: "text-orange-600",
  },
];

const IMPACT_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};

export default function CompetitorsRadar() {
  const [showBrief, setShowBrief] = useState(false);

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* LEFT: Priority Feeds */}
      <div className="col-span-2 space-y-4">
        {/* High Impact Events */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-bold text-gray-900 text-sm">High Impact Events</h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {HIGH_IMPACT_EVENTS.filter((e) => e.impact >= 50).length}
              </span>
            </div>
            <button className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {HIGH_IMPACT_EVENTS.map((event) => (
              <div key={event.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {event.company}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{event.type}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{event.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{event.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${IMPACT_COLORS[event.level]}`}
                      >
                        Impact {event.impact}
                      </div>
                    </div>
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Market Signals + Momentum + Brief */}
      <div className="space-y-4">
        {/* Early Warning Indicators */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Early Warning Indicators</h3>
          <div className="space-y-2.5">
            {EARLY_WARNINGS.map(({ label, direction, value, icon: Icon, color, valueColor }) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {direction === "down" ? (
                    <TrendingDown size={13} className="text-red-500" />
                  ) : (
                    <TrendingUp size={13} className="text-green-500" />
                  )}
                  <span className={`text-xs font-bold ${valueColor}`}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Momentum */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 text-sm">Competitor Momentum</h3>
          </div>
          <div className="space-y-2">
            {COMPETITOR_MOMENTUM.map(({ name, momentum, change, signals }) => (
              <div
                key={name}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">{name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{signals} signals</span>
                  <div
                    className={`flex items-center gap-0.5 ${
                      momentum === "up-strong" || momentum === "up"
                        ? "text-green-600"
                        : momentum === "down"
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {momentum === "up-strong" && (
                      <>
                        <TrendingUp size={14} />
                        <TrendingUp size={14} />
                      </>
                    )}
                    {momentum === "up" && <TrendingUp size={14} />}
                    {momentum === "down" && <TrendingDown size={14} />}
                    {momentum === "flat" && <Minus size={14} />}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      momentum === "up-strong" || momentum === "up"
                        ? "text-green-600"
                        : momentum === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Intelligence Brief */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-blue-200" />
            <h3 className="font-bold text-sm">Weekly Intelligence Brief</h3>
          </div>
          <p className="text-blue-100 text-xs leading-relaxed mb-3">
            &quot;3 threats emerging in premium snacking segment — Pepsi's low-sugar push and ITC's promo
            surge converge on your core consumer base...&quot;
          </p>
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {showBrief ? "Close Brief" : "→ Open Brief"}
          </button>
          {showBrief && (
            <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs text-blue-100 leading-relaxed space-y-2">
              <p>
                <strong className="text-white">Threat 1:</strong> Pepsi's low-sugar Lays variant
                directly targets health-conscious millennials in Tier 1 cities — your primary
                segment.
              </p>
              <p>
                <strong className="text-white">Threat 2:</strong> ITC's increased promotional
                frequency risks share erosion in the ₹20–50 price tier by 15–20% over Q2.
              </p>
              <p>
                <strong className="text-white">Threat 3:</strong> Nestlé's clean-label patent
                signals a reformulation wave; first-mover advantage window is approximately 90 days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
