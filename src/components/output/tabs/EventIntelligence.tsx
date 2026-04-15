"use client";

import { useState } from "react";
import { Search, ChevronDown, ExternalLink, Filter } from "lucide-react";

const EVENTS = [
  {
    id: 1,
    title: "Pepsi launches low-sugar Lays variant in India",
    company: "Pepsi",
    type: "Product & Innovation",
    date: "Apr 10, 2026",
    scope: 88,
    significance: 78,
    impact: 82,
    label: "observed_fact",
    confidence: 1.0,
    actionability: 85,
    route: "Output_workspace",
  },
  {
    id: 2,
    title: "Nestlé files clean-label reformulation patent (IN-2026-04821)",
    company: "Nestlé",
    type: "Formulation / Ingredients",
    date: "Apr 3, 2026",
    scope: 82,
    significance: 74,
    impact: 71,
    label: "observed_fact",
    confidence: 1.0,
    actionability: 72,
    route: "analyst_review",
  },
  {
    id: 3,
    title: "ITC increases promotional frequency in premium snacks Q2",
    company: "ITC",
    type: "Pricing & Commercial",
    date: "Apr 8, 2026",
    scope: 79,
    significance: 65,
    impact: 68,
    label: "inferred_intent",
    confidence: 0.75,
    actionability: 68,
    route: "analyst_review",
  },
  {
    id: 4,
    title: "Mondelez shifts APAC messaging to 'natural ingredients'",
    company: "Mondelez",
    type: "Market Positioning",
    date: "Mar 30, 2026",
    scope: 76,
    significance: 63,
    impact: 66,
    label: "inferred_intent",
    confidence: 0.68,
    actionability: 60,
    route: "analyst_review",
  },
  {
    id: 5,
    title: "Hershey R&D team expansion — 14 new hires in innovation",
    company: "Hershey",
    type: "Organisational Signals",
    date: "Apr 5, 2026",
    scope: 71,
    significance: 52,
    impact: 54,
    label: "observed_fact",
    confidence: 0.92,
    actionability: 45,
    route: "analyst_review",
  },
  {
    id: 6,
    title: "Britannia launches rice cracker variant targeting premium segment",
    company: "Britannia",
    type: "Product & Innovation",
    date: "Mar 28, 2026",
    scope: 85,
    significance: 70,
    impact: 73,
    label: "observed_fact",
    confidence: 1.0,
    actionability: 78,
    route: "Output_workspace",
  },
  {
    id: 7,
    title: "Parle introduces biodegradable packaging across select SKUs",
    company: "Parle",
    type: "Packaging & Materials",
    date: "Mar 25, 2026",
    scope: 68,
    significance: 47,
    impact: 45,
    label: "observed_fact",
    confidence: 1.0,
    actionability: 38,
    route: "digest_only",
  },
  {
    id: 8,
    title: "ITC signs exclusive partnership with Reliance Retail for premium shelf placement",
    company: "ITC",
    type: "Distribution & Access",
    date: "Mar 22, 2026",
    scope: 90,
    significance: 76,
    impact: 79,
    label: "observed_fact",
    confidence: 1.0,
    actionability: 82,
    route: "Output_workspace",
  },
];

const ROUTE_STYLES: Record<string, string> = {
  Output_workspace: "bg-red-100 text-red-700",
  analyst_review: "bg-yellow-100 text-yellow-700",
  digest_only: "bg-gray-100 text-gray-500",
};

const ROUTE_LABELS: Record<string, string> = {
  Output_workspace: "Urgent Alert",
  analyst_review: "Analyst Review",
  digest_only: "Digest Only",
};

const LABEL_STYLES: Record<string, string> = {
  observed_fact: "bg-green-100 text-green-700",
  inferred_intent: "bg-blue-100 text-blue-700",
  unverified_signal: "bg-gray-100 text-gray-500",
};

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-7 text-right">{value}</span>
    </div>
  );
}

