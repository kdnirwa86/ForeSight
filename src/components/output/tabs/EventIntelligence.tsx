"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Filter, Zap, ChevronRight, Lightbulb, ExternalLink, TrendingUp } from "lucide-react";
import type { CategoryType, StoredConfig } from "../OutputDashboard";
import { scoreEventBatch } from "@/lib/scoringEngine";
import type { ScoringResult, SignalEvent, WorkspaceProfile } from "@/lib/scoringEngine";
import {
  PC_SIGNAL_EVENTS,
  SNACKS_SIGNAL_EVENTS,
  PC_WORKSPACE,
  SNACKS_WORKSPACE,
} from "@/lib/workspaceProfiles";
import {
  buildDynamicSignalEvents,
  buildDynamicWorkspace,
} from "@/lib/dynamicEvents";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CATEGORY_DISPLAY: Record<string, string> = {
  product:      "Product & Innovation",
  pricing:      "Pricing & Commercial",
  distribution: "Distribution & Access",
  positioning:  "Market Positioning",
  org:          "Organisational Signals",
  formulation:  "Formulation / Ingredients",
  packaging:    "Packaging & Materials",
  digital:      "Digital & Tech",
  claims:       "Claims & Regulatory",
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function routeStyle(route: string): string {
  if (route.startsWith("urgent_alert"))   return "bg-red-100 text-red-700";
  if (route.startsWith("analyst_review")) return "bg-amber-100 text-amber-700";
  if (route === "digest_only")            return "bg-gray-100 text-gray-500";
  return "bg-gray-100 text-gray-400";
}

function routeLabel(route: string): string {
  if (route === "urgent_alert_response_plan")    return "Urgent · Plan";
  if (route === "urgent_alert_suggest_options")  return "Urgent · Options";
  if (route === "urgent_alert_explain_only")     return "Urgent Alert";
  if (route === "analyst_review_response_plan")  return "Analyst · Plan";
  if (route === "analyst_review_suggest_options")return "Analyst · Options";
  if (route === "analyst_review_explain_only")   return "Analyst Review";
  if (route === "digest_only")                   return "Digest Only";
  return "Suppressed";
}

const LABEL_STYLES: Record<string, string> = {
  observed_fact:     "bg-green-100 text-green-700 border-green-200",
  inferred_intent:   "bg-blue-100 text-blue-700 border-blue-200",
  emerging_signal:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  unverified_signal: "bg-gray-100 text-gray-500 border-gray-200",
};
const LABEL_TEXT: Record<string, string> = {
  observed_fact:     "Verified",
  inferred_intent:   "Inferred",
  emerging_signal:   "Emerging",
  unverified_signal: "Unverified",
};

function getKeyInsight(result: ScoringResult): string {
  const impact = Math.round(result.impactScore);
  const lever  = result.actionabilityBreakdown.bestLever;
  const leverLabel: Record<string, string> = {
    product: "product response", pricing: "pricing counter-play",
    messaging: "messaging response", distribution: "distribution counter-play",
  };
  if (result.route.startsWith("urgent_alert")) {
    return `Impact ${impact}/100 — ${leverLabel[lever] ?? "response"} recommended. ${
      result.impactBreakdown.positioningThreat > 0.6 ? "Directly threatens your positioning." :
      result.impactBreakdown.commercialExposure > 0.5 ? "Material revenue exposure detected." :
      "Competitive pressure requires immediate attention."
    }`;
  }
  if (result.route.startsWith("analyst_review")) {
    return `Significance ${Math.round(result.significanceScore)}/100 — monitor and assess. ${
      result.impactBreakdown.switchingRisk > 0.6 ? "Consumer switching risk elevated." :
      "Route to analyst for deeper evaluation."
    }`;
  }
  return `Low priority — significance ${Math.round(result.significanceScore)}/100. File for context in weekly digest.`;
}

function getWhyItMatters(result: ScoringResult, event: SignalEvent): string {
  const parts: string[] = [];
  if (result.impactBreakdown.positioningThreat > 0.55) parts.push("directly challenges your market positioning");
  if (result.impactBreakdown.switchingRisk > 0.55)     parts.push("elevates consumer switching probability");
  if (result.impactBreakdown.commercialExposure > 0.45) parts.push("puts revenue in your core markets at risk");
  if (parts.length === 0) parts.push("adds competitive pressure to watch");
  return `This move ${parts.join(", ")} in ${event.geography}. Best response lever: ${result.actionabilityBreakdown.bestLever}.`;
}

// ─── SCORE TRACE (collapsible) ───────────────────────────────────────────────

function MiniBar({ value, color = "bg-blue-400" }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, value * 100)}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-500">{value.toFixed(2)}</span>
    </div>
  );
}

