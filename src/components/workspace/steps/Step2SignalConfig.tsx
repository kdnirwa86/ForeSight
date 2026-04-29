"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Zap, Target, Shield, AlertTriangle, Users, ArrowRight, Info,
  Plus, X, Sparkles, ChevronDown, ChevronRight, CheckCircle, TriangleAlert,
} from "lucide-react";
import { scoreEventBatch, DEFAULT_THRESHOLDS } from "@/lib/scoringEngine";
import type { SignalEvent, WorkspaceProfile } from "@/lib/scoringEngine";
import { buildDynamicSignalEvents } from "@/lib/dynamicEvents";
import type { StoredConfig } from "@/lib/types";
import type { Step1Context } from "./Step1Inputs";

// ─── EXPORTED TYPES ───────────────────────────────────────────────────────────

export interface Step2Context {
  objectives: string[];
  intentFilters: string[];
  positioning: string;
  vulnerabilities: string[];
  consumers: string[];
  selectedSignals: string[];
}

// ─── SIGNAL CATEGORIES ────────────────────────────────────────────────────────

const SIGNAL_CATEGORIES = [
  { id: "product",       name: "Product & Innovation",              color: "bg-blue-50 border-blue-200 text-blue-700",    dot: "bg-blue-500" },
  { id: "pricing",       name: "Pricing & Commercial",              color: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
  { id: "positioning",   name: "Market Positioning",                color: "bg-purple-50 border-purple-200 text-purple-700", dot: "bg-purple-500" },
  { id: "distribution",  name: "Distribution & Access",             color: "bg-orange-50 border-orange-200 text-orange-700", dot: "bg-orange-500" },
  { id: "org",           name: "Organisational Signals",            color: "bg-red-50 border-red-200 text-red-700",       dot: "bg-red-500" },
  { id: "regulatory",    name: "Regulatory & Legal",                color: "bg-yellow-50 border-yellow-200 text-yellow-700", dot: "bg-yellow-500" },
  { id: "formulation",   name: "Formulation / Ingredients",         color: "bg-teal-50 border-teal-200 text-teal-700",    dot: "bg-teal-500" },
  { id: "packaging",     name: "Packaging & Materials",             color: "bg-sky-50 border-sky-200 text-sky-700",       dot: "bg-sky-500" },
  { id: "manufacturing", name: "Manufacturing / Process Technology", color: "bg-slate-50 border-slate-200 text-slate-700", dot: "bg-slate-500" },
  { id: "sustainability","name": "Sustainability / Circular Economy",color: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
  { id: "digital",       name: "Digital / Smart Products",          color: "bg-violet-50 border-violet-200 text-violet-700", dot: "bg-violet-500" },
  { id: "delivery",      name: "Delivery Systems / Formats",        color: "bg-pink-50 border-pink-200 text-pink-700",    dot: "bg-pink-500" },
  { id: "claims",        name: "Claims / Efficacy / Performance",   color: "bg-indigo-50 border-indigo-200 text-indigo-700", dot: "bg-indigo-500" },
];

// ─── EVENT TYPES WITH MATERIALITY SCORES (synced to scoringEngine.ts) ─────────

const SIGNAL_EVENT_TYPES: Record<string, Array<{ name: string; priority: "high" | "medium" | "low"; materiality: number }>> = {
  product: [
    { name: "SKU launches",                  priority: "high",   materiality: 0.90 },
    { name: "Reformulations",                priority: "high",   materiality: 0.85 },
    { name: "Feature releases",              priority: "high",   materiality: 0.88 },
    { name: "Patent filings",               priority: "medium", materiality: 0.65 },
    { name: "Clinical trial registrations", priority: "medium", materiality: 0.70 },
    { name: "IND applications",             priority: "medium", materiality: 0.72 },
    { name: "Pilot / test market launches", priority: "medium", materiality: 0.75 },
    { name: "Product discontinuations",     priority: "low",    materiality: 0.60 },
  ],
  pricing: [
    { name: "List price changes",            priority: "high",   materiality: 0.88 },
    { name: "Promotional mechanics",         priority: "high",   materiality: 0.82 },
    { name: "Bundle / multi-pack offers",   priority: "medium", materiality: 0.70 },
    { name: "Channel-specific pricing shifts",priority:"medium", materiality: 0.74 },
    { name: "Trade terms renegotiations",   priority: "medium", materiality: 0.68 },
    { name: "Reimbursement applications",   priority: "low",    materiality: 0.60 },
  ],
  positioning: [
    { name: "Campaign launches",                    priority: "high",   materiality: 0.75 },
    { name: "Claim changes or additions",           priority: "high",   materiality: 0.80 },
    { name: "Brand repositioning signals",          priority: "high",   materiality: 0.82 },
    { name: "Comparative / head-to-head claims",   priority: "medium", materiality: 0.85 },
    { name: "Spokesperson / KOL activity",         priority: "medium", materiality: 0.60 },
    { name: "Tagline or logo refreshes",           priority: "low",    materiality: 0.50 },
  ],
  distribution: [
    { name: "New retail / channel entries",         priority: "high",   materiality: 0.85 },
    { name: "Exclusive partnership announcements",  priority: "high",   materiality: 0.90 },
    { name: "DTC / e-commerce launches",            priority: "medium", materiality: 0.78 },
    { name: "Geographic expansions",               priority: "medium", materiality: 0.80 },
    { name: "Formulary / listing additions",       priority: "medium", materiality: 0.72 },
    { name: "Distribution agreement terminations", priority: "low",    materiality: 0.65 },
  ],
  org: [
    { name: "Executive hires (C-level, VP)", priority: "high",   materiality: 0.55 },
    { name: "M&A activity",                  priority: "high",   materiality: 0.95 },
    { name: "Team expansions in R&D / Sales",priority: "medium", materiality: 0.58 },
    { name: "Investor day guidance",         priority: "medium", materiality: 0.65 },
    { name: "Leadership departures",         priority: "medium", materiality: 0.60 },
    { name: "Restructuring announcements",   priority: "low",    materiality: 0.62 },
  ],
  regulatory: [
    { name: "Regulatory submissions",         priority: "high",   materiality: 0.78 },
    { name: "Approval decisions",             priority: "high",   materiality: 0.88 },
    { name: "Safety communications / recalls",priority: "high",   materiality: 0.96 },
    { name: "IP / patent filings",           priority: "medium", materiality: 0.65 },
    { name: "Label expansions",              priority: "medium", materiality: 0.72 },
    { name: "Compliance actions",            priority: "medium", materiality: 0.70 },
  ],
  formulation: [
    { name: "New / removed ingredients",      priority: "high",   materiality: 0.85 },
    { name: "Clean-label reformulations",     priority: "high",   materiality: 0.85 },
    { name: "Novel bioactives",              priority: "high",   materiality: 0.80 },
    { name: "Ingredient substitutions",      priority: "medium", materiality: 0.72 },
    { name: "Allergen removal",              priority: "medium", materiality: 0.70 },
    { name: "Dosage changes",               priority: "medium", materiality: 0.65 },
    { name: "Sourcing / origin changes",    priority: "low",    materiality: 0.55 },
  ],
  packaging: [
    { name: "New packaging formats",         priority: "high",   materiality: 0.75 },
    { name: "Sustainable material switches", priority: "medium", materiality: 0.68 },
    { name: "Pack size changes",            priority: "medium", materiality: 0.65 },
    { name: "Redesigns / visual refreshes", priority: "medium", materiality: 0.60 },
    { name: "Smart / connected packaging",  priority: "low",    materiality: 0.72 },
    { name: "Refill / reuse systems",       priority: "low",    materiality: 0.60 },
  ],
  manufacturing: [
    { name: "New facility announcements",        priority: "high",   materiality: 0.78 },
    { name: "Capacity expansions / scale-ups",   priority: "high",   materiality: 0.82 },
    { name: "Automation / tech upgrades",        priority: "medium", materiality: 0.70 },
    { name: "New production processes",          priority: "medium", materiality: 0.72 },
    { name: "Outsourcing / insourcing shifts",   priority: "medium", materiality: 0.65 },
    { name: "Quality certifications",           priority: "low",    materiality: 0.55 },
  ],
  sustainability: [
    { name: "Net-zero / carbon reduction goals",     priority: "medium", materiality: 0.65 },
    { name: "Recycled / bio-based materials adoption",priority:"medium", materiality: 0.68 },
    { name: "Sustainability certifications",          priority: "medium", materiality: 0.62 },
    { name: "Circular economy programs",             priority: "low",    materiality: 0.55 },
    { name: "ESG disclosures",                       priority: "low",    materiality: 0.50 },
    { name: "Zero-waste initiatives",               priority: "low",    materiality: 0.52 },
  ],
  digital: [
    { name: "Connected product launches",   priority: "high",   materiality: 0.85 },
    { name: "AI personalization features",  priority: "high",   materiality: 0.80 },
    { name: "App / platform releases",     priority: "medium", materiality: 0.72 },
    { name: "Ecosystem integrations",      priority: "medium", materiality: 0.70 },
    { name: "Digital-first campaigns",     priority: "medium", materiality: 0.68 },
    { name: "Software updates",            priority: "low",    materiality: 0.55 },
  ],
  delivery: [
    { name: "New format launches (gummies, patches, etc.)", priority: "high", materiality: 0.80 },
    { name: "Device-based delivery systems",               priority: "high", materiality: 0.82 },
    { name: "Controlled-release innovations",              priority: "high", materiality: 0.78 },
    { name: "Bioavailability improvements",               priority: "medium",materiality: 0.72 },
    { name: "Multi-phase system innovations",             priority: "medium",materiality: 0.70 },
  ],
  claims: [
    { name: "Clinical study results",                priority: "high",   materiality: 0.85 },
    { name: "New or upgraded claims",                priority: "high",   materiality: 0.82 },
    { name: "Regulatory-approved claim expansions",  priority: "high",   materiality: 0.88 },
    { name: "Comparative / head-to-head claims",     priority: "high",   materiality: 0.85 },
    { name: "Consumer study publications",           priority: "medium", materiality: 0.70 },
    { name: "Long-term data releases",               priority: "medium", materiality: 0.72 },
  ],
};

// ─── AUTO-INTENT SUGGESTIONS (per sub-category / category) ───────────────────

const SUB_CATEGORY_INTENTS: Record<string, string[]> = {
  "Touchscreen Laptops":    ["Defend premium touchscreen segment", "Track OLED display launches", "Monitor enterprise procurement moves"],
  "Gaming Laptops":         ["Defend gaming performance positioning", "Track GPU-driven product launches", "Monitor price aggression in gaming tier"],
  "Ultrabooks":             ["Defend thin-and-light premium category", "Track ARM architecture adoption", "Monitor AI-powered productivity launches"],
  "Business Laptops":       ["Defend enterprise client base", "Track security & manageability launches", "Monitor B2B procurement deal signals"],
  "Chromebooks":            ["Defend education channel position", "Track cloud-native product launches", "Monitor Google ecosystem signals"],
  "2-in-1 Convertibles":   ["Defend 2-in-1 creator segment", "Track stylus & OLED touchscreen competition", "Monitor pen/stylus differentiation"],
  "Crackers & Crisp Breads":["Defend premium shelf placement", "Track clean-label reformulations", "Monitor health-focused new entries"],
  "Chocolate & Confectionery":["Defend indulgence positioning", "Track gifting segment competition", "Monitor natural/organic alternatives"],
  "Savoury Snacks":         ["Defend market share vs. private label", "Track flavour innovation launches", "Monitor price compression moves"],
  "Health & Wellness Snacks":["Defend health claim differentiation", "Track functional ingredient launches", "Monitor new BFY segment entrants"],
  "Bakery & Biscuits":      ["Defend premium bakery positioning", "Track clean-label reformulation signals", "Monitor distribution exclusivity moves"],
  "Smartphones":            ["Defend flagship market share", "Track camera & AI feature launches", "Monitor price tier competition"],
  "Tablets":                ["Defend productivity segment", "Track display & connectivity launches", "Monitor educational channel moves"],
  "Skincare":               ["Defend dermatologist-recommended claims", "Track clean beauty formulations", "Monitor ingredient transparency moves"],
  "Carbonated Drinks":      ["Defend market share vs. health alternatives", "Track low-sugar product launches", "Monitor pricing promotions"],
};

const CATEGORY_INTENTS: Record<string, string[]> = {
  "PC & Laptops":        ["Track competitor hardware launches", "Monitor enterprise procurement trends", "Defend premium segment"],
  "Snacks & Food":       ["Defend premium shelf positioning", "Track health trend competitor moves", "Monitor pricing competition"],
  "Beverages":           ["Track new format launches", "Monitor health reformulations", "Defend channel partnerships"],
  "Consumer Electronics":["Track feature innovation", "Monitor price aggression", "Defend ecosystem position"],
  "Personal Care":       ["Track ingredient claims", "Monitor clean beauty launches", "Defend core consumer base"],
  "Dairy & Alternatives":["Track plant-based launches", "Monitor protein claim competition", "Defend distribution"],
};

// ─── INTENT → SIGNAL PRIORITY ENGINE ─────────────────────────────────────────

const INTENT_KEYWORD_MAP: Array<{ words: string[]; boost: Record<string, number> }> = [
  { words: ["defend", "protect", "maintain", "retain", "hold"],               boost: { positioning: 28, pricing: 18, distribution: 14, org: 10 } },
  { words: ["expand", "grow", "enter", "launch", "penetrate", "scale"],       boost: { distribution: 28, product: 18, pricing: 12, org: 10 } },
  { words: ["premium", "luxury", "upmarket", "super premium"],                 boost: { positioning: 25, claims: 20, pricing: 15, formulation: 10 } },
  { words: ["health", "wellness", "natural", "clean", "organic", "functional"],boost: { formulation: 25, claims: 22, regulatory: 14, product: 12 } },
  { words: ["innovate", "innovation", "product", "sku", "new variant", "r&d"],boost: { product: 25, formulation: 14, digital: 10, claims: 10 } },
  { words: ["digital", "smart", "connected", "ai", "tech", "software", "app"],boost: { digital: 30, product: 14, claims: 8 } },
  { words: ["price", "cost", "affordable", "budget", "value", "low-cost"],    boost: { pricing: 30, manufacturing: 12, distribution: 10 } },
  { words: ["sustainable", "green", "eco", "recycl", "circular", "esg"],      boost: { sustainability: 30, packaging: 18, formulation: 10 } },
  { words: ["strategy", "competitive", "threat", "compete", "intelligence"],  boost: { positioning: 18, org: 14, product: 12, distribution: 10 } },
  { words: ["distribution", "retail", "shelf", "channel", "access", "listing"],boost: { distribution: 30, pricing: 12, org: 8 } },
  { words: ["segment", "consumer", "audience", "target", "customer"],         boost: { positioning: 18, claims: 14, pricing: 10 } },
  { words: ["brand", "image", "perception", "reputation", "awareness"],       boost: { positioning: 25, claims: 14, digital: 10 } },
  { words: ["regulation", "compliance", "legal", "patent", "ip"],             boost: { regulatory: 30, org: 10 } },
  { words: ["packaging", "pack", "format", "size", "material"],               boost: { packaging: 28, sustainability: 12, product: 10 } },
  { words: ["oled", "display", "screen", "touchscreen"],                      boost: { product: 30, digital: 20, positioning: 15 } },
  { words: ["enterprise", "b2b", "procurement", "corporate", "business"],     boost: { org: 25, distribution: 18, pricing: 12 } },
];

function computeSignalPriorities(intents: string[]): Record<string, number> {
  if (intents.length === 0) return {};
  const text = intents.join(" ").toLowerCase();
  const scores: Record<string, number> = {};
  INTENT_KEYWORD_MAP.forEach(({ words, boost }) => {
    if (words.some((w) => text.includes(w))) {
      Object.entries(boost).forEach(([signal, value]) => {
        scores[signal] = (scores[signal] || 0) + value;
      });
    }
  });
  return scores;
}

// ─── VULNERABILITY → AMPLIFICATION ENGINE ────────────────────────────────────

const VULN_AMPLIFICATION_MAP: Array<{ words: string[]; amplifies: string[]; label: string }> = [
  { words: ["pricing", "price", "cost", "margin", "affordable"],           amplifies: ["pricing", "distribution"],           label: "Pricing risk" },
  { words: ["health", "wellness", "clean", "natural", "functional"],       amplifies: ["formulation", "claims", "regulatory"], label: "Health positioning risk" },
  { words: ["distribution", "retail", "shelf", "channel", "access"],       amplifies: ["distribution", "org"],               label: "Distribution risk" },
  { words: ["digital", "tech", "online", "ecommerce", "app"],              amplifies: ["digital", "product"],                label: "Digital risk" },
  { words: ["premium", "positioning", "brand", "image", "perception"],     amplifies: ["positioning", "pricing", "claims"],  label: "Positioning risk" },
  { words: ["innovation", "product", "sku", "r&d", "pipeline"],            amplifies: ["product", "formulation", "org"],     label: "Innovation risk" },
  { words: ["regulatory", "compliance", "legal", "patent", "ip"],         amplifies: ["regulatory", "org"],                 label: "Regulatory risk" },
  { words: ["packaging", "pack", "format", "material", "sustainable"],     amplifies: ["packaging", "sustainability"],       label: "Packaging risk" },
  { words: ["oled", "display", "screen", "touchscreen", "hardware"],       amplifies: ["product", "digital", "positioning"], label: "Technology risk" },
  { words: ["enterprise", "b2b", "corporate", "procurement"],              amplifies: ["org", "distribution", "pricing"],    label: "Enterprise risk" },
];

function getAmplificationMap(vulnerabilities: string[]): Array<{ vuln: string; signals: string[] }> {
  const text = vulnerabilities.join(" ").toLowerCase();
  return vulnerabilities.map((vuln) => {
    const vulnText = vuln.toLowerCase();
    const matched: string[] = [];
    VULN_AMPLIFICATION_MAP.forEach(({ words, amplifies }) => {
      if (words.some((w) => vulnText.includes(w) || text.includes(w))) {
        amplifies.forEach((s) => { if (!matched.includes(s)) matched.push(s); });
      }
    });
    return { vuln, signals: matched.slice(0, 3) };
  });
}

// ─── POSITIONING ANALYSIS (context-aware) ─────────────────────────────────────

function analyzePositioningRich(
  text: string,
  competitors: string[],
  category: string
): { threats: string[]; score: number; detected: string[] } {
  const lower = text.toLowerCase();
  const threats: string[] = [];
  const detected: string[] = [];
  const top = competitors.slice(0, 2).join(" & ") || "Key competitors";
  const first = competitors[0] || "A leading competitor";

  if (lower.includes("premium") || lower.includes("luxury")) {
    detected.push("Premium positioning claim");
    threats.push(`${top} are also making premium/quality claims — differentiation gap narrowing`);
  }
  if (lower.includes("health") || lower.includes("natural") || lower.includes("clean") || lower.includes("wellness")) {
    detected.push("Health / wellness dimension");
    threats.push(`${first} is accelerating clean-label reformulations that semantically overlap with this claim`);
  }
  if (lower.includes("oled") || lower.includes("display") || lower.includes("screen") || lower.includes("touchscreen")) {
    detected.push("Display / screen technology claim");
    threats.push(`${first} OLED launch creates direct semantic overlap — your display differentiation is under pressure`);
  }
  if (lower.includes("creator") || lower.includes("professional") || lower.includes("productivity")) {
    detected.push("Creator / professional segment targeting");
    threats.push(`${first} is repositioning toward the creator segment with aggressive pricing — switching risk rising`);
  }
  if (lower.includes("enterprise") || lower.includes("business") || lower.includes("b2b")) {
    detected.push("Enterprise market targeting");
    threats.push(`${first} bundling ecosystem services with hardware creates enterprise lock-in that threatens your accounts`);
  }
  if (lower.includes("digital") || lower.includes("smart") || lower.includes("connect") || lower.includes("ai")) {
    detected.push("Digital / AI product dimension");
    threats.push(`2 competitors filing AI and connected-product patents in ${category || "your category"}`);
  }
  if (lower.includes("indulg") || lower.includes("taste") || lower.includes("delight")) {
    detected.push("Indulgence claim");
    threats.push(`Health-oriented entrants from ${top} are pulling consumers away from indulgence positioning`);
  }

  if (detected.length === 0) {
    detected.push("Positioning statement analyzed");
    threats.push("Strengthen specificity — vague positioning makes semantic threat detection harder");
  }

  const score = Math.min(94, Math.max(38, 90 - threats.length * 10));
  return { threats, score, detected };
}

// ─── LIVE WORKSPACE PROFILE BUILDER ──────────────────────────────────────────

interface Step2State {
  selectedSignals: string[];
  positioning: string;
  consumers: string[];
  vulnerabilities: string[];
  intentFilters: string[];
}

function buildLiveProfile(ctx: Step1Context, s2: Step2State, events: SignalEvent[]): WorkspaceProfile {
  const allCompetitors: WorkspaceProfile["competitors"] = [
    ...ctx.primaryCompetitors.map(n => ({ name: n, tier: "primary" as const })),
    ...ctx.brands.filter(b => !ctx.primaryCompetitors.includes(b)).map(n => ({ name: n, tier: "secondary" as const })),
    ...ctx.secondaryCompetitors.map(n => ({ name: n, tier: "secondary" as const })),
  ];

  const markets = ctx.region === "Global" ? ["Global"] : [ctx.region, ctx.country].filter(Boolean);
  const catLower = ctx.category.toLowerCase();
  const channels = catLower.includes("pc") || catLower.includes("laptop") || catLower.includes("electron")
    ? ["Retail", "E-commerce", "B2B", "Enterprise"]
    : ["Modern Trade", "General Trade", "E-commerce"];

  const revenueShare: Record<string, number> = {};
  if (markets[0]) revenueShare[markets[0]] = 0.60;
  if (markets[1]) revenueShare[markets[1]] = 0.30;

  return {
    categories:       s2.selectedSignals.length > 0 ? s2.selectedSignals : ["product", "pricing", "positioning"],
    markets:          markets.length > 0 ? markets : ["Global"],
    channels,
    competitors:      allCompetitors.length > 0 ? allCompetitors : [{ name: "Competitor", tier: "secondary" }],
    minScopeThreshold: DEFAULT_THRESHOLDS.minScopeThreshold,
    alertThreshold:    DEFAULT_THRESHOLDS.alertThreshold,
    positioning:      s2.positioning || "Market leadership through product quality",
    consumerProfiles: s2.consumers.length > 0 ? s2.consumers : ["General consumer"],
    vulnerabilities:  s2.vulnerabilities,
    intents:          s2.intentFilters,
    capabilities: {
      product:      s2.selectedSignals.includes("product")      ? 0.80 : 0.50,
      pricing:      s2.selectedSignals.includes("pricing")      ? 0.75 : 0.50,
      messaging:    s2.selectedSignals.includes("positioning")  ? 0.85 : 0.50,
      distribution: s2.selectedSignals.includes("distribution") ? 0.70 : 0.50,
    },
    revenueShare,
    eventHistory: events,
  };
}

// ─── CONSUMER QUICK PICKS ────────────────────────────────────────────────────

const CONSUMER_QUICK_PICKS = [
  "Health-conscious Millennials", "Budget-conscious Families", "Premium-seeking Gen X",
  "Urban Young Adults", "Fitness Enthusiasts", "Enterprise IT Buyers",
  "Creator Professionals", "Student / First-time Buyers", "Remote Working Professionals", "Value-seeking Gen Z",
];

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-gray-100 text-gray-500",
};

function routeColor(route: string): string {
  if (route.startsWith("urgent_alert"))   return "text-red-600 bg-red-50 border border-red-100";
  if (route.startsWith("analyst_review")) return "text-yellow-700 bg-yellow-50 border border-yellow-100";
  return "text-gray-500 bg-gray-50 border border-gray-100";
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

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const EMPTY_CONTEXT: Step1Context = {
  category: "", subCategory: "", region: "Global", country: "",
  brands: [], primaryCompetitors: [], secondaryCompetitors: [],
};

interface Props {
  contextData?:  Step1Context;
  onDataChange?: (data: Step2Context) => void;
  initialData?:  Partial<Step2Context>;
}

export default function Step2SignalConfig({ contextData = EMPTY_CONTEXT, onDataChange, initialData }: Props) {

  // ── State ────────────────────────────────────────────────────────────────
  const [objectives, setObjectives] = useState({
    trackCompetitors: true, identifyThreats: true, supportStrategy: true, supportExecution: true,
  });
  const [customObjectives, setCustomObjectives]   = useState<string[]>([]);
  const [addingObjective, setAddingObjective]     = useState(false);
  const [newObjectiveInput, setNewObjectiveInput] = useState("");

  const [intentFilters, setIntentFilters] = useState<string[]>(initialData?.intentFilters ?? []);
  const [intentInput, setIntentInput]     = useState("");

  const [positioning, setPositioning]               = useState(initialData?.positioning ?? "");
  const [positioningAnalyzing, setPositioningAnalyzing] = useState(false);
  const [positioningInsights, setPositioningInsights]   = useState<null | { threats: string[]; score: number; detected: string[] }>(null);

  const [vulnerabilities, setVulnerabilities] = useState<string[]>(initialData?.vulnerabilities ?? []);
  const [vulnInput, setVulnInput]             = useState("");

  const [consumers, setConsumers]       = useState<string[]>(initialData?.consumers ?? []);
  const [consumerInput, setConsumerInput] = useState("");

  const [selectedSignals, setSelectedSignals] = useState<string[]>(
    initialData?.selectedSignals?.length ? initialData.selectedSignals : ["product", "pricing", "positioning"]
  );
  const [expandedSignals, setExpandedSignals] = useState<string[]>([]);

  // ── Auto-seed intent suggestions from context ─────────────────────────────
  const autoSuggestions: string[] = useMemo(() => {
    if (contextData.subCategory && SUB_CATEGORY_INTENTS[contextData.subCategory]) {
      return SUB_CATEGORY_INTENTS[contextData.subCategory];
    }
    if (contextData.category && CATEGORY_INTENTS[contextData.category]) {
      return CATEGORY_INTENTS[contextData.category];
    }
    return [];
  }, [contextData.subCategory, contextData.category]);

  // ── Auto-positioning analysis (debounced) ────────────────────────────────
  useEffect(() => {
    if (!positioning.trim()) { setPositioningInsights(null); return; }
    setPositioningAnalyzing(true);
    const allCompetitors = [...contextData.primaryCompetitors, ...contextData.brands, ...contextData.secondaryCompetitors];
    const timer = setTimeout(() => {
      setPositioningInsights(analyzePositioningRich(positioning, allCompetitors, contextData.category));
      setPositioningAnalyzing(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, [positioning, contextData.primaryCompetitors, contextData.brands, contextData.secondaryCompetitors, contextData.category]);

  // ── Derived signal priorities + amplification ─────────────────────────────
  const signalPriorities = useMemo(() => computeSignalPriorities(intentFilters), [intentFilters]);
  const topPriorities = useMemo(() =>
    Object.entries(signalPriorities).sort(([, a], [, b]) => b - a).slice(0, 6),
    [signalPriorities]);

  const amplificationMap = useMemo(() => getAmplificationMap(vulnerabilities), [vulnerabilities]);
  const allAmplifiedSignals = useMemo(() => {
    const s = new Set<string>();
    amplificationMap.forEach(({ signals }) => signals.forEach((x) => s.add(x)));
    return s;
  }, [amplificationMap]);

  // ── Live scoring ─────────────────────────────────────────────────────────
  const liveEvents = useMemo((): SignalEvent[] => {
    if (!contextData.category) return [];
    const allCompetitors = [
      ...contextData.primaryCompetitors,
      ...contextData.brands.filter(b => !contextData.primaryCompetitors.includes(b)),
      ...contextData.secondaryCompetitors,
    ];
    const tempConfig: StoredConfig = {
      category:     contextData.category,
      subCategory:  contextData.subCategory,
      region:       contextData.region,
      country:      contextData.country,
      competitors:  allCompetitors,
      intentFilters: [],
    };
    return buildDynamicSignalEvents(tempConfig);
  }, [contextData]);

  const liveWorkspace = useMemo(() => {
    if (liveEvents.length === 0) return null;
    return buildLiveProfile(contextData, { selectedSignals, positioning, consumers, vulnerabilities, intentFilters }, liveEvents);
  }, [contextData, selectedSignals, positioning, consumers, vulnerabilities, intentFilters, liveEvents]);

  const liveScores = useMemo(() => {
    if (!liveWorkspace || liveEvents.length === 0) return [];
    return scoreEventBatch(liveEvents, liveWorkspace);
  }, [liveEvents, liveWorkspace]);

  const urgentCount  = liveScores.filter(r => r.route.startsWith("urgent_alert")).length;
  const analystCount = liveScores.filter(r => r.route.startsWith("analyst_review")).length;
  const digestCount  = liveScores.filter(r => r.route === "digest_only").length;

  // ── Emit context upward ──────────────────────────────────────────────────
  useEffect(() => {
    const activeObjectives = [
      ...(objectives.trackCompetitors  ? ["Track competitors"] : []),
      ...(objectives.identifyThreats   ? ["Identify threats"]  : []),
      ...(objectives.supportStrategy   ? ["Support strategy"]  : []),
      ...(objectives.supportExecution  ? ["Support execution"] : []),
      ...customObjectives,
    ];
    onDataChange?.({ objectives: activeObjectives, intentFilters, positioning, vulnerabilities, consumers, selectedSignals });
  }, [objectives, customObjectives, intentFilters, positioning, vulnerabilities, consumers, selectedSignals, onDataChange]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const t = input.trim();
    if (t && !list.includes(t)) { setList([...list, t]); setInput(""); }
  };
  const removeTag = (list: string[], setList: (v: string[]) => void, tag: string) => setList(list.filter(t => t !== tag));
  const toggleSignal = (id: string) => setSelectedSignals(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleExpand = (id: string) => setExpandedSignals(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const addCustomObjective = () => {
    const t = newObjectiveInput.trim();
    if (t && !customObjectives.includes(t)) setCustomObjectives([...customObjectives, t]);
    setNewObjectiveInput(""); setAddingObjective(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── a. Strategic Objectives ──────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Target size={15} className="text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-900">a. Strategic Objectives</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { key: "trackCompetitors", label: "Track competitors" },
            { key: "identifyThreats",  label: "Identify threats" },
            { key: "supportStrategy",  label: "Support strategy decisions" },
            { key: "supportExecution", label: "Support ongoing execution" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setObjectives(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                  objectives[key as keyof typeof objectives] ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 group-hover:border-blue-400"
                }`}
              >
                {objectives[key as keyof typeof objectives] && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
              </div>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {customObjectives.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {customObjectives.map(obj => (
              <span key={obj} className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                <svg viewBox="0 0 10 8" className="w-3 h-3"><path d="M1 4l3 3 5-6" stroke="#2563EB" strokeWidth="1.5" fill="none" /></svg>
                {obj}
                <button onClick={() => setCustomObjectives(customObjectives.filter(o => o !== obj))}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        {addingObjective ? (
          <div className="flex gap-2 mt-2">
            <input autoFocus className="input-field flex-1 text-sm" placeholder='e.g., "Monitor regulatory activity in EU markets"'
              value={newObjectiveInput} onChange={e => setNewObjectiveInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addCustomObjective(); if (e.key === "Escape") { setAddingObjective(false); setNewObjectiveInput(""); } }}
            />
            <button onClick={addCustomObjective} className="btn-primary px-3 text-xs">Add</button>
            <button onClick={() => { setAddingObjective(false); setNewObjectiveInput(""); }} className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 text-sm"><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setAddingObjective(true)} className="flex items-center gap-2 text-xs text-blue-600 font-semibold hover:text-blue-800 mt-1">
            <Plus size={13} /> Write your own objective
          </button>
        )}
      </div>

      {/* ── b. Intent-Based Filtering ────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center"><Zap size={15} className="text-purple-600" /></div>
          <h2 className="text-base font-bold text-gray-900">b. Intent-Based Filtering</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-9">
          Describe what you are trying to do. The system automatically maps your intent to signal categories and adjusts detection priorities.
        </p>

        {/* Auto-suggestions from workspace context */}
        {autoSuggestions.length > 0 && (
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-purple-600" />
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                Suggested for {contextData.subCategory || contextData.category}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {autoSuggestions.map(s => {
                const added = intentFilters.includes(s);
                return (
                  <button key={s} onClick={() => { if (!added) setIntentFilters(prev => [...prev, s]); }}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${added ? "bg-purple-100 border-purple-300 text-purple-700" : "bg-white border-purple-200 text-purple-600 hover:bg-purple-100"}`}
                  >
                    {added ? "✓ " : "+ "}{s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active intent tags */}
        {intentFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {intentFilters.map(tag => (
              <span key={tag} className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-purple-200">
                &ldquo;{tag}&rdquo;
                <button onClick={() => removeTag(intentFilters, setIntentFilters, tag)} className="hover:text-purple-900"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-5">
          <input className="input-field flex-1" placeholder='Describe your intent, e.g., "Defend market share in Tier 1 cities"'
            value={intentInput} onChange={e => setIntentInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag(intentFilters, setIntentFilters, intentInput, setIntentInput)}
          />
          <button onClick={() => addTag(intentFilters, setIntentFilters, intentInput, setIntentInput)} className="btn-primary px-4 text-xs">Add</button>
        </div>

        {/* Live signal priority derived from intents */}
        {topPriorities.length > 0 ? (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">Auto-derived Signal Priority</span>
              <span className="text-xs text-purple-500">— live from your intent</span>
            </div>
            <div className="space-y-2">
              {topPriorities.map(([signalId, score], idx) => {
                const maxScore = topPriorities[0][1];
                const pct = Math.round((score / maxScore) * 100);
                const cat = SIGNAL_CATEGORIES.find(c => c.id === signalId);
                return (
                  <div key={signalId} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-purple-400 w-3">{idx + 1}</span>
                    <span className="text-xs font-semibold text-gray-700 w-40 truncate">{cat?.name ?? signalId}</span>
                    <div className="flex-1 h-2 bg-purple-100 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-purple-700 w-8 text-right">{pct}%</span>
                    {!selectedSignals.includes(signalId) && (
                      <button onClick={() => setSelectedSignals(prev => [...prev, signalId])} className="text-[10px] text-purple-600 font-semibold hover:underline whitespace-nowrap">+ Track</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-xs text-gray-400">
            Add intent tags above to see auto-derived signal priorities.
          </div>
        )}
      </div>

      {/* ── c. Positioning & Differentiation ─────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Shield size={15} className="text-blue-600" /></div>
          <h2 className="text-base font-bold text-gray-900">c. Positioning & Differentiation</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">
          Describe your brand&apos;s positioning. The system automatically uses semantic similarity to detect when competitor moves threaten it — analysis runs as you type.
        </p>

        <div className="relative">
          <textarea
            className="input-field resize-none h-16 mb-2 pr-12"
            placeholder='e.g., "Premium touchscreen laptops for creators and enterprise — performance, display quality, ecosystem independence"'
            value={positioning}
            onChange={e => setPositioning(e.target.value)}
          />
          {positioningAnalyzing && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-blue-500 font-semibold">Analyzing...</span>
            </div>
          )}
        </div>

        {positioningInsights && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Semantic Analysis</span>
                {contextData.primaryCompetitors.length > 0 && (
                  <span className="text-[10px] text-blue-500">vs. {contextData.primaryCompetitors.slice(0, 2).join(", ")}</span>
                )}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                positioningInsights.score >= 70 ? "bg-green-100 text-green-700" : positioningInsights.score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
              }`}>
                Differentiation: {positioningInsights.score}/100
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {positioningInsights.detected.map(d => (
                <span key={d} className="flex items-center gap-1 text-[11px] bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                  <CheckCircle size={10} className="text-blue-500" /> {d}
                </span>
              ))}
            </div>
            <div className="space-y-1.5">
              {positioningInsights.threats.map(threat => (
                <div key={threat} className="flex items-start gap-2 text-xs text-orange-700">
                  <TriangleAlert size={12} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>{threat}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-blue-500 italic">Signal detection is amplified for competitor moves semantically similar to your positioning.</p>
          </div>
        )}
      </div>

      {/* ── d. Vulnerabilities ────────────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle size={15} className="text-red-600" /></div>
          <h2 className="text-base font-bold text-gray-900">d. Vulnerabilities → Risk Amplifier</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">Signals matching your vulnerabilities are automatically amplified in impact scoring.</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {vulnerabilities.map(v => (
            <span key={v} className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertTriangle size={10} />&ldquo;{v}&rdquo;
              <button onClick={() => removeTag(vulnerabilities, setVulnerabilities, v)} className="hover:text-red-900"><X size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input className="input-field flex-1" placeholder='e.g., "OLED display gap vs Microsoft Surface"'
            value={vulnInput} onChange={e => setVulnInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag(vulnerabilities, setVulnerabilities, vulnInput, setVulnInput)}
          />
          <button onClick={() => addTag(vulnerabilities, setVulnerabilities, vulnInput, setVulnInput)} className="btn-primary px-4 text-xs">Add</button>
        </div>

        {amplificationMap.some(m => m.signals.length > 0) && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-red-600" />
              <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Amplification Map</span>
              <span className="text-xs text-red-400">— signals boosted by your vulnerabilities</span>
            </div>
            <div className="space-y-2.5">
              {amplificationMap.filter(m => m.signals.length > 0).map(({ vuln, signals }) => (
                <div key={vuln} className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg whitespace-nowrap">&ldquo;{vuln}&rdquo;</span>
                  <ArrowRight size={12} className="text-red-400 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {signals.map(s => {
                      const cat = SIGNAL_CATEGORIES.find(c => c.id === s);
                      return (
                        <span key={s} className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cat?.color ?? "bg-gray-100 text-gray-600"}`}>
                          <Zap size={9} /> {cat?.name ?? s} ↑
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── e. Consumer Definition ───────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center"><Users size={15} className="text-teal-600" /></div>
          <h2 className="text-base font-bold text-gray-900">e. Consumer Definition</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 ml-9">
          Define your target audience. The system uses these segments to assess switching risk when competitors make relevant moves.
        </p>

        <div className="mb-3">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Quick picks</p>
          <div className="flex flex-wrap gap-2">
            {CONSUMER_QUICK_PICKS.map(pick => {
              const isAdded = consumers.includes(pick);
              return (
                <button key={pick} onClick={() => isAdded ? setConsumers(consumers.filter(c => c !== pick)) : setConsumers([...consumers, pick])}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${isAdded ? "bg-teal-100 border-teal-300 text-teal-700" : "bg-white border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600"}`}
                >
                  {isAdded ? "✓ " : "+ "}{pick}
                </button>
              );
            })}
          </div>
        </div>

        {consumers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {consumers.map(c => (
              <span key={c} className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2">
                &ldquo;{c}&rdquo;<button onClick={() => removeTag(consumers, setConsumers, c)} className="hover:text-teal-900"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input className="input-field flex-1" placeholder='e.g., "Value-seeking Gen Z in Tier 2 cities"'
            value={consumerInput} onChange={e => setConsumerInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag(consumers, setConsumers, consumerInput, setConsumerInput)}
          />
          <button onClick={() => addTag(consumers, setConsumers, consumerInput, setConsumerInput)} className="btn-primary px-4 text-xs">Add</button>
        </div>
      </div>

      {/* ── Signal Category Selection ──────────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center"><Zap size={15} className="text-orange-600" /></div>
          <h2 className="text-base font-bold text-gray-900">Signal Category</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-9">
          Select signal categories to monitor ({selectedSignals.length} selected). Expand any category to see which events are tracked and their materiality scores.
        </p>

        <div className="grid grid-cols-1 gap-2">
          {SIGNAL_CATEGORIES.map(cat => {
            const isSelected  = selectedSignals.includes(cat.id);
            const isExpanded  = expandedSignals.includes(cat.id);
            const intentBoost = signalPriorities[cat.id] ?? 0;
            const isAmplified = allAmplifiedSignals.has(cat.id);
            const eventTypes  = SIGNAL_EVENT_TYPES[cat.id] ?? [];

            return (
              <div key={cat.id} className={`rounded-xl border-2 transition-all ${isSelected ? cat.color : "border-gray-100 bg-white"}`}>
                <div className="flex items-center gap-3 p-3">
                  <div onClick={() => toggleSignal(cat.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-400"}`}
                  >
                    {isSelected && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleSignal(cat.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-2 h-2 rounded-full ${cat.dot} shrink-0`} />
                      <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                      {intentBoost > 0 && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles size={8} /> Intent priority
                        </span>
                      )}
                      {isAmplified && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Zap size={8} /> Risk-amplified
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => toggleExpand(cat.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 shrink-0 px-2 py-1 rounded">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-[10px] font-semibold">{eventTypes.length} events</span>
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-0 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 mb-2 mt-2 font-semibold uppercase tracking-wide">Event types tracked — with materiality scores from scoring engine:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {eventTypes.map(({ name, priority, materiality }) => (
                        <span key={name} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${PRIORITY_COLORS[priority]}`}
                          title={`Materiality score: ${materiality.toFixed(2)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-yellow-500" : "bg-gray-400"}`} />
                          {name}
                          <span className="font-mono text-[9px] opacity-60">{materiality.toFixed(2)}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2.5">
                      {[{ label: "HIGH priority", color: "bg-red-100 text-red-600" }, { label: "MEDIUM", color: "bg-yellow-100 text-yellow-600" }, { label: "LOW", color: "bg-gray-100 text-gray-500" }].map(({ label, color }) => (
                        <span key={label} className={`text-[10px] font-bold px-2 py-0.5 rounded ${color}`}>{label}</span>
                      ))}
                      <span className="text-[10px] text-gray-400 ml-auto">Numbers = materiality weight in scoring engine</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Significance Scoring Pipeline ─────────────────────────────────── */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center"><Info size={15} className="text-gray-600" /></div>
          <h2 className="text-base font-bold text-gray-900">Significance Scoring Pipeline</h2>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Live</span>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-9">Each signal flows through a 6-stage pipeline. Thresholds and weights are synced directly from the scoring engine.</p>

        {/* Live computed scores */}
        {liveScores.length > 0 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Live Pipeline Results</span>
              <span className="text-xs text-blue-400">— {liveScores.length} events scored from your workspace config</span>
            </div>
            {/* Summary counts */}
            <div className="flex items-center gap-3 mb-4">
              {[
                { label: "Urgent Alert",   count: urgentCount,  style: "text-red-600 bg-red-50 border-red-100" },
                { label: "Analyst Review", count: analystCount, style: "text-yellow-700 bg-yellow-50 border-yellow-100" },
                { label: "Digest Only",    count: digestCount,  style: "text-gray-500 bg-gray-50 border-gray-200" },
              ].map(({ label, count, style }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${style}`}>
                  <span className="text-xl font-black">{count}</span>
                  <span className="leading-tight">{label}</span>
                </div>
              ))}
            </div>
            {/* Top 4 events */}
            <div className="space-y-1.5">
              {liveScores.slice(0, 4).map(result => {
                const ev = liveEvents.find(e => e.id === result.eventId);
                if (!ev) return null;
                return (
                  <div key={result.eventId} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <div className={`w-1.5 h-8 rounded-full shrink-0 ${result.route.startsWith("urgent_alert") ? "bg-red-500" : result.route.startsWith("analyst_review") ? "bg-yellow-500" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                      <p className="text-[10px] text-gray-400">{ev.actor}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-gray-400">Impact</span>
                      <span className={`text-sm font-black ${result.impactScore >= 75 ? "text-red-600" : result.impactScore >= 50 ? "text-yellow-600" : "text-gray-400"}`}>
                        {Math.round(result.impactScore)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${routeColor(result.route)}`}>
                        {routeLabel(result.route)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-gray-400">
              {contextData.category
                ? "Select signal categories above to activate live scoring."
                : "Complete Step 1 (select a category) to see live scoring results here."}
            </p>
          </div>
        )}

        {/* Score weights */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Score Weights (synced to engine)</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Scope Relevance", weight: "30%", desc: "Category, geo, channel, competitor match" },
              { label: "Materiality",     weight: "30%", desc: "Event type weight × magnitude" },
              { label: "Proximity",       weight: "20%", desc: "Competitor tier (primary vs. secondary)" },
              { label: "Velocity",        weight: "20%", desc: "Rate of actor activity vs. 90-day baseline" },
            ].map(({ label, weight, desc }) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-blue-600">{weight}</span>
                </div>
                <p className="text-[10px] text-gray-400">{desc}</p>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: weight }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routing thresholds (from DEFAULT_THRESHOLDS) */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Routing Thresholds</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { range: `scope < ${DEFAULT_THRESHOLDS.minScopeThreshold}`, action: "Suppress",                    color: "bg-gray-100 text-gray-600 border-gray-200",     icon: "🚫" },
              { range: `significance < ${DEFAULT_THRESHOLDS.alertThreshold}`, action: "Weekly Digest",           color: "bg-blue-50 text-blue-700 border-blue-200",      icon: "📋" },
              { range: `impact ${DEFAULT_THRESHOLDS.routingThresholds.analystReview}–${DEFAULT_THRESHOLDS.routingThresholds.urgentAlert - 1}`, action: "Alert + Analyst", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: "⚠️" },
              { range: `impact ${DEFAULT_THRESHOLDS.routingThresholds.urgentAlert}+`, action: "Urgent + Response Draft", color: "bg-red-50 text-red-700 border-red-200", icon: "🚨" },
            ].map(({ range, action, color, icon }) => (
              <div key={range} className={`rounded-xl border p-3 text-center ${color}`}>
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-xs font-bold">{range}</div>
                <div className="text-[10px] font-semibold mt-1 opacity-80">{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionability (from DEFAULT_THRESHOLDS) */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Actionability Score</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { range: `< ${DEFAULT_THRESHOLDS.actionabilityThresholds.suggestOptions}`,  label: "Explain Only",          color: "bg-gray-100 text-gray-700" },
              { range: `${DEFAULT_THRESHOLDS.actionabilityThresholds.suggestOptions}–${DEFAULT_THRESHOLDS.actionabilityThresholds.generatePlan - 1}`, label: "Suggest Options", color: "bg-yellow-100 text-yellow-700" },
              { range: `${DEFAULT_THRESHOLDS.actionabilityThresholds.generatePlan}+`,     label: "Generate Plan + Owners", color: "bg-green-100 text-green-700" },
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
