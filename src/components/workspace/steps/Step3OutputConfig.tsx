"use client";

import { useState } from "react";
import { Bell, Mail, Monitor, Shield, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";

const PROTECT_GROW_OPTIONS = [
  { id: "defend-premium", label: "Defend premium positioning", icon: Shield, color: "text-purple-600" },
  { id: "expand-health", label: "Expand into health-conscious segment", icon: TrendingUp, color: "text-green-600" },
  { id: "grow-distribution", label: "Grow distribution in modern trade", icon: ShoppingBag, color: "text-blue-600" },
  { id: "improve-price", label: "Improve price competitiveness", icon: DollarSign, color: "text-orange-600" },
];

export default function Step3OutputConfig() {
  const [protectGrow, setProtectGrow] = useState(["defend-premium", "expand-health"]);
  const [alertThreshold, setAlertThreshold] = useState("medium-high");
  const [alertChannels, setAlertChannels] = useState(["email", "in-app"]);

  const toggleProtectGrow = (id: string) => {
    setProtectGrow((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleChannel = (id: string) => {
    setAlertChannels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* What to protect or grow */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Shield size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">What are you trying to protect or grow?</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PROTECT_GROW_OPTIONS.map(({ id, label, icon: Icon, color }) => {
            const selected = protectGrow.includes(id);
            return (
              <div
                key={id}
                onClick={() => toggleProtectGrow(id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                  }`}
                >
                  {selected && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </div>
                <Icon size={16} className={`${color} shrink-0`} />
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Threshold */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Bell size={15} className="text-amber-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Alert Threshold</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              id: "all",
              label: "All activity",
              description: "Receive alerts for all detected signals regardless of impact score",
              badge: null,
            },
            {
              id: "medium-high",
              label: "Medium + High impact",
              description: "Alerts for signals with impact score ≥ 50 (recommended)",
              badge: { label: "Recommended", color: "bg-green-100 text-green-700" },
            },
            {
              id: "high-only",
              label: "Only high-impact strategic moves",
              description: "Urgent alerts only for signals with impact score ≥ 75",
              badge: null,
            },
          ].map(({ id, label, description, badge }) => (
            <label
              key={id}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                alertThreshold === id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  alertThreshold === id ? "border-blue-600" : "border-gray-300"
                }`}
                onClick={() => setAlertThreshold(id)}
              >
                {alertThreshold === id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>
              <div className="flex-1" onClick={() => setAlertThreshold(id)}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                  {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Alert Channels */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
            <Mail size={15} className="text-green-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Alert Channels</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: "email",
              label: "Email",
              description: "Receive alerts to admin@example.com",
              icon: Mail,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
            },
            {
              id: "in-app",
              label: "In-app",
              description: "Notifications inside the IntelHub platform",
              icon: Monitor,
              iconBg: "bg-purple-50",
              iconColor: "text-purple-600",
            },
          ].map(({ id, label, description, icon: Icon, iconBg, iconColor }) => {
            const selected = alertChannels.includes(id);
            return (
              <div
                key={id}
                onClick={() => toggleChannel(id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selected ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-400">{description}</div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    selected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                  }`}
                >
                  {selected && (
                    <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output Dashboard Preview */}
      <div className="section-card border-2 border-blue-100 bg-blue-50/30">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <Monitor size={15} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Output Dashboard Preview</h2>
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">4 Tabs</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              tab: "Tab 1",
              name: "Competitors Radar",
              desc: "Priority feeds, market signals, competitor momentum, weekly brief",
              color: "border-blue-200 bg-blue-50",
              badge: "bg-blue-100 text-blue-700",
            },
            {
              tab: "Tab 2",
              name: "Event Intelligence",
              desc: "Full event log with significance & impact scores, filterable by type",
              color: "border-purple-200 bg-purple-50",
              badge: "bg-purple-100 text-purple-700",
            },
            {
              tab: "Tab 3",
              name: "Impact Analysis",
              desc: "Visual breakdown of impact scores, brand threats, and trend momentum",
              color: "border-orange-200 bg-orange-50",
              badge: "bg-orange-100 text-orange-700",
            },
            {
              tab: "Tab 4",
              name: "Response Action",
              desc: "Strategic response levers, action plan with owners, and approval flow",
              color: "border-green-200 bg-green-50",
              badge: "bg-green-100 text-green-700",
            },
          ].map(({ tab, name, desc, color, badge }) => (
            <div key={tab} className={`rounded-xl border p-4 ${color}`}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{tab}</span>
              <div className="text-sm font-bold text-gray-900 mt-2 mb-1">{name}</div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