function ScoreTrace({ result }: { result: ScoringResult }) {
  const { scopeBreakdown: sb, significanceBreakdown: sig, impactBreakdown: ib, actionabilityBreakdown: ab } = result;
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3 text-xs">
      <div>
        <div className="font-bold text-gray-500 mb-1.5 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-black">1</span>
          Scope · {Math.round(result.scopeRelevance * 100)}/100
        </div>
        {[["Category", sb.categoryMatch],["Geo", sb.geoMatch],["Channel", sb.channelMatch],["Competitor", sb.competitorMatch]].map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between mb-1">
            <span className="text-gray-400 w-20">{l as string}</span>
            <MiniBar value={v as number} color="bg-gray-400" />
          </div>
        ))}
      </div>
      <div>
        <div className="font-bold text-gray-500 mb-1.5 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-black">2</span>
          Significance · {Math.round(result.significanceScore)}/100
        </div>
        {[["Materiality", sig.materiality],["Proximity", sig.proximity],["Velocity", sig.velocity]].map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between mb-1">
            <span className="text-gray-400 w-20">{l as string}</span>
            <MiniBar value={v as number} color="bg-purple-400" />
          </div>
        ))}
        <div className="font-bold text-gray-500 mb-1.5 mt-2 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-black">3</span>
          Impact · {Math.round(result.impactScore)}/100
        </div>
        {[["Mkt overlap", ib.marketOverlap],["Pos. threat", ib.positioningThreat],["Switch risk", ib.switchingRisk]].map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between mb-1">
            <span className="text-gray-400 w-20">{l as string}</span>
            <MiniBar value={v as number} color="bg-orange-400" />
          </div>
        ))}
      </div>
      <div>
        <div className="font-bold text-gray-500 mb-1.5 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-black">4</span>
          Evidence
        </div>
        <div className="text-gray-500 mb-0.5">Label: <span className="font-semibold text-gray-700">{LABEL_TEXT[result.label]}</span></div>
        <div className="text-gray-500 mb-2">Confidence: <span className="font-semibold text-gray-700">{Math.round(result.confidence * 100)}%</span></div>

        <div className="font-bold text-gray-500 mb-1.5 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">5</span>
          Actionability · {Math.round(result.actionabilityScore)}/100
        </div>
        {[["Product", ab.productFit, "product"],["Pricing", ab.priceFit, "pricing"],["Messaging", ab.messageFit, "messaging"],["Distro", ab.distroFit, "distribution"]].map(([l, v, lever]) => (
          <div key={l as string} className="flex items-center justify-between mb-1">
            <span className={`w-20 ${lever === ab.bestLever ? "font-bold text-blue-600" : "text-gray-400"}`}>{l as string}{lever === ab.bestLever ? " ★" : ""}</span>
            <MiniBar value={v as number} color={lever === ab.bestLever ? "bg-blue-500" : "bg-blue-200"} />
          </div>
        ))}
        <div className="mt-2 text-[11px] text-gray-400">Step 6 route: <span className={`font-bold px-1.5 py-0.5 rounded ${routeStyle(result.route)}`}>{routeLabel(result.route)}</span></div>
      </div>
    </div>
  );
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────

interface CardProps {
  event:  SignalEvent;
  result: ScoringResult;
}

