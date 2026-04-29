"use client";

import { useState } from "react";
import {
  Target,
  Package,
  DollarSign,
  MessageSquare,
  Truck,
  Calendar,
  User,
  Link,
  CheckCircle,
  Edit,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
} from "lucide-react";
import type { CategoryType } from "../OutputDashboard";
import type { StoredConfig } from "@/lib/types";
import {
  buildResponseLevers,
  buildActionPlan,
  detectCatGroup,
  DEFAULT_COMPETITORS,
} from "@/lib/dynamicEvents";

type LucideIcon = typeof Package;

const LEVER_META: Record<string, { icon: LucideIcon; color: string; headerColor: string }> = {
  product:      { icon: Package,       color: "bg-blue-50 border-blue-200",    headerColor: "bg-blue-600"   },
  pricing:      { icon: DollarSign,    color: "bg-green-50 border-green-200",  headerColor: "bg-green-600"  },
  messaging:    { icon: MessageSquare, color: "bg-purple-50 border-purple-200", headerColor: "bg-purple-600" },
  distribution: { icon: Truck,         color: "bg-orange-50 border-orange-200", headerColor: "bg-orange-500" },
};

const CAT_IMPACT: Partial<Record<string, number>> = {
  pc: 85, confectionery: 79, beverage: 83, dairy: 76, fmcg: 78,
};

const OWNERS = [
  { name: "Marketing Lead",  role: "Brand & Messaging",    initial: "M",  color: "bg-blue-600"   },
  { name: "Product Lead",    role: "Innovation & R&D",      initial: "P",  color: "bg-purple-600" },
  { name: "Sales Lead",      role: "Distribution & Trade",  initial: "S",  color: "bg-green-600"  },
  { name: "Pricing Lead",    role: "Pricing & Promotions",  initial: "Pr", color: "bg-orange-600" },
];

interface Props {
  category: CategoryType;
  config?: StoredConfig | null;
}

export default function ResponseAction({ category, config }: Props) {
  const hasDynamic = !!config?.category;
  const catG = hasDynamic
    ? detectCatGroup(config!.category)
    : category === "pc" ? "pc" : "fmcg";

  const fallback: StoredConfig = {
    category:      category === "pc" ? "PC & Laptops" : "Snacks & Food",
    subCategory:   category === "pc" ? "Touchscreen Laptops" : "Health & Wellness Snacks",
    region:        "South Asia",
    country:       "India",
    competitors:   DEFAULT_COMPETITORS[catG],
    intentFilters: ["Defend market share"],
  };
  const cfg = hasDynamic ? config! : fallback;

  const levers     = buildResponseLevers(cfg);
  const actionPlan = buildActionPlan(cfg);

  const competitors  = cfg.competitors.length ? cfg.competitors : DEFAULT_COMPETITORS[catG];
  const impactScore  = CAT_IMPACT[catG] ?? 80;
  const sub          = cfg.subCategory || cfg.category;
  const objectiveText = cfg.positioning?.trim()
    ? cfg.positioning
    : `Defend ${sub} segment against competitive threats from ${competitors.slice(0, 2).join(" and ")}`;

  const evidence = competitors.slice(0, 5).map((c, i) => (
    `${c} — competitive signal detected (Impact: ${impactScore - i * 4})`
  ));

  const [expandedLevers, setExpandedLevers] = useState<string[]>(["product", "messaging"]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    { product: "B", pricing: "A", messaging: "A", distribution: "A" }
  );
  const [approved, setApproved] = useState(false);

  const toggleLever = (id: string) =>
    setExpandedLevers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-5">
      {/* Strategic Objective */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Target size={18} className="text-blue-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Strategic Objective</span>
        </div>
        <h2 className="text-lg font-bold leading-snug">&quot;{objectiveText}&quot;</h2>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: "Impact Score",     value: String(impactScore), icon: Zap    },
            { label: "Response Window",  value: "30–90 days",        icon: Clock  },
            { label: "Confidence",       value: "High",              icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <Icon size={13} className="text-blue-200" />
              <span className="text-xs text-blue-100">{label}:</span>
              <span className="text-xs font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response Levers */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Response Levers</h3>
        {levers.map(lever => {
          const meta = LEVER_META[lever.id] ?? {
            icon: Package,
            color: "bg-gray-50 border-gray-200",
            headerColor: "bg-gray-600",
          };
          const LeverIcon = meta.icon;
          const isExpanded = expandedLevers.includes(lever.id);

          return (
            <div key={lever.id} className={`rounded-xl border ${meta.color} overflow-hidden`}>
              <button
                onClick={() => toggleLever(lever.id)}
                className="w-full flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${meta.headerColor} flex items-center justify-center`}>
                    <LeverIcon size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{lever.title}</span>
                  <span className="text-xs text-gray-500">
                    {lever.options.length} option{lever.options.length > 1 ? "s" : ""}
                  </span>
                </div>
                {isExpanded
                  ? <ChevronUp size={16} className="text-gray-400" />
                  : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  {lever.options.map(opt => {
                    const isSelected = selectedOptions[lever.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setSelectedOptions(prev => ({ ...prev, [lever.id]: opt.id }))
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-white shadow-sm"
                            : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 mb-1.5">
                              Option {opt.id}: {opt.name}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={11} />
                                <span>Timeline: <strong className="text-gray-700">{opt.timeline}</strong></span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.effortColor}`}>
                                Effort: {opt.effort}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.impactColor}`}>
                                Impact: {opt.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Plan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">Action Plan (Operational Mode)</h3>
        </div>
        <div className="space-y-4">
          {actionPlan.map(({ period, color, tasks }) => (
            <div key={period}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm font-bold text-gray-800">{period}</span>
              </div>
              <div className="space-y-2 pl-5">
                {tasks.map(({ task, team, owner }) => (
                  <div key={task} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <span className="text-sm text-gray-700">{task}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                      <span className="bg-gray-200 px-2 py-0.5 rounded font-semibold">{team}</span>
                      <div className="flex items-center gap-1">
                        <User size={11} />
                        <span>{owner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owners */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm">Owners</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {OWNERS.map(({ name, role, initial, color }) => (
            <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                <span className="text-white font-bold text-sm">{initial}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{name}</div>
                <div className="text-[11px] text-gray-400">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Links */}
      <div className="bg-slate-50 rounded-xl border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link size={14} className="text-gray-500" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            All actions linked to impact drivers &amp; evidence signals
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {evidence.map(e => (
            <span key={e} className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-600 font-medium">
              {e}
            </span>
          ))}
        </div>
      </div>

      {/* Approve / Edit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setApproved(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            approved
              ? "bg-green-100 text-green-700 border-2 border-green-300"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <CheckCircle size={16} />
          {approved ? "Plan Approved ✓" : "Approve Plan"}
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <Edit size={16} />
          Edit
        </button>
        {approved && (
          <span className="text-sm text-green-600 font-medium">Plan approved and ready for execution.</span>
        )}
      </div>
    </div>
  );
}
