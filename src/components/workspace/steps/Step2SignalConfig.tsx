"use client";

import { useState } from "react";
import { Zap, Target, Shield, AlertTriangle, Users, ArrowRight, Info } from "lucide-react";

const SIGNAL_CATEGORIES = [
  {
    id: "product",
    name: "Product & Innovation",
    description: "SKU launches, reformulations, feature releases, patent filings, clinical trial registrations, IND applications",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    id: "pricing",
    name: "Pricing & Commercial",
    description: "Price changes, promotional mechanics, bundling moves, channel strategy shifts, reimbursement applications",
    color: "bg-green-50 border-green-200 text-green-700",
    dot: "bg-green-500",
  },
  {
    id: "positioning",
    name: "Market Positioning",
    description: "Messaging changes, claims evolution, spokesperson/KOL activity, brand repositioning signals",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    dot: "bg-purple-500",
  },
  {
    id: "distribution",
    name: "Distribution & Access",
    description: "New channel entries, retailer/partnership announcements, geographic expansions, formulary additions",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    dot: "bg-orange-500",
  },
  {
    id: "org",
    name: "Organisational Signals",
    description: "Executive hires, team expansions in specific functions, M&A activity, investor day guidance",
    color: "bg-red-50 border-red-200 text-red-700",
    dot: "bg-red-500",
  },
  {
    id: "regulatory",
    name: "Regulatory & Legal",
    description: "Regulatory submissions, approval decisions, IP filings, label expansions, safety communications",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    dot: "bg-yellow-500",
  },
  {
    id: "formulation",
    name: "Formulation / Ingredients",
    description: "New or removed ingredients, substitutions, dosage changes, novel bioactives, clean-label reformulations, allergen removal, sourcing changes",
    color: "bg-teal-50 border-teal-200 text-teal-700",
    dot: "bg-teal-500",
  },
  {
    id: "packaging",
    name: "Packaging & Materials",
    description: "New packaging formats, material switches, sustainable materials, redesigns, pack size changes, refill/reuse systems, smart packaging",
    color: "bg-sky-50 border-sky-200 text-sky-700",
    dot: "bg-sky-500",
  },
  {
    id: "manufacturing",
    name: "Manufacturing / Process Technology",
    description: "New processes, automation/tech upgrades, scale-ups, new production methods, facility expansions, quality improvements, outsourcing shifts",
    color: "bg-slate-50 border-slate-200 text-slate-700",
    dot: "bg-slate-500",
  },
  {
    id: "sustainability",
    name: "Sustainability / Circular Economy",
    description: "Carbon reduction goals, recycled/bio-based materials, zero-waste initiatives, water reduction, circular programs, sustainability certifications",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    id: "digital",
    name: "Digital / Smart Products",
    description: "Connected products, sensors, AI personalization, apps/platforms, data tracking, software updates, ecosystem integrations",
    color: "bg-violet-50 border-violet-200 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    id: "delivery",
    name: "Delivery Systems / Formats",
    description: "New formats (e.g., gummies, patches), controlled-release tech, bioavailability improvements, multi-phase systems, device-based delivery",
    color: "bg-pink-50 border-pink-200 text-pink-700",
    dot: "bg-pink-500",
  },
  {
    id: "claims",
    name: "Claims / Efficacy / Performance",
    description: "Clinical results, new or upgraded claims, comparative claims, consumer studies, long-term data, regulatory-approved claims",
    color: "bg-indigo-50 border-indigo-200 text-indigo-700",
    dot: "bg-indigo-500",
  },
];

