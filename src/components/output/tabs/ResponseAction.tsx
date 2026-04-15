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

const RESPONSE_LEVERS = [
  {
    id: "product",
    title: "1. PRODUCT & INNOVATION",
    icon: Package,
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-600",
    options: [
      {
        id: "A",
        name: "Accelerate low-sugar variant launch",
        timeline: "90 days",
        effort: "High",
        impact: "High",
        effortColor: "bg-red-100 text-red-700",
        impactColor: "bg-green-100 text-green-700",
      },
      {
        id: "B",
        name: "Reformulate existing SKU with clean-label ingredients",
        timeline: "60 days",
        effort: "Medium",
        impact: "High",
        effortColor: "bg-yellow-100 text-yellow-700",
        impactColor: "bg-green-100 text-green-700",
      },
      {
        id: "C",
        name: "Launch limited-edition 'health halo' variant for trial",
        timeline: "45 days",
        effort: "Low",
        impact: "Medium",
        effortColor: "bg-green-100 text-green-700",
        impactColor: "bg-yellow-100 text-yellow-700",
      },
    ],
  },
  {
    id: "pricing",
    title: "2. PRICING & PROMOTION",
    icon: DollarSign,
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-600",
    options: [
      {
        id: "A",
        name: "Introduce bundle pricing in Tier 1 cities (pack of 3 + 1 free)",
        timeline: "30 days",
        effort: "Low",
        impact: "Medium",
        effortColor: "bg-green-100 text-green-700",
        impactColor: "bg-yellow-100 text-yellow-700",
      },
      {
        id: "B",
        name: "Increase promotional frequency by 20% across modern trade",
        timeline: "45 days",
        effort: "Medium",
        impact: "Medium",
        effortColor: "bg-yellow-100 text-yellow-700",
        impactColor: "bg-yellow-100 text-yellow-700",
      },
    ],
  },
  {
    id: "messaging",
    title: "3. MESSAGING",
    icon: MessageSquare,
    color: "bg-purple-50 border-purple-200",
    headerColor: "bg-purple-600",
    options: [
      {
        id: "A",
        name: "Shift campaign narrative to 'real ingredients, real goodness'",
        timeline: "21 days",
        effort: "Low",
        impact: "High",
        effortColor: "bg-green-100 text-green-700",
        impactColor: "bg-green-100 text-green-700",
      },
      {
        id: "B",
        name: "Counter artificial sweetener perception with transparent label campaign",
        timeline: "30 days",
        effort: "Medium",
        impact: "High",
        effortColor: "bg-yellow-100 text-yellow-700",
        impactColor: "bg-green-100 text-green-700",
      },
    ],
  },
  {
    id: "distribution",
    title: "4. DISTRIBUTION",
    icon: Truck,
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-500",
    options: [
      {
        id: "A",
        name: "Secure premium shelf placement in top 500 modern trade outlets",
        timeline: "60 days",
        effort: "High",
        impact: "High",
        effortColor: "bg-red-100 text-red-700",
        impactColor: "bg-green-100 text-green-700",
      },
      {
        id: "B",
        name: "Increase product visibility in health & wellness aisle",
        timeline: "45 days",
        effort: "Medium",
        impact: "Medium",
        effortColor: "bg-yellow-100 text-yellow-700",
        impactColor: "bg-yellow-100 text-yellow-700",
      },
    ],
  },
];

const ACTION_PLAN = [
  {
    period: "Week 1–2",
    color: "bg-blue-600",
    tasks: [
      { task: "Evaluate promo elasticity across Tier 1 cities", team: "Pricing", owner: "Rahul M." },
      { task: "Update campaign messaging to 'natural ingredients' angle", team: "Marketing", owner: "Priya S." },
      { task: "Brief agency on counter-messaging for artificial sweetener risk", team: "Marketing", owner: "Priya S." },
    ],
  },
  {
    period: "Week 3–6",
    color: "bg-purple-600",
    tasks: [
      { task: "Feasibility study on clean-label reformulation", team: "Product", owner: "Anita K." },
      { task: "Identify top 500 modern trade targets for premium shelf placement", team: "Sales", owner: "Vikram D." },
      { task: "Negotiate bundle pricing mechanics with key retailers", team: "Trade Marketing", owner: "Rahul M." },
    ],
  },
  {
    period: "Week 7–12",
    color: "bg-green-600",
    tasks: [
      { task: "Launch reformulated or new low-sugar variant (pilot, 3 cities)", team: "Product", owner: "Anita K." },
      { task: "Activate full campaign with updated positioning", team: "Marketing", owner: "Priya S." },
      { task: "Review shelf-execution and distribution metrics", team: "Sales", owner: "Vikram D." },
    ],
  },
];

