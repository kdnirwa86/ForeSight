"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Download,
  Send,
  CheckCircle,
  Clock,
  Radar,
  Zap,
  BarChart2,
  Target,
  ChevronDown,
  Edit,
  X,
  Copy,
  Check,
} from "lucide-react";
import CompetitorsRadar from "./tabs/CompetitorsRadar";
import EventIntelligence from "./tabs/EventIntelligence";
import ImpactAnalysis from "./tabs/ImpactAnalysis";
import ResponseAction from "./tabs/ResponseAction";
import type { StoredConfig } from "@/lib/types";

// Re-export so existing tab imports keep working
export type { StoredConfig };
export type CategoryType = "pc" | "snacks";

const TABS = [
  { id: "radar",    label: "Competitors Radar",  icon: Radar    },
  { id: "events",   label: "Event Intelligence", icon: Zap      },
  { id: "impact",   label: "Impact Analysis",    icon: BarChart2 },
  { id: "response", label: "Response Action",    icon: Target   },
];

const STATUS_OPTIONS = ["Analyst Reviewed", "Pending Review", "In Progress"];

interface Props { workspaceId: string; }

function catFromString(cat: string): CategoryType {
  const c = cat.toLowerCase();
  if (c.includes("pc") || c.includes("laptop") || c.includes("electron") || c.includes("tablet")) return "pc";
  return "snacks";
}

// Default configs for static demo workspaces so all tabs get real dynamic data
const STATIC_CONFIGS: Record<string, StoredConfig> = {
  "1": { category: "PC & Laptops", subCategory: "Touchscreen Laptops", region: "South Asia", country: "India", competitors: ["Microsoft", "Dell", "ASUS", "HP", "Lenovo", "Samsung"], intentFilters: ["Defend premium segment", "Track product launches"], positioning: "Premium touchscreen laptops for creators and enterprise", vulnerabilities: ["OLED adoption wave", "Enterprise ecosystem lock-in"], consumers: ["Enterprise IT buyers", "Creative professionals"], selectedSignals: ["product", "digital", "pricing", "distribution", "positioning", "org"] },
  "2": { category: "PC & Laptops", subCategory: "Touchscreen Laptops", region: "South Asia", country: "India", competitors: ["Microsoft", "Dell", "ASUS", "HP", "Lenovo"], intentFilters: ["Track competitor moves"], positioning: "Premium touchscreen laptops for creators", vulnerabilities: ["OLED adoption", "Retail exclusivity"], consumers: ["Creative professionals", "Business users"], selectedSignals: ["product", "digital", "pricing", "distribution"] },
  "3": { category: "Snacks & Food", subCategory: "Crackers & Crisp Breads", region: "South Asia", country: "India", competitors: ["Britannia", "Parle", "ITC", "Nestlé", "McVitie's"], intentFilters: ["Defend premium crackers segment", "Monitor health claims"], positioning: "Premium crackers brand focused on taste and quality", vulnerabilities: ["Health & wellness trend", "Private label growth"], consumers: ["Health-conscious snackers", "Premium households"], selectedSignals: ["product", "pricing", "positioning", "formulation", "distribution"] },
  "4": { category: "Snacks & Food", subCategory: "Chocolate & Confectionery", region: "Global", country: "India", competitors: ["Cadbury", "Ferrero", "Nestlé", "Mars", "Lindt"], intentFilters: ["Track premium positioning", "Monitor reformulations"], positioning: "Premium chocolate brand focused on indulgence and gifting", vulnerabilities: ["Sugar reduction trend", "Clean-label pressure"], consumers: ["Premium gift buyers", "Indulgence seekers"], selectedSignals: ["product", "pricing", "positioning", "formulation", "packaging"] },
  "5": { category: "Snacks & Food", subCategory: "Health & Wellness Snacks", region: "South Asia", country: "India", competitors: ["Kind Snacks", "RXBar", "Nature Valley", "Kashi", "Clif Bar"], intentFilters: ["Track health claims", "Monitor reformulations"], positioning: "Functional health snack focused on clean ingredients", vulnerabilities: ["Crowded health segment", "Claim credibility"], consumers: ["Fitness enthusiasts", "Health-conscious millennials"], selectedSignals: ["product", "claims", "formulation", "positioning", "packaging"] },
  "6": { category: "Snacks & Food", subCategory: "Savoury Snacks", region: "South Asia", country: "India", competitors: ["Pepsi (Lay's)", "ITC (Bingo)", "Pringles", "Doritos", "Kettle Brand"], intentFilters: ["Track distribution moves", "Monitor pricing"], positioning: "Premium savoury snack brand", vulnerabilities: ["Distribution gap in Tier 2", "Pricing pressure"], consumers: ["Young adults", "On-the-go snackers"], selectedSignals: ["distribution", "pricing", "product", "positioning"] },
  "7": { category: "Beverages", subCategory: "Carbonated Drinks", region: "Global", country: "India", competitors: ["Coca-Cola", "PepsiCo", "Thums Up", "Sprite", "Mountain Dew"], intentFilters: ["Track beverage trends", "Monitor pricing"], positioning: "Leading carbonated beverage brand in India", vulnerabilities: ["Health trend away from sugar", "Premiumisation"], consumers: ["Young adults", "Mass market consumers"], selectedSignals: ["product", "pricing", "positioning", "distribution", "digital"] },
  "8": { category: "Snacks & Food", subCategory: "Bakery & Biscuits", region: "South Asia", country: "India", competitors: ["Britannia", "Parle", "ITC Sunfeast", "McVitie's", "Oreo"], intentFilters: ["Track sustainable packaging", "Monitor reformulations"], positioning: "Trusted biscuit brand with strong distribution", vulnerabilities: ["Sustainability pressure", "Clean-label demand"], consumers: ["Families", "Budget-conscious shoppers"], selectedSignals: ["packaging", "product", "formulation", "distribution"] },
  "9": { category: "Snacks & Food", subCategory: "Savoury Snacks", region: "South Asia", country: "India", competitors: ["Pepsi", "ITC", "Britannia", "Haldirams", "Bingo"], intentFilters: ["Monitor price moves", "Track promotions"], positioning: "Value leader in India savoury snacks", vulnerabilities: ["Premium competitor entry", "Price elasticity"], consumers: ["Price-sensitive households", "Tier 2/3 buyers"], selectedSignals: ["pricing", "distribution", "product", "positioning"] },
};