const PIPELINE_STEPS = [
  { label: "RAW SIGNAL", sub: "Normalize / extract entities", color: "bg-gray-100 text-gray-700 border-gray-200" },
  { label: "SCOPE CHECK", sub: "Match to workspace scope", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "RELEVANCE", sub: "Compute relevance score", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { label: "SIGNIFICANCE", sub: "Compute significance score (0–100)", color: "bg-blue-200 text-blue-900 border-blue-400" },
  { label: "IMPACT", sub: "Brand impact score if above threshold", color: "bg-blue-300 text-blue-900 border-blue-500" },
  { label: "INTENT", sub: "Infer intent from corroborating signals", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { label: "ACTION", sub: "Score actionability vs. capabilities", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { label: "ROUTE", sub: "Suppress / Alert / Deep-dive / Plan", color: "bg-green-100 text-green-800 border-green-300" },
];

const THRESHOLDS = [
  { range: "scope < 0.35", action: "Suppress", color: "bg-gray-100 text-gray-600 border-gray-200", icon: "🚫" },
  { range: "significance < 50", action: "Weekly Digest", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "📋" },
  { range: "50 – 74", action: "Alert + Analyst View", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "⚠️" },
  { range: "75+", action: "Urgent Alert + Response Draft", color: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
];

export default function Step2SignalConfig() {
  const [strategicObjectives, setStrategicObjectives] = useState({
    trackCompetitors: true,
    identifyThreats: true,
    supportStrategy: true,
    supportExecution: true,
  });
  const [intentFilters, setIntentFilters] = useState(["Defend premium positioning", "Expand into health segment"]);
  const [intentInput, setIntentInput] = useState("");
  const [positioning, setPositioning] = useState("Premium indulgence with healthier perception");
  const [vulnerabilities, setVulnerabilities] = useState(["Premium pricing risk", "Weak health positioning"]);
  const [vulnInput, setVulnInput] = useState("");
  const [consumers, setConsumers] = useState(["Health-conscious millennials", "Price sensitive"]);
  const [consumerInput, setConsumerInput] = useState("");
  const [selectedSignals, setSelectedSignals] = useState<string[]>(["product", "pricing", "positioning", "formulation", "claims"]);

  const toggleSignal = (id: string) => {
    setSelectedSignals((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    if (input.trim() && !list.includes(input.trim())) {
      setList([...list, input.trim()]);
      setInput("");
    }
  };

  const removeTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.filter((t) => t !== tag));
  };

  return (
    <div>
      {/* Strategic Objectives */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Target size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">a. Strategic Objectives</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "trackCompetitors", label: "Track competitors" },
            { key: "identifyThreats", label: "Identify threats" },
            { key: "supportStrategy", label: "Support strategy decisions" },
            { key: "supportExecution", label: "Support ongoing execution" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() =>
                  setStrategicObjectives((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev],
                  }))
                }
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  strategicObjectives[key as keyof typeof strategicObjectives]
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300 group-hover:border-blue-400"
                }`}
              >
                {strategicObjectives[key as keyof typeof strategicObjectives] && (
                  <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Intent-Based Filtering */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Zap size={15} className="text-purple-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">b. Intent-Based Filtering</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-9">
          System prioritizes signals aligned to stated intent.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {intentFilters.map((tag) => (
            <span key={tag} className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-purple-200">
              "{tag}"
              <button onClick={() => removeTag(intentFilters, setIntentFilters, tag)} className="hover:text-purple-900">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder='e.g., "Expand into health segment"'
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag(intentFilters, setIntentFilters, intentInput, setIntentInput)}
          />
          <button
            onClick={() => addTag(intentFilters, setIntentFilters, intentInput, setIntentInput)}
            className="btn-primary px-4 text-xs"
          >
            Add
          </button>
        </div>
      </div>

      {/* Positioning & Differentiation */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Shield size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">c. Positioning & Differentiation</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">
          Semantic similarity between competitor moves and your positioning statement.
        </p>
        <textarea
          className="input-field resize-none h-16"
          placeholder='e.g., "Premium indulgence with healthier perception"'
          value={positioning}
          onChange={(e) => setPositioning(e.target.value)}
        />
      </div>

      {/* Vulnerabilities → Risk Amplifier */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">d. Vulnerabilities → Risk Amplifier</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">
          Certain signals get amplified when they match identified vulnerabilities.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {vulnerabilities.map((v) => (
            <span key={v} className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertTriangle size={11} />"{v}"
              <button onClick={() => removeTag(vulnerabilities, setVulnerabilities, v)} className="hover:text-red-900">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder='e.g., "Weak distribution in Tier 2 cities"'
            value={vulnInput}
            onChange={(e) => setVulnInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag(vulnerabilities, setVulnerabilities, vulnInput, setVulnInput)}
          />
          <button
            onClick={() => addTag(vulnerabilities, setVulnerabilities, vulnInput, setVulnInput)}
            className="btn-primary px-4 text-xs"
          >
            Add
          </button>
        </div>
      </div>

      {/* Consumer Definition */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
            <Users size={15} className="text-teal-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">e. Consumer Definition</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">Define consumer segments to assess switching risk.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {consumers.map((c) => (
            <span key={c} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
              "{c}"
              <button onClick={() => removeTag(consumers, setConsumers, c)} className="hover:text-teal-900">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input-field flex-1"
            placeholder='e.g., "Value-seeking Gen Z"'
            value={consumerInput}
            onChange={(e) => setConsumerInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag(consumers, setConsumers, consumerInput, setConsumerInput)}
          />
          <button
            onClick={() => addTag(consumers, setConsumers, consumerInput, setConsumerInput)}
            className="btn-primary px-4 text-xs"
          >
            Add
          </button>
        </div>
      </div>

      {/* Signal Category */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
            <Zap size={15} className="text-orange-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Signal Category</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-9">
          Select one or more signal categories to monitor. ({selectedSignals.length} selected)
        </p>
        <div className="grid grid-cols-1 gap-2">
          {SIGNAL_CATEGORIES.map((cat) => {
            const isSelected = selectedSignals.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleSignal(cat.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? cat.color : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                    isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cat.dot} shrink-0`}></span>
                    <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Significance Scoring Pipeline */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            <Info size={15} className="text-gray-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Significance Scoring Pipeline</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-9">
          Each signal flows through a multi-stage scoring process before being routed to an output.
        </p>

        {/* Pipeline flow */}
        <div className="flex items-center gap-1 flex-wrap mb-6">
          {PIPELINE_STEPS.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className={`px-3 py-2 rounded-lg border text-center ${step.color} min-w-[100px]`}>
                <div className="text-[10px] font-bold uppercase tracking-wide">{step.label}</div>
                <div className="text-[9px] mt-0.5 opacity-75 leading-tight">{step.sub}</div>
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <ArrowRight size={12} className="text-gray-400 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Scoring weights */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Significance Score Weights</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Scope Relevance", weight: "30%", desc: "Category, geo, channel, competitor match" },
              { label: "Materiality", weight: "30%", desc: "Event type magnitude and scale" },
              { label: "Proximity", weight: "20%", desc: "How close the competitor is to your core" },
              { label: "Velocity", weight: "20%", desc: "Rate of change vs. historical baseline" },
            ].map(({ label, weight, desc }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-blue-600">{weight}</span>
                </div>
                <p className="text-[10px] text-gray-400">{desc}</p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: weight }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionability thresholds */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Routing Thresholds</h3>
          <div className="grid grid-cols-4 gap-2">
            {THRESHOLDS.map(({ range, action, color, icon }) => (
              <div key={range} className={`rounded-xl border p-3 text-center ${color}`}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-xs font-bold">{range}</div>
                <div className="text-[10px] font-semibold mt-1 opacity-80">{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionability thresholds */}
        <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Actionability Score</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { range: "< 40", label: "Explain Only", color: "bg-gray-100 text-gray-700" },
              { range: "40 – 69", label: "Suggest Options", color: "bg-yellow-100 text-yellow-700" },
              { range: "70+", label: "Generate Plan + Owners", color: "bg-green-100 text-green-700" },
            ].map(({ range, label, color }) => (
              <div key={range} className={`rounded-lg p-2.5 text-center ${color}`}>
                <div className="text-sm font-bold">{range}</div>
                <div className="text-[10px] font-semibold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
