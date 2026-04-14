"use client";

import { TrendingUp, TrendingDown, AlertCircle, Activity } from "lucide-react";

const COMPETITOR_IMPACT = [
  { name: "Pepsi", impact: 82, events: 12, threats: 4, color: "bg-blue-500" },
  { name: "ITC", impact: 68, events: 9, threats: 3, color: "bg-orange-500" },
  { name: "Nestlé", impact: 71, events: 7, threats: 2, color: "bg-red-500" },
  { name: "Hershey", impact: 54, events: 5, threats: 1, color: "bg-yellow-500" },
  { name: "Mondelez", impact: 66, events: 8, threats: 2, color: "bg-purple-500" },
  { name: "Britannia", impact: 73, events: 6, threats: 3, color: "bg-green-500" },
];

const IMPACT_DIMENSIONS = [
  {
    dimension: "Market Overlap",
    score: 78,
    desc: "Competitor signals overlap significantly with your core market space",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    dimension: "Positioning Threat",
    score: 71,
    desc: "Premium health-conscious claims under direct competitive pressure",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    dimension: "Consumer Switching Risk",
    score: 63,
    desc: "Health-conscious millennials moderately likely to trial competitor variants",
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    dimension: "Revenue Exposure",
    score: 69,
    desc: "Estimated ₹40–60Cr revenue at risk across Q2–Q3 2026",
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    dimension: "Urgency",
    score: 82,
    desc: "Several moves expected to reach market impact within 30–60 days",
    color: "bg-red-600",
    textColor: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
  },
];

const SIGNAL_TRENDS = [
  { month: "Nov", product: 3, pricing: 2, positioning: 1 },
  { month: "Dec", product: 4, pricing: 3, positioning: 2 },
  { month: "Jan", product: 5, pricing: 2, positioning: 3 },
  { month: "Feb", product: 6, pricing: 4, positioning: 4 },
  { month: "Mar", product: 8, pricing: 6, positioning: 5 },
  { month: "Apr", product: 12, pricing: 9, positioning: 7 },
];

const RISK_AREAS = [
  {
    area: "Premium Segment Erosion",
    risk: "High",
    driver: "Low-sugar product launches by Pepsi, Britannia",
    probability: 75,
    icon: "🎯",
  },
  {
    area: "Consumer Migration to Health Alternatives",
    risk: "High",
    driver: "Nestlé clean-label, Mondelez 'natural' messaging",
    probability: 68,
    icon: "🏃",
  },
  {
    area: "Distribution Disadvantage",
    risk: "Medium",
    driver: "ITC × Reliance Retail exclusive deal",
    probability: 55,
    icon: "🏪",
  },
  {
    area: "Price Tier Compression",
    risk: "Medium",
    driver: "ITC promotional surge in ₹20–50 tier",
    probability: 50,
    icon: "💰",
  },
];

function ScoreGauge({ value, label }: { value: number; label: string }) {
  const angle = (value / 100) * 180 - 90;
  const color = value >= 75 ? "#ef4444" : value >= 50 ? "#f59e0b" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14 overflow-hidden">
        <div
          className="absolute inset-0 rounded-t-full border-[10px] border-gray-100"
          style={{ borderBottomColor: "transparent" }}
        />
        <div
          className="absolute inset-0 rounded-t-full border-[10px]"
          style={{
            borderColor: color,
            borderBottomColor: "transparent",
            transform: `rotate(${angle}deg)`,
            transformOrigin: "50% 100%",
            opacity: 0.3,
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-xl font-black text-gray-900">{value}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium mt-1">{label}</span>
    </div>
  );
}

export default function ImpactAnalysis() {
  const maxImpact = Math.max(...SIGNAL_TRENDS.map((t) => t.product + t.pricing + t.positioning));

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Overall Threat Level",
            value: "High",
            sub: "Composite score 74/100",
            icon: AlertCircle,
            bg: "bg-red-50",
            iconColor: "text-red-600",
            textColor: "text-red-700",
          },
          {
            label: "Active Threats",
            value: "15",
            sub: "8 high · 5 medium · 2 low",
            icon: Activity,
            bg: "bg-orange-50",
            iconColor: "text-orange-600",
            textColor: "text-orange-700",
          },
          {
            label: "Signal Velocity",
            value: "+42%",
            sub: "vs. prev 30 days",
            icon: TrendingUp,
            bg: "bg-yellow-50",
            iconColor: "text-yellow-600",
            textColor: "text-yellow-700",
          },
          {
            label: "Revenue at Risk",
            value: "₹50Cr",
            sub: "Est. Q2–Q3 2026 exposure",
            icon: TrendingDown,
            bg: "bg-purple-50",
            iconColor: "text-purple-600",
            textColor: "text-purple-700",
          },
        ].map(({ label, value, sub, icon: Icon, bg, iconColor, textColor }) => (
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
        {/* Impact Dimensions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Impact Score Breakdown</h3>
          <div className="space-y-3.5">
            {IMPACT_DIMENSIONS.map(({ dimension, score, desc, color, textColor, bgColor, borderColor }) => (
              <div key={dimension} className={`rounded-xl border p-3.5 ${bgColor} ${borderColor}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{dimension}</span>
                  <span className={`text-lg font-black ${textColor}`}>{score}</span>
                </div>
                <div className="h-2 bg-white/80 rounded-full mb-2">
                  <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Impact Chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Competitor Impact Scores</h3>
            <div className="space-y-3">
              {COMPETITOR_IMPACT.sort((a, b) => b.impact - a.impact).map(
                ({ name, impact, events, threats, color }) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-sm font-semibold text-gray-800">{name}</span>
                        <span className="text-xs text-gray-400">{events} signals · {threats} threats</span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          impact >= 75
                            ? "text-red-600"
                            : impact >= 50
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {impact}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${impact}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Signal Volume Trend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Signal Volume Trend (6 months)</h3>
            <div className="flex items-end gap-3 h-28">
              {SIGNAL_TRENDS.map(({ month, product, pricing, positioning: pos }) => {
                const total = product + pricing + pos;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "88px" }}>
                      <div
                        className="w-full bg-blue-400 rounded-b"
                        style={{ height: `${(product / maxImpact) * 88}px` }}
                        title={`Product: ${product}`}
                      />
                      <div
                        className="w-full bg-green-400"
                        style={{ height: `${(pricing / maxImpact) * 88}px` }}
                        title={`Pricing: ${pricing}`}
                      />
                      <div
                        className="w-full bg-purple-400 rounded-t"
                        style={{ height: `${(pos / maxImpact) * 88}px` }}
                        title={`Positioning: ${pos}`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              {[
                { label: "Product", color: "bg-blue-400" },
                { label: "Pricing", color: "bg-green-400" },
                { label: "Positioning", color: "bg-purple-400" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Areas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Key Risk Areas</h3>
        <div className="grid grid-cols-2 gap-3">
          {RISK_AREAS.map(({ area, risk, driver, probability, icon }) => (
            <div
              key={area}
              className={`rounded-xl border p-4 ${
                risk === "High"
                  ? "border-red-200 bg-red-50"
                  : "border-yellow-200 bg-yellow-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-bold text-gray-900">{area}</span>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    risk === "High"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {risk}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{driver}</p>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-1.5 bg-white/80 rounded-full mr-2">
                  <div
                    className={`h-full rounded-full ${risk === "High" ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${probability}%` }}
                  />
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
