"use client";

import { useState } from "react";
import { Bell, Mail, Monitor, Shield, TrendingUp, ShoppingBag, DollarSign, Plus, X, Users, Zap, Target } from "lucide-react";
import type { WorkspaceSummary } from "../CreateWorkspace";

// ─── PROTECT / GROW OPTIONS (dynamic per category) ───────────────────────────

interface ProtectGrowOption {
  id: string;
  label: string;
  icon: typeof Shield;
  color: string;
}

function getProtectGrowOptions(summary?: WorkspaceSummary): ProtectGrowOption[] {
  const cat = summary?.step1.category.toLowerCase() ?? "";
  if (cat.includes("pc") || cat.includes("laptop") || cat.includes("electron")) {
    return [
      { id: "defend-premium",    label: "Defend premium touchscreen segment",   icon: Shield,      color: "text-purple-600" },
      { id: "expand-enterprise", label: "Expand enterprise B2B presence",        icon: TrendingUp,  color: "text-blue-600" },
      { id: "grow-distribution", label: "Grow retail distribution in APAC",      icon: ShoppingBag, color: "text-orange-600" },
      { id: "counter-oled",      label: "Counter OLED adoption wave from rivals", icon: Zap,         color: "text-red-600" },
    ];
  }
  if (cat.includes("snack") || cat.includes("food") || cat.includes("bever") || cat.includes("dairy")) {
    return [
      { id: "defend-premium",    label: "Defend premium shelf positioning",           icon: Shield,      color: "text-purple-600" },
      { id: "expand-health",     label: "Expand into health-conscious segment",        icon: TrendingUp,  color: "text-green-600" },
      { id: "grow-distribution", label: "Grow distribution in modern trade",           icon: ShoppingBag, color: "text-blue-600" },
      { id: "improve-price",     label: "Improve price competitiveness",               icon: DollarSign,  color: "text-orange-600" },
    ];
  }
  // Default options
  return [
    { id: "defend-core",       label: "Defend core market positioning",     icon: Shield,      color: "text-purple-600" },
    { id: "expand-segment",    label: "Expand into adjacent segments",       icon: TrendingUp,  color: "text-green-600" },
    { id: "grow-distribution", label: "Grow channel distribution",          icon: ShoppingBag, color: "text-blue-600" },
    { id: "improve-price",     label: "Improve price competitiveness",      icon: DollarSign,  color: "text-orange-600" },
  ];
}

// ─── SIGNAL CATEGORY DISPLAY MAP ─────────────────────────────────────────────