export default function ResponseAction() {
  const [expandedLevers, setExpandedLevers] = useState<string[]>(["product", "messaging"]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({
    product: "B",
    pricing: "A",
    messaging: "A",
    distribution: "A",
  });
  const [approved, setApproved] = useState(false);

  const toggleLever = (id: string) => {
    setExpandedLevers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Strategic Objective */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Target size={18} className="text-blue-200" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Strategic Objective
          </span>
        </div>
        <h2 className="text-lg font-bold leading-snug">
          &quot;Defend premium health-conscious segment in India against emerging low-sugar and
          clean-label competitive threats&quot;
        </h2>
        <div className="flex items-center gap-4 mt-3">
          {[
            { label: "Impact Score", value: "82", icon: Zap },
            { label: "Response Window", value: "30–90 days", icon: Clock },
            { label: "Confidence", value: "High", icon: Target },
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
        {RESPONSE_LEVERS.map((lever) => {
          const LeverIcon = lever.icon;
          const isExpanded = expandedLevers.includes(lever.id);

          return (
            <div key={lever.id} className={`rounded-xl border ${lever.color} overflow-hidden`}>
              <button
                onClick={() => toggleLever(lever.id)}
                className="w-full flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${lever.headerColor} flex items-center justify-center`}>
                    <LeverIcon size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{lever.title}</span>
                  <span className="text-xs text-gray-500">
                    {lever.options.length} option{lever.options.length > 1 ? "s" : ""}
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  {lever.options.map((opt) => {
                    const isSelected = selectedOptions[lever.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [lever.id]: opt.id }))
                        }
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500 bg-white shadow-sm"
                            : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 mb-1.5">
                                Option {opt.id}: {opt.name}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar size={11} />
                                  <span>Timeline: <strong className="text-gray-700">{opt.timeline}</strong></span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.effortColor}`}
                                >
                                  Effort: {opt.effort}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.impactColor}`}
                                >
                                  Impact: {opt.impact}
                                </span>
                              </div>
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
          {ACTION_PLAN.map(({ period, color, tasks }) => (
            <div key={period}>
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm font-bold text-gray-800">{period}</span>
              </div>
              <div className="space-y-2 pl-5">
                {tasks.map(({ task, team, owner }) => (
                  <div
                    key={task}
                    className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl"
                  >
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

      {/* Owners Summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-gray-500" />
          <h3 className="font-bold text-gray-900 text-sm">Owners</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name: "Rahul M.", role: "Pricing & Trade Marketing", initial: "R", color: "bg-blue-600" },
            { name: "Priya S.", role: "Marketing & Messaging", initial: "P", color: "bg-purple-600" },
            { name: "Anita K.", role: "Product & R&D", initial: "A", color: "bg-green-600" },
            { name: "Vikram D.", role: "Sales & Distribution", initial: "V", color: "bg-orange-600" },
          ].map(({ name, role, initial, color }) => (
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
            All actions linked to impact drivers & evidence signals
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Pepsi low-sugar launch (Impact: 82)",
            "ITC promo surge (Impact: 68)",
            "Nestlé clean-label patent (Impact: 71)",
            "Britannia rice cracker (Impact: 73)",
            "Mondelez 'natural' messaging (Impact: 66)",
          ].map((evidence) => (
            <span
              key={evidence}
              className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-600 font-medium"
            >
              {evidence}
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
          <span className="text-sm text-green-600 font-medium">
            Plan approved and ready for execution.
          </span>
        )}
      </div>
    </div>
  );
}