export default function EventIntelligence() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterRoute, setFilterRoute] = useState("All Routes");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const filtered = EVENTS.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.company.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All Types" || e.type === filterType;
    const matchRoute = filterRoute === "All Routes" || e.route === filterRoute;
    return matchSearch && matchType && matchRoute;
  });

  const types = ["All Types", ...Array.from(new Set(EVENTS.map((e) => e.type)))];
  const routes = ["All Routes", "Output_workspace", "analyst_review", "digest_only"];

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Search events, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
          >
            {routes.map((r) => (
              <option key={r}>{r === "Output_workspace" ? "Urgent Alert" : r === "analyst_review" ? "Analyst Review" : r === "digest_only" ? "Digest Only" : r}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Filter size={13} />
          {filtered.length} events
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Event</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Company</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Scope</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Significance</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Impact</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Actionability</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Label</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Route</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((event) => (
              <>
                <tr
                  key={event.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() =>
                    setSelectedEvent(selectedEvent === event.id ? null : event.id)
                  }
                >
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-600">
                          {event.company[0]}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{event.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-500 font-medium">{event.type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <ScoreBar value={event.scope} color="bg-gray-400" />
                  </td>
                  <td className="px-4 py-3.5">
                    <ScoreBar
                      value={event.significance}
                      color={
                        event.significance >= 75
                          ? "bg-red-500"
                          : event.significance >= 50
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <ScoreBar
                      value={event.impact}
                      color={
                        event.impact >= 75
                          ? "bg-red-500"
                          : event.impact >= 50
                          ? "bg-orange-400"
                          : "bg-gray-300"
                      }
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <ScoreBar value={event.actionability} color="bg-blue-500" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LABEL_STYLES[event.label]}`}
                    >
                      {event.label === "observed_fact"
                        ? "Fact"
                        : event.label === "inferred_intent"
                        ? "Inferred"
                        : "Unverified"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROUTE_STYLES[event.route]}`}
                    >
                      {ROUTE_LABELS[event.route]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
                {selectedEvent === event.id && (
                  <tr key={`${event.id}-detail`} className="bg-blue-50/50">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <div className="font-bold text-gray-600 mb-1">Scope Breakdown</div>
                          <div className="space-y-1 text-gray-500">
                            <div className="flex justify-between"><span>Category match</span><span className="font-bold text-gray-700">0.92</span></div>
                            <div className="flex justify-between"><span>Geo match</span><span className="font-bold text-gray-700">0.88</span></div>
                            <div className="flex justify-between"><span>Channel match</span><span className="font-bold text-gray-700">0.80</span></div>
                            <div className="flex justify-between"><span>Competitor priority</span><span className="font-bold text-gray-700">0.95</span></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-600 mb-1">Impact Drivers</div>
                          <div className="space-y-1 text-gray-500">
                            <div className="flex justify-between"><span>Market overlap</span><span className="font-bold text-gray-700">0.85</span></div>
                            <div className="flex justify-between"><span>Positioning threat</span><span className="font-bold text-gray-700">0.78</span></div>
                            <div className="flex justify-between"><span>Switching risk</span><span className="font-bold text-gray-700">0.70</span></div>
                            <div className="flex justify-between"><span>Revenue exposure</span><span className="font-bold text-gray-700">0.82</span></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-600 mb-1">Confidence</div>
                          <div className="text-gray-500 space-y-1">
                            <div className="flex justify-between"><span>Source confidence</span><span className="font-bold text-gray-700">{Math.round(event.confidence * 100)}%</span></div>
                            <div className="flex justify-between"><span>Verifiable</span><span className="font-bold text-gray-700">{event.label === "observed_fact" ? "Yes" : "No"}</span></div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-gray-600 mb-1">Actionability</div>
                          <div className="text-gray-500 space-y-1">
                            <div className="flex justify-between"><span>Product fit</span><span className="font-bold text-gray-700">0.82</span></div>
                            <div className="flex justify-between"><span>Pricing fit</span><span className="font-bold text-gray-700">0.75</span></div>
                            <div className="flex justify-between"><span>Messaging fit</span><span className="font-bold text-gray-700">0.88</span></div>
                            <div className="flex justify-between"><span>Distribution fit</span><span className="font-bold text-gray-700">0.70</span></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