const SIGNAL_DISPLAY: Record<string, string> = {
  product: "Product & Innovation", pricing: "Pricing & Commercial",
  positioning: "Market Positioning", distribution: "Distribution & Access",
  org: "Organisational Signals", regulatory: "Regulatory & Legal",
  formulation: "Formulation / Ingredients", packaging: "Packaging & Materials",
  digital: "Digital / Smart Products", claims: "Claims / Performance",
  sustainability: "Sustainability", manufacturing: "Manufacturing",
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface Props {
  summaryData?: WorkspaceSummary;
}

export default function Step3OutputConfig({ summaryData }: Props) {
  const options = getProtectGrowOptions(summaryData);

  const [protectGrow, setProtectGrow]         = useState<string[]>([options[0].id]);
  const [customProtectGrow, setCustomProtectGrow] = useState<string[]>([]);
  const [addingProtectGrow, setAddingProtectGrow] = useState(false);
  const [newProtectGrowInput, setNewProtectGrowInput] = useState("");

  const [alertThreshold, setAlertThreshold]   = useState("medium-high");
  const [alertChannels, setAlertChannels]     = useState(["email", "in-app"]);

  const toggleProtectGrow = (id: string) =>
    setProtectGrow(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleChannel = (id: string) =>
    setAlertChannels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addCustom = () => {
    const t = newProtectGrowInput.trim();
    if (t && !customProtectGrow.includes(t)) setCustomProtectGrow([...customProtectGrow, t]);
    setNewProtectGrowInput(""); setAddingProtectGrow(false);
  };

  // Derived context strings for preview
  const step1 = summaryData?.step1;
  const step2 = summaryData?.step2;

  const allCompetitors = step1
    ? [...step1.primaryCompetitors, ...step1.brands.slice(0, 3), ...step1.secondaryCompetitors]
        .filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)
    : [];

  const signalNames = (step2?.selectedSignals ?? [])
    .map(id => SIGNAL_DISPLAY[id] ?? id)
    .slice(0, 4);

  const topIntents = (step2?.intentFilters ?? []).slice(0, 2);
  const allProtectGrowLabels = [
    ...options.filter(o => protectGrow.includes(o.id)).map(o => o.label),
    ...customProtectGrow,
  ];

  return (
    <div>

      {/* ── What to protect or grow ─────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Shield size={15} className="text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-900">What are you trying to protect or grow?</h2>
        </div>
        {step1?.subCategory && (
          <p className="text-xs text-blue-600 font-semibold mb-4 ml-9">
            Options tailored for: {step1.subCategory || step1.category}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          {options.map(({ id, label, icon: Icon, color }) => {
            const selected = protectGrow.includes(id);
            return (
              <div key={id} onClick={() => toggleProtectGrow(id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                  {selected && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
                </div>
                <Icon size={16} className={`${color} shrink-0`} />
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Custom protect/grow goals */}
        {customProtectGrow.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {customProtectGrow.map(goal => (
              <span key={goal} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <Target size={10} className="text-blue-500" />
                {goal}
                <button onClick={() => setCustomProtectGrow(customProtectGrow.filter(g => g !== goal))} className="hover:text-blue-900"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {addingProtectGrow ? (
          <div className="flex gap-2">
            <input autoFocus className="input-field flex-1 text-sm"
              placeholder='e.g., "Defend market share in Southeast Asia"'
              value={newProtectGrowInput}
              onChange={e => setNewProtectGrowInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addCustom(); if (e.key === "Escape") { setAddingProtectGrow(false); setNewProtectGrowInput(""); } }}
            />
            <button onClick={addCustom} className="btn-primary px-3 text-xs">Add</button>
            <button onClick={() => { setAddingProtectGrow(false); setNewProtectGrowInput(""); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 text-sm"><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setAddingProtectGrow(true)} className="flex items-center gap-2 text-xs text-blue-600 font-semibold hover:text-blue-800">
            <Plus size={13} /> Define your own goal
          </button>
        )}
      </div>

      {/* ── Alert Threshold ─────────────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><Bell size={15} className="text-amber-600" /></div>
          <h2 className="text-base font-bold text-gray-900">Alert Threshold</h2>
        </div>
        <div className="space-y-3">
          {[
            { id: "all",         label: "All activity",                      description: "Alerts for all detected signals regardless of impact score",              badge: null },
            { id: "medium-high", label: "Medium + High impact",              description: "Alerts for signals with impact score ≥ 50 (recommended)",                badge: { label: "Recommended", color: "bg-green-100 text-green-700" } },
            { id: "high-only",   label: "Only high-impact strategic moves",  description: "Urgent alerts only for signals with impact score ≥ 75",                  badge: null },
          ].map(({ id, label, description, badge }) => (
            <label key={id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${alertThreshold === id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${alertThreshold === id ? "border-blue-600" : "border-gray-300"}`}
                onClick={() => setAlertThreshold(id)}>
                {alertThreshold === id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
              </div>
              <div className="flex-1" onClick={() => setAlertThreshold(id)}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                  {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Alert Channels ──────────────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center"><Mail size={15} className="text-green-600" /></div>
          <h2 className="text-base font-bold text-gray-900">Alert Channels</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "email",  label: "Email",  description: "Receive alerts to your registered email",  icon: Mail,    iconBg: "bg-blue-50",   iconColor: "text-blue-600" },
            { id: "in-app", label: "In-app", description: "Notifications inside the ForeSight platform", icon: Monitor, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
          ].map(({ id, label, description, icon: Icon, iconBg, iconColor }) => {
            const selected = alertChannels.includes(id);
            return (
              <div key={id} onClick={() => toggleChannel(id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}><Icon size={18} className={iconColor} /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-400">{description}</div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                  {selected && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Output Dashboard Preview (dynamic) ──────────────────────────── */}
      <div className="section-card border-2 border-blue-100 bg-blue-50/30">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><Monitor size={15} className="text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-900">Output Dashboard Preview</h2>
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">4 Tabs</span>
          {summaryData?.step1.category && (
            <span className="ml-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {summaryData.step1.subCategory || summaryData.step1.category}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">

          {/* Tab 1 — Competitors Radar */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Tab 1</span>
            <div className="text-sm font-bold text-gray-900 mt-2 mb-1">Competitors Radar</div>
            <p className="text-[11px] text-gray-500 mb-2">Priority feeds, market signals, competitor momentum, weekly brief</p>
            {allCompetitors.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {allCompetitors.map(c => (
                  <span key={c} className="text-[10px] bg-white border border-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic">Add competitors in Step 1 to see them tracked here</p>
            )}
          </div>

          {/* Tab 2 — Event Intelligence */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Tab 2</span>
            <div className="text-sm font-bold text-gray-900 mt-2 mb-1">Event Intelligence</div>
            <p className="text-[11px] text-gray-500 mb-2">Full event log with significance & impact scores, filterable by type</p>
            {signalNames.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {signalNames.map(name => (
                  <span key={name} className="text-[10px] bg-white border border-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{name}</span>
                ))}
                {(step2?.selectedSignals.length ?? 0) > 4 && (
                  <span className="text-[10px] bg-purple-100 text-purple-500 font-semibold px-2 py-0.5 rounded-full">+{(step2?.selectedSignals.length ?? 0) - 4} more</span>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic">Configure signal categories in Step 2</p>
            )}
          </div>

          {/* Tab 3 — Impact Analysis */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Tab 3</span>
            <div className="text-sm font-bold text-gray-900 mt-2 mb-1">Impact Analysis</div>
            <p className="text-[11px] text-gray-500 mb-2">Visual breakdown of impact scores, brand threats, and trend momentum</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {step1?.region && step1.region !== "Global" ? (
                <>
                  <span className="text-[10px] bg-white border border-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{step1.region}</span>
                  {step1.country && <span className="text-[10px] bg-white border border-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{step1.country}</span>}
                </>
              ) : (
                <p className="text-[10px] text-gray-400 italic">Set market in Step 1 to scope impact analysis</p>
              )}
            </div>
          </div>

          {/* Tab 4 — Response Action */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Tab 4</span>
            <div className="text-sm font-bold text-gray-900 mt-2 mb-1">Response Action</div>
            <p className="text-[11px] text-gray-500 mb-2">Strategic response levers, action plan with owners, and approval flow</p>
            {allProtectGrowLabels.length > 0 || topIntents.length > 0 ? (
              <div className="space-y-1 mt-2">
                {allProtectGrowLabels.slice(0, 2).map(goal => (
                  <div key={goal} className="flex items-center gap-1.5 text-[10px] text-green-700">
                    <Shield size={9} className="shrink-0" />
                    <span className="font-semibold truncate">{goal}</span>
                  </div>
                ))}
                {topIntents.slice(0, 1).map(intent => (
                  <div key={intent} className="flex items-center gap-1.5 text-[10px] text-green-600">
                    <Users size={9} className="shrink-0" />
                    <span className="italic truncate">{intent}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic">Define goals above + intents in Step 2</p>
            )}
          </div>
        </div>

        {/* Summary strip */}
        <div className="bg-white/80 rounded-xl border border-blue-100 px-4 py-3 flex items-center gap-6 flex-wrap">
          {[
            { icon: Target,    label: "Category",    value: step1?.subCategory || step1?.category || "Not set" },
            { icon: Users,     label: "Competitors", value: allCompetitors.length > 0 ? `${allCompetitors.length} tracked` : "None added" },
            { icon: Zap,       label: "Signals",     value: step2?.selectedSignals.length ? `${step2.selectedSignals.length} categories` : "None selected" },
            { icon: Shield,    label: "Market",      value: step1?.region && step1.region !== "Global" ? (step1.country || step1.region) : "Global" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} className="text-blue-400 shrink-0" />
              <span className="text-[11px] text-gray-400">{label}:</span>
              <span className="text-[11px] font-bold text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