export default function OutputDashboard({ workspaceId }: Props) {
  const [activeTab, setActiveTab]   = useState("radar");
  const [status, setStatus]         = useState("Analyst Reviewed");
  const [statusOpen, setStatusOpen] = useState(false);
  const [storedConfig, setStoredConfig] = useState<StoredConfig | null>(
    STATIC_CONFIGS[workspaceId] ?? null
  );

  const isStatic = Object.prototype.hasOwnProperty.call(STATIC_CONFIGS, workspaceId);
  const [category, setCategory] = useState<CategoryType>(
    workspaceId === "1" || workspaceId === "2" ? "pc" : "snacks"
  );
  const [workspaceName, setWorkspaceName] = useState(
    workspaceId === "1" ? "Laptop Trends 2" :
    workspaceId === "2" ? "Laptop Trends" :
    workspaceId === "3" ? "Q1 2026 Crackers & Crisp Breads Innovation Analysis" :
    isStatic ? "Competitive Intelligence Workspace" :
    "Loading workspace…"
  );
  const [contextLine, setContextLine] = useState(
    workspaceId === "1" || workspaceId === "2"
      ? "PC & Laptops · Touchscreen Laptops · India · Last 12 months"
      : isStatic
      ? "Snacks & Food · Crackers & Crisp Breads · India · Last 12 months"
      : "Loading…"
  );

  // Publish state
  const [published, setPublished]           = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [linkCopied, setLinkCopied]         = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`foresight_ws_config_${workspaceId}`);
      if (!raw) return;
      const cfg: StoredConfig = JSON.parse(raw);
      setStoredConfig(cfg);
      setCategory(catFromString(cfg.category));
      setWorkspaceName(
        cfg.subCategory
          ? `${cfg.subCategory} — Competitive Intelligence`
          : cfg.category
          ? `${cfg.category} — Competitive Intelligence`
          : "Competitive Intelligence Workspace"
      );
      const region = [cfg.region, cfg.country].filter(Boolean).join(" · ") || "Global";
      setContextLine(`${cfg.category}${cfg.subCategory ? " · " + cfg.subCategory : ""} · ${region} · Last 12 months`);
    } catch (_) { /* ignore bad storage */ }
  }, [workspaceId]);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const cfg = storedConfig;
    const data = {
      workspace:       workspaceName,
      contextLine,
      exportedAt:      new Date().toISOString(),
      category:        cfg?.category ?? "",
      subCategory:     cfg?.subCategory ?? "",
      region:          cfg?.region ?? "",
      country:         cfg?.country ?? "",
      competitors:     cfg?.competitors ?? [],
      intentFilters:   cfg?.intentFilters ?? [],
      positioning:     cfg?.positioning ?? "",
      vulnerabilities: cfg?.vulnerabilities ?? [],
      consumers:       cfg?.consumers ?? [],
      selectedSignals: cfg?.selectedSignals ?? [],
      generatedBy:     "ForeSight Competitive Intelligence Platform",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${workspaceName.replace(/[^a-z0-9]/gi, "_").slice(0, 60)}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Copy publish link ─────────────────────────────────────────────────────
  const handleCopyLink = () => {
    const link = `${window.location.origin}/workspace/${workspaceId}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200"
            >
              <ChevronLeft size={14} />
              Dashboard
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 max-w-xl truncate">
                  {workspaceName}
                </h1>
                <span className="badge-active">Active</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{contextLine}</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Edit workspace — only shown for user-created workspaces */}
            {!isStatic && (
              <Link
                href={`/workspace/new?edit=${workspaceId}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit size={13} />
                Edit Workspace
              </Link>
            )}

            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  status === "Analyst Reviewed"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : status === "Pending Review"
                    ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {status === "Analyst Reviewed" ? <CheckCircle size={13} /> : <Clock size={13} />}
                Status: {status}
                <ChevronDown size={12} />
              </button>
              {statusOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatus(opt); setStatusOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Publish */}
            <button
              onClick={() => setShowPublishModal(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                published
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {published ? <CheckCircle size={13} /> : <Send size={13} />}
              {published ? "Published" : "Publish"}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mt-4 border-b border-gray-100 -mb-4 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "radar"    && <CompetitorsRadar   category={category} config={storedConfig} onNavigate={setActiveTab} />}
        {activeTab === "events"   && <EventIntelligence  category={category} config={storedConfig} />}
        {activeTab === "impact"   && <ImpactAnalysis     category={category} config={storedConfig} />}
        {activeTab === "response" && <ResponseAction     category={category} config={storedConfig} />}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPublishModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[440px] mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Publish Workspace</h3>
                <p className="text-xs text-gray-500 mt-0.5">Share this competitive intelligence report with your team</p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mb-4 bg-gray-50 rounded-xl border border-gray-200 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Workspace</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{workspaceName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{contextLine}</p>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-600 mb-2">Shareable link</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="text-xs text-gray-500 flex-1 font-mono truncate">
                  {typeof window !== "undefined" ? window.location.origin : "https://foresight.app"}/workspace/{workspaceId}
                </span>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                    linkCopied
                      ? "bg-green-100 text-green-700"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {linkCopied ? <Check size={11} /> : <Copy size={11} />}
                  {linkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setPublished(true); setShowPublishModal(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
              >
                <Send size={14} />
                Publish &amp; Share
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
