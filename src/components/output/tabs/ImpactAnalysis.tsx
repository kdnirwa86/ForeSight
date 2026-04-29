"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, AlertCircle, Activity } from "lucide-react";
import type { CategoryType } from "../OutputDashboard";
import type { StoredConfig } from "@/lib/types";
import {
  detectCatGroup, DEFAULT_COMPETITORS, competitorColor,
  buildDynamicSignalEvents, buildDynamicWorkspace,
  getRiskAreas, getRevenueAtRisk,
} from "@/lib/dynamicEvents";
import { scoreEventBatch } from "@/lib/scoringEngine";

// ─── SIGNAL TREND TEMPLATES (6 months, indexed by catGroup) ──────────────────

const TREND_TEMPLATES = {
  pc: [
    { month: "Nov", product: 2, pricing: 1, positioning: 2 },
    { month: "Dec", product: 3, pricing: 2, positioning: 2 },
    { month: "Jan", product: 4, pricing: 2, positioning: 3 },
    { month: "Feb", product: 5, pricing: 3, positioning: 4 },
    { month: "Mar", product: 7, pricing: 5, positioning: 5 },
    { month: "Apr", product: 10, pricing: 7, positioning: 8 },
  ],
  confectionery: [
    { month: "Nov", product: 3, pricing: 2, positioning: 1 },
    { month: "Dec", product: 4, pricing: 3, positioning: 2 },
    { month: "Jan", product: 5, pricing: 2, positioning: 3 },
    { month: "Feb", product: 6, pricing: 4, positioning: 4 },
    { month: "Mar", product: 8, pricing: 6, positioning: 5 },
    { month: "Apr", product: 12, pricing: 9, positioning: 7 },
  ],
  beverage: [
    { month: "Nov", product: 4, pricing: 3, positioning: 2 },
    { month: "Dec", product: 5, pricing: 4, positioning: 3 },
    { month: "Jan", product: 6, pricing: 3, positioning: 4 },
    { month: "Feb", product: 7, pricing: 5, positioning: 5 },
    { month: "Mar", product: 9, pricing: 7, positioning: 6 },
    { month: "Apr", product: 13, pricing: 10, positioning: 8 },
  ],
  dairy: [
    { month: "Nov", product: 2, pricing: 2, positioning: 1 },
    { month: "Dec", product: 3, pricing: 2, positioning: 2 },
    { month: "Jan", product: 4, pricing: 3, positioning: 2 },
    { month: "Feb", product: 5, pricing: 3, positioning: 3 },
    { month: "Mar", product: 7, pricing: 5, positioning: 4 },
    { month: "Apr", product: 10, pricing: 7, positioning: 6 },
  ],
  fmcg: [
    { month: "Nov", product: 3, pricing: 2, positioning: 2 },
    { month: "Dec", product: 4, pricing: 3, positioning: 2 },
    { month: "Jan", product: 5, pricing: 3, positioning: 3 },
    { month: "Feb", product: 6, pricing: 4, positioning: 4 },
    { month: "Mar", product: 8, pricing: 6, positioning: 5 },
    { month: "Apr", product: 11, pricing: 8, positioning: 7 },
  ],
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface Props {
  category: CategoryType;
  config?:  StoredConfig | null;
}

export default function ImpactAnalysis({ category, config }: Props) {
  const hasDynamic = !!config?.category;

  // ── Build events + workspace + scores ──────────────────────────────────────
  const { events, workspace } = useMemo(() => {
    if (!hasDynamic) return { events: [], workspace: null };
    const e = buildDynamicSignalEvents(config!);
    const w = buildDynamicWorkspace(config!);
    return { events: e, workspace: w };
  }, [hasDynamic, config]);

  const scoredResults = useMemo(
    () => (workspace ? scoreEventBatch(events, workspace) : []),
    [events, workspace]
  );

  // ── Derive dynamic values from scores ─────────────────────────────────────
  const catG = hasDynamic ? detectCatGroup(config!.category) : (category === "pc" ? "pc" : "fmcg");

  const competitorImpact = useMemo(() => {
    const competitors = (hasDynamic && config!.competitors.length > 0)
      ? config!.competitors
      : DEFAULT_COMPETITORS[catG];
    return competitors.slice(0, 6).map((name, i) => {
      const compEvents = scoredResults.filter(r => {
        const ev = events.find(e => e.id === r.eventId);
        return ev?.actor === name;
      });
      const maxImpact = compEvents.length > 0
        ? Math.round(Math.max(...compEvents.map(r => r.impactScore)))
        : Math.max(40, 82 - i * 7);
      const eventCount = Math.max(1, compEvents.length * 2 + Math.floor(Math.random() * 3));
      const threatCount = compEvents.filter(r => r.route.startsWith("urgent_alert")).length + 1;
      return { name, impact: Math.min(95, maxImpact), events: eventCount, threats: threatCount, color: competitorColor(i) };
    });
  }, [scoredResults, events, hasDynamic, config, catG]);

  const impactDimensions = useMemo(() => {
    if (scoredResults.length === 0) return [];
    const nonSuppressed = scoredResults.filter(r => r.route !== "suppressed");
    const avg = (fn: (r: typeof scoredResults[0]) => number) =>
      Math.round((nonSuppressed.reduce((s, r) => s + fn(r), 0) / Math.max(1, nonSuppressed.length)) * 100);

    const marketOverlap    = avg(r => r.impactBreakdown.marketOverlap);
    const posThreat        = avg(r => r.impactBreakdown.positioningThreat);
    const switchRisk       = avg(r => r.impactBreakdown.switchingRisk);
    const revExposure      = avg(r => r.impactBreakdown.commercialExposure);
    const urgency          = avg(r => r.impactBreakdown.urgency);
    const sub = hasDynamic ? (config!.subCategory || config!.category) : (category === "pc" ? "touchscreen laptops" : "snacks");
    const geo = hasDynamic ? (config!.country || config!.region || "the region") : "India";

    return [
      { dimension: "Market Overlap",           score: marketOverlap, desc: `Competitor signals overlap significantly with your core ${sub} market in ${geo}`,           color: "bg-red-500",    textColor: "text-red-700",    bgColor: "bg-red-50",    borderColor: "border-red-200"    },
      { dimension: "Positioning Threat",        score: posThreat,    desc: `Your ${sub} positioning is under direct competitive pressure`,                              color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
      { dimension: "Consumer Switching Risk",   score: switchRisk,   desc: `Target consumers show moderate-to-high likelihood of trialling competitor variants`,        color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
      { dimension: "Revenue Exposure",          score: revExposure,  desc: `Estimated ${getRevenueAtRisk(catG)} revenue at risk across Q2–Q3 2026`,                    color: "bg-red-500",    textColor: "text-red-700",    bgColor: "bg-red-50",    borderColor: "border-red-200"    },
      { dimension: "Urgency",                   score: urgency,      desc: `Several moves expected to reach market impact within 30–60 days`,                          color: "bg-red-600",    textColor: "text-red-800",    bgColor: "bg-red-50",    borderColor: "border-red-300"    },
    ];
  }, [scoredResults, hasDynamic, config, category, catG]);

  const kpis = useMemo(() => {
    const urgentCount  = scoredResults.filter(r => r.route.startsWith("urgent_alert")).length;
    const analystCount = scoredResults.filter(r => r.route.startsWith("analyst_review")).length;
    const digestCount  = scoredResults.filter(r => r.route === "digest_only").length;
    const maxImpact    = scoredResults.length > 0 ? Math.round(Math.max(...scoredResults.map(r => r.impactScore))) : 74;
    const threatLabel  = maxImpact >= 75 ? "High" : maxImpact >= 50 ? "Medium" : "Low";
    const totalActive  = urgentCount + analystCount + digestCount;
    const velocity     = `+${30 + scoredResults.length * 3}%`;

    return [
      { label: "Overall Threat Level", value: threatLabel,   sub: `Composite score ${maxImpact}/100`,                              icon: AlertCircle, bg: "bg-red-50",    iconColor: "text-red-600",    textColor: "text-red-700"    },
      { label: "Active Threats",       value: String(totalActive || 15), sub: `${urgentCount} high · ${analystCount} medium · ${digestCount} low`, icon: Activity,    bg: "bg-orange-50", iconColor: "text-orange-600", textColor: "text-orange-700" },
      { label: "Signal Velocity",      value: velocity,      sub: "vs. prev 30 days",                                             icon: TrendingUp,  bg: "bg-yellow-50", iconColor: "text-yellow-600", textColor: "text-yellow-700" },
      { label: "Revenue at Risk",      value: getRevenueAtRisk(catG), sub: "Est. Q2–Q3 2026 exposure",                            icon: TrendingDown, bg: "bg-purple-50", iconColor: "text-purple-600", textColor: "text-purple-700" },
    ];
  }, [scoredResults, catG]);

  const riskAreas = useMemo(
    () => hasDynamic ? getRiskAreas(config!) : [],
    [hasDynamic, config]
  );

  const signalTrends = TREND_TEMPLATES[catG] ?? TREND_TEMPLATES.fmcg;
  const maxTrend = Math.max(...signalTrends.map(t => t.product + t.pricing + t.positioning));

  // ── When no config at all, render a placeholder ────────────────────────────
  if (!hasDynamic && scoredResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400">
        Complete workspace setup to see dynamic impact analysis.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, bg, iconColor, textColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${bg} rounded-xl p-3 shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
              <div className={`text-xl font-black mt-0.5 ${textColor}`}>{value}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Impact Score Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Impact Score Breakdown</h3>
          <div className="space-y-3.5">
            {impactDimensions.map(({ dimension, score, desc, color, textColor, bgColor, borderColor }) => (
              <div key={dimension} className={`rounded-xl border p-3.5 ${bgColor} ${borderColor}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{dimension}</span>
                  <span className={`text-lg font-black ${textColor}`}>{score}</span>
                </div>
                <div className="h-2 bg-white/80 rounded-full mb-2">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Competitor Impact Scores */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Competitor Impact Scores</h3>
            <div className="space-y-3">
              {[...competitorImpact].sort((a, b) => b.impact - a.impact).map(({ name, impact, events: ev, threats, color }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm font-semibold text-gray-800">{name}</span>
                      <span className="text-xs text-gray-400">{ev} signals · {threats} threats</span>
                    </div>
                    <span className={`text-sm font-bold ${impact >= 75 ? "text-red-600" : impact >= 50 ? "text-yellow-600" : "text-green-600"}`}>
                      {impact}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${impact}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Volume Trend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Signal Volume Trend (6 months)</h3>
            <div className="flex items-end gap-3 h-28">
              {signalTrends.map(({ month, product, pricing, positioning: pos }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "88px" }}>
                    <div className="w-full bg-blue-400 rounded-b"   style={{ height: `${(product / maxTrend) * 88}px` }} />
                    <div className="w-full bg-green-400"             style={{ height: `${(pricing  / maxTrend) * 88}px` }} />
                    <div className="w-full bg-purple-400 rounded-t"  style={{ height: `${(pos      / maxTrend) * 88}px` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              {[{ label: "Product", color: "bg-blue-400" }, { label: "Pricing", color: "bg-green-400" }, { label: "Positioning", color: "bg-purple-400" }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Risk Areas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Key Risk Areas</h3>
        <div className="grid grid-cols-2 gap-3">
          {riskAreas.map(({ area, risk, driver, probability, icon }) => (
            <div key={area} className={`rounded-xl border p-4 ${risk === "High" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-bold text-gray-900">{area}</span>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${risk === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {risk}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{driver}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-1.5 bg-white/80 rounded-full mr-2">
                  <div className={`h-full rounded-full ${risk === "High" ? "bg-red-500" : "bg-yellow-500"}`} style={{ width: `${probability}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-600">{probability}% probability</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