function EventCard({ event, result }: CardProps) {
  const [showTrace, setShowTrace] = useState(false);
  const keyInsight = getKeyInsight(result);
  const whyMatters = getWhyItMatters(result, event);
  const typeName   = CATEGORY_DISPLAY[event.category] ?? event.category;

  return (
    <div className={`bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
      result.route.startsWith("urgent_alert")   ? "border-red-100" :
      result.route.startsWith("analyst_review") ? "border-amber-100" : "border-gray-100"
    }`}>
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-gray-600">{event.actor[0]}</span>
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-gray-700">{event.actor}</span>
            <div className="text-[10px] text-gray-400">{fmt(event.timestamp)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LABEL_STYLES[result.label]}`}>
            {LABEL_TEXT[result.label]}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${routeStyle(result.route)}`}>
            {routeLabel(result.route)}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-4 pb-2">
        <div className="flex items-start gap-2">
          <h3 className="text-sm font-bold text-gray-900 leading-snug flex-1">{event.title}</h3>
          <ExternalLink size={12} className="text-gray-300 shrink-0 mt-0.5" />
        </div>
      </div>

      {/* Meta pills */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">{event.geography}</span>
        <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">{typeName}</span>
        <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">{event.channel}</span>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{event.description}</p>
      </div>

      {/* Key Insight box */}
      <div className={`mx-4 mb-3 rounded-xl px-3.5 py-3 ${
        result.route.startsWith("urgent_alert")   ? "bg-red-50 border border-red-100" :
        result.route.startsWith("analyst_review") ? "bg-amber-50 border border-amber-100" :
        "bg-blue-50 border border-blue-100"
      }`}>
        <div className="flex items-center gap-1.5 mb-1">
          <Lightbulb size={11} className={result.route.startsWith("urgent_alert") ? "text-red-500" : result.route.startsWith("analyst_review") ? "text-amber-500" : "text-blue-500"} />
          <span className={`text-[10px] font-bold uppercase tracking-wide ${
            result.route.startsWith("urgent_alert") ? "text-red-600" : result.route.startsWith("analyst_review") ? "text-amber-600" : "text-blue-600"
          }`}>Key Insight</span>
        </div>
        <p className={`text-[11px] font-medium leading-relaxed ${
          result.route.startsWith("urgent_alert") ? "text-red-700" : result.route.startsWith("analyst_review") ? "text-amber-700" : "text-blue-700"
        }`}>{keyInsight}</p>
      </div>

      {/* Why it matters */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Why It Matters</p>
        <p className="text-xs text-gray-500 leading-relaxed">{whyMatters}</p>
      </div>

      {/* Score strip */}
      <div className="mt-auto px-4 pb-3 pt-2 border-t border-gray-50 flex items-center gap-3">
        {[
          { label: "Scope",  value: Math.round(result.scopeRelevance * 100) },
          { label: "Sig",    value: Math.round(result.significanceScore) },
          { label: "Impact", value: Math.round(result.impactScore) },
          { label: "Action", value: Math.round(result.actionabilityScore) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className={`text-sm font-black leading-none ${
              value >= 75 ? "text-red-600" : value >= 50 ? "text-amber-600" : "text-gray-400"
            }`}>{value}</span>
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
          </div>
        ))}
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="ml-auto flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-600 font-semibold transition-colors"
        >
          Score trace
          <ChevronRight size={11} className={`transition-transform ${showTrace ? "rotate-90" : ""}`} />
        </button>
      </div>

      {showTrace && (
        <div className="px-4 pb-4">
          <ScoreTrace result={result} />
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface Props {
  category: CategoryType;
  config?:  StoredConfig | null;
}

export default function EventIntelligence({ category, config }: Props) {
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("All Types");
  const [filterRoute, setFilterRoute] = useState("All Routes");
  const [showTrend, setShowTrend]     = useState(false);

  // Use the dynamic path whenever a real workspace config exists (even with no competitors —
  // buildDynamicSignalEvents falls back to category-appropriate defaults in that case).
  const hasDynamic = !!config?.category;

  const events = useMemo(() => {
    if (hasDynamic) return buildDynamicSignalEvents(config!);
    return category === "pc" ? PC_SIGNAL_EVENTS : SNACKS_SIGNAL_EVENTS;
  }, [hasDynamic, config, category]);

  const workspace = useMemo(() => {
    if (hasDynamic) return buildDynamicWorkspace(config!);
    return category === "pc" ? PC_WORKSPACE : SNACKS_WORKSPACE;
  }, [hasDynamic, config, category]);

  const scoredResults = useMemo(
    () => scoreEventBatch(events, workspace),
    [events, workspace]
  );

  const displayRows = useMemo(
    () =>
      scoredResults
        .filter(r => r.route !== "suppressed")
        .map(result => {
          const ev = events.find(e => e.id === result.eventId)!;
          return { event: ev, result, type: CATEGORY_DISPLAY[ev.category] ?? ev.category };
        }),
    [scoredResults, events]
  );

  const allTypes = ["All Types", ...Array.from(new Set(displayRows.map(r => r.type)))];

  const filtered = displayRows.filter(row => {
    const matchSearch = !search ||
      row.event.title.toLowerCase().includes(search.toLowerCase()) ||
      row.event.actor.toLowerCase().includes(search.toLowerCase());
    const matchType  = filterType  === "All Types"  || row.type         === filterType;
    const matchRoute = filterRoute === "All Routes" || row.result.route.startsWith(filterRoute);
    return matchSearch && matchType && matchRoute;
  });

  const urgentCount  = scoredResults.filter(r => r.route.startsWith("urgent_alert")).length;
  const analystCount = scoredResults.filter(r => r.route.startsWith("analyst_review")).length;

  const categoryLabel = hasDynamic
    ? (config!.subCategory || config!.category)
    : category === "pc" ? "PC & Laptops" : "Snacks & Food";

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2">
            <Zap size={13} className="text-blue-500" />
            <span className="text-xs font-semibold text-blue-800">Live scoring</span>
            <span className="text-xs text-blue-400">· {displayRows.length} events · {urgentCount} urgent · {analystCount} analyst</span>
          </div>
        </div>
        <button
          onClick={() => setShowTrend(!showTrend)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-sm"
        >
          <TrendingUp size={13} />
          Generate Trend Analysis
        </button>
      </div>

      {/* Trend Analysis panel */}
      {showTrend && (
        <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-violet-600" />
            <span className="text-sm font-bold text-violet-800">Trend Analysis — {categoryLabel}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Dominant Move Type",  value: category === "pc" ? "Product launches (OLED)" : "Premium SKU launches & reformulations", color: "text-violet-700" },
              { label: "Most Active Actor",   value: (config?.competitors?.[0] ?? (category === "pc" ? "Microsoft" : "Pepsi")) + " / " + (config?.competitors?.[1] ?? (category === "pc" ? "Dell" : "ITC")), color: "text-red-600" },
              { label: "Signal Velocity",     value: "+38–42% vs. prior 30 days", color: "text-orange-600" },
              { label: "Top Threat Category", value: category === "pc" ? "Product & Digital" : "Product & Positioning", color: "text-red-600" },
              { label: "Revenue at Risk",     value: category === "pc" ? "$80–120M (H1 2026)" : "₹40–60Cr (Q2–Q3 2026)", color: "text-gray-700" },
              { label: "Recommended Focus",   value: category === "pc" ? "OLED counter + messaging" : "Premium positioning + distribution response", color: "text-green-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-violet-100 p-3">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</div>
                <div className={`text-sm font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder={`Search events... (${categoryLabel})`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
            value={filterType} onChange={e => setFilterType(e.target.value)}
          >
            {allTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-600"
            value={filterRoute} onChange={e => setFilterRoute(e.target.value)}
          >
            {[
              { value: "All Routes",     label: "All Routes" },
              { value: "urgent_alert",   label: "Urgent Alert" },
              { value: "analyst_review", label: "Analyst Review" },
              { value: "digest_only",    label: "Digest Only" },
            ].map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Filter size={13} />
          {filtered.length} events
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(({ event, result }) => (
          <EventCard key={event.id} event={event} result={result} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-sm text-gray-400">
            No events match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
