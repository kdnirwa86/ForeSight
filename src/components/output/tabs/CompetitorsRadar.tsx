"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ChevronRight,
  BarChart2,
  Search,
  MessageSquare,
  Repeat2,
  FileText,
} from "lucide-react";
import type { CategoryType, StoredConfig } from "../OutputDashboard";

// ─── STATIC FALLBACK DATA (PC) ────────────────────────────────────────────────

const PC_HIGH_IMPACT_EVENTS = [
  { id: 1, title: "Microsoft launches Surface Pro 11 with OLED touchscreen targeting India enterprise", impact: 85, level: "high", company: "Microsoft", type: "Product & Innovation", date: "Apr 12, 2026" },
  { id: 2, title: "Dell XPS 13 Touch secures exclusive retail placement in Reliance Digital", impact: 72, level: "high", company: "Dell", type: "Distribution & Access", date: "Apr 9, 2026" },
  { id: 3, title: "ASUS ROG Flow Z13 launches with 30% lower price targeting creator segment", impact: 64, level: "medium", company: "ASUS", type: "Pricing & Commercial", date: "Apr 6, 2026" },
  { id: 4, title: "HP Spectre x360 wins top review score across APAC tech publications", impact: 61, level: "medium", company: "HP", type: "Market Positioning", date: "Apr 2, 2026" },
  { id: 5, title: "Lenovo Yoga 9i enterprise refresh closes 18 new B2B procurement deals in Q1", impact: 55, level: "medium", company: "Lenovo", type: "Organisational Signals", date: "Mar 28, 2026" },
];

const PC_COMPETITOR_MOMENTUM = [
  { name: "Microsoft", momentum: "up-strong", change: "+22%", signals: 15 },
  { name: "Dell",      momentum: "up",         change: "+11%", signals: 9 },
  { name: "ASUS",      momentum: "up",         change: "+8%",  signals: 7 },
  { name: "HP",        momentum: "down",        change: "-5%",  signals: 6 },
  { name: "Lenovo",    momentum: "down",        change: "-3%",  signals: 5 },
];

const PC_EARLY_WARNINGS = [
  { label: "Share of voice",         direction: "down", value: "-9%",  icon: Search,       color: "text-red-600 bg-red-50",    valueColor: "text-red-600" },
  { label: "Competitor review score", direction: "up",   value: "+11%", icon: MessageSquare,color: "text-orange-600 bg-orange-50", valueColor: "text-orange-600" },
  { label: "Search interest — Surface",direction: "up",  value: "+18%", icon: Repeat2,      color: "text-blue-600 bg-blue-50",  valueColor: "text-blue-600" },
];

const PC_BRIEF = {
  preview: '"3 threats emerging in premium touchscreen laptop segment — Microsoft Surface\'s OLED push and Dell\'s retail exclusivity converge on your core enterprise buyer..."',
  threats: [
    { label: "Threat 1", text: "Microsoft Surface Pro 11 OLED directly targets enterprise and creator professionals — your highest-value segment." },
    { label: "Threat 2", text: "Dell's exclusive Reliance Digital placement risks distribution disadvantage in top 200 outlets within 30 days." },
    { label: "Threat 3", text: "ASUS's aggressive creator pricing compresses the mid-premium segment; margin protection window is approximately 60 days." },
  ],
};

// ─── STATIC FALLBACK DATA (SNACKS) ────────────────────────────────────────────

const SNACKS_HIGH_IMPACT_EVENTS = [
  { id: 1, title: "Pepsi launches low-sugar Lays variant in India", impact: 82, level: "high", company: "Pepsi", type: "Product & Innovation", date: "Apr 10, 2026" },
  { id: 2, title: "ITC increases promotional frequency in premium snacks segment", impact: 68, level: "medium", company: "ITC", type: "Pricing & Commercial", date: "Apr 8, 2026" },
  { id: 3, title: "Hershey hiring surge in R&D and innovation team", impact: 54, level: "medium", company: "Hershey", type: "Organisational Signals", date: "Apr 5, 2026" },
  { id: 4, title: "Nestlé files clean-label reformulation patent", impact: 71, level: "high", company: "Nestlé", type: "Formulation / Ingredients", date: "Apr 3, 2026" },
  { id: 5, title: "Mondelez shifts messaging to 'natural ingredients' across APAC", impact: 66, level: "medium", company: "Mondelez", type: "Market Positioning", date: "Mar 30, 2026" },
];

const SNACKS_COMPETITOR_MOMENTUM = [
  { name: "Pepsi",    momentum: "up-strong", change: "+18%", signals: 12 },
  { name: "ITC",      momentum: "up",        change: "+9%",  signals: 7 },
  { name: "Nestlé",   momentum: "down",      change: "-4%",  signals: 5 },
  { name: "Hershey",  momentum: "flat",      change: "0%",   signals: 4 },
  { name: "Mondelez", momentum: "up",        change: "+6%",  signals: 6 },
];

const SNACKS_EARLY_WARNINGS = [
  { label: "Share of voice",           direction: "down", value: "-12%", icon: Search,       color: "text-red-600 bg-red-50",    valueColor: "text-red-600" },
  { label: "Competitor sentiment",      direction: "up",   value: "+8%",  icon: MessageSquare,color: "text-green-600 bg-green-50", valueColor: "text-green-600" },
  { label: "Search substitution intent",direction: "up",   value: "+15%", icon: Repeat2,      color: "text-orange-600 bg-orange-50", valueColor: "text-orange-600" },
];

const SNACKS_BRIEF = {
  preview: '"3 threats emerging in premium snacking segment — Pepsi\'s low-sugar push and ITC\'s promo surge converge on your core consumer base..."',
  threats: [
    { label: "Threat 1", text: "Pepsi's low-sugar Lays variant directly targets health-conscious millennials in Tier 1 cities — your primary segment." },
    { label: "Threat 2", text: "ITC's increased promotional frequency risks share erosion in the ₹20–50 price tier by 15–20% over Q2." },
    { label: "Threat 3", text: "Nestlé's clean-label patent signals a reformulation wave; first-mover advantage window is approximately 90 days." },
  ],
};

// ─── DYNAMIC DATA BUILDERS ────────────────────────────────────────────────────

type EventTemplateFn = (actor: string, sub: string, geo: string) => string;

interface EventTpl {
  titleFn: EventTemplateFn;
  descFn:  EventTemplateFn;
  type: string;
  impact: number;
  level: "high" | "medium" | "low";
}

function detectCategoryGroup(cat: string): "pc" | "confectionery" | "beverage" | "dairy" | "fmcg" {
  const c = cat.toLowerCase();
  if (/pc|laptop|computer|tablet|electron|phone|mobile/.test(c)) return "pc";
  if (/chocolate|confection|candy|sweet|cocoa|dessert|sugar|gum/.test(c)) return "confectionery";
  if (/beverage|drink|juice|tea|coffee|water|soda|cola/.test(c)) return "beverage";
  if (/dairy|yogurt|milk|cheese|cream|butter/.test(c)) return "dairy";
  return "fmcg";
}

const CONFECTIONERY_TEMPLATES: EventTpl[] = [
  {
    titleFn: (a, s, g) => `${a} launches premium ${s || "dark chocolate"} variant targeting health-conscious consumers in ${g}`,
    descFn:  (a, s, g) => `${a} enters the premium ${s || "confectionery"} segment with a low-sugar recipe targeting Tier 1 consumers in ${g}.`,
    type: "Product & Innovation", impact: 84, level: "high",
  },
  {
    titleFn: (a, s)    => `${a} files sugar-reduction reformulation patent for core ${s || "chocolate"} range`,
    descFn:  (a, s)    => `${a} patents a new formulation cutting sugar content by 30% while preserving taste profile in ${s || "confectionery"} lines.`,
    type: "Formulation / Ingredients", impact: 71, level: "high",
  },
  {
    titleFn: (a, s, g) => `${a} increases promotional spend 20% in premium ${s || "confectionery"} segment in ${g}`,
    descFn:  (a, s, g) => `${a} running 20% higher promotional investment in ${g} modern trade to win share in the premium ${s || "chocolate"} tier.`,
    type: "Pricing & Commercial", impact: 67, level: "medium",
  },
  {
    titleFn: (a, _s, g) => `${a} secures exclusive shelf placement deal in top modern trade chains across ${g}`,
    descFn:  (a, s, g) => `${a} signs exclusive premium shelf agreement covering 300+ ${g} outlets for its ${s || "confectionery"} range.`,
    type: "Distribution & Access", impact: 78, level: "high",
  },
  {
    titleFn: (a, s)    => `${a} repositions ${s || "chocolate"} portfolio around "artisan cocoa" narrative across APAC`,
    descFn:  (a, s)    => `${a} shifts brand messaging for ${s || "confectionery"} lines to emphasise single-origin cocoa and artisan credentials.`,
    type: "Market Positioning", impact: 63, level: "medium",
  },
  {
    titleFn: (a, s)    => `${a} hires 14 R&D engineers focused on ${s || "confectionery"} ingredient innovation`,
    descFn:  (a, s)    => `${a} expands innovation team with 14 specialist hires targeting next-generation ${s || "confectionery"} formulations.`,
    type: "Organisational Signals", impact: 54, level: "medium",
  },
  {
    titleFn: (a, s, g) => `${a} launches direct-to-consumer gifting platform for premium ${s || "chocolate"} in ${g}`,
    descFn:  (a, s, g) => `${a} enters DTC with a subscription gifting model for premium ${s || "chocolate"} targeting urban ${g} consumers.`,
    type: "Digital & Commerce", impact: 60, level: "medium",
  },
  {
    titleFn: (a, s)    => `${a} introduces fully recyclable packaging across core ${s || "confectionery"} range`,
    descFn:  (a, s)    => `${a} transitions ${s || "confectionery"} range to 100% recyclable materials, ahead of emerging regulatory requirements.`,
    type: "Packaging & Sustainability", impact: 49, level: "low",
  },
];

const BEVERAGE_TEMPLATES: EventTpl[] = [
  { titleFn: (a,s,g) => `${a} launches zero-sugar ${s||"beverage"} targeting health-focused consumers in ${g}`, descFn: (a,s,g) => `${a} introduces zero-calorie variant of its ${s||"beverage"} line to capture health-conscious segment in ${g}.`, type: "Product & Innovation", impact: 82, level: "high" },
  { titleFn: (a,_s,g) => `${a} secures 5-year exclusive distribution agreement with major retail chain in ${g}`, descFn: (a,s,g) => `${a} locks in exclusive distribution for ${s||"beverage"} portfolio at key retail chains across ${g}.`, type: "Distribution & Access", impact: 76, level: "high" },
  { titleFn: (a,s)   => `${a} files patent for extended-shelf-life ${s||"beverage"} formulation`, descFn: (a,s) => `${a} patents cold-chain reduction technology for ${s||"beverage"} enabling wider distribution reach.`, type: "Formulation / Ingredients", impact: 65, level: "medium" },
  { titleFn: (a,s,g) => `${a} cuts ${s||"beverage"} price 15% in key metro markets in ${g}`, descFn: (a,s,g) => `${a} drops price on core ${s||"beverage"} SKUs by 15% to defend volume share in ${g} metros.`, type: "Pricing & Commercial", impact: 70, level: "medium" },
  { titleFn: (a,s)   => `${a} repositions ${s||"beverage"} brand as "natural hydration" platform globally`, descFn: (a,s) => `${a} overhauls ${s||"beverage"} brand identity and messaging around natural ingredients and wellness.`, type: "Market Positioning", impact: 58, level: "medium" },
];

const DAIRY_TEMPLATES: EventTpl[] = [
  { titleFn: (a,s,g) => `${a} launches probiotic-enriched ${s||"dairy"} targeting gut-health segment in ${g}`, descFn: (a,s,g) => `${a} enters the functional ${s||"dairy"} space with probiotic variants targeting wellness-focused consumers in ${g}.`, type: "Product & Innovation", impact: 80, level: "high" },
  { titleFn: (a,s,g) => `${a} secures farm-to-shelf sourcing partnership boosting ${s||"dairy"} brand credentials in ${g}`, descFn: (a,s,g) => `${a} partners with local farms in ${g} for traceable, sustainably sourced ${s||"dairy"} ingredients.`, type: "Distribution & Access", impact: 68, level: "medium" },
  { titleFn: (a,s)   => `${a} files clean-label reformulation patent removing artificial preservatives from ${s||"dairy"} range`, descFn: (a,s) => `${a} patents a preservative-free formulation for its ${s||"dairy"} portfolio, signalling a premium repositioning.`, type: "Formulation / Ingredients", impact: 72, level: "high" },
  { titleFn: (a,s,g) => `${a} increases trade promotions 25% in premium ${s||"dairy"} segment across ${g}`, descFn: (a,s,g) => `${a} ramps trade marketing investment in ${g} to defend volume share against new ${s||"dairy"} entrants.`, type: "Pricing & Commercial", impact: 62, level: "medium" },
  { titleFn: (a,s)   => `${a} shifts ${s||"dairy"} messaging to "family nutrition" platform across APAC`, descFn: (a,s) => `${a} relaunches ${s||"dairy"} brand with unified "family nutrition" positioning across APAC markets.`, type: "Market Positioning", impact: 57, level: "medium" },
];

const FMCG_TEMPLATES: EventTpl[] = [
  { titleFn: (a,s,g) => `${a} launches premium ${s||"product"} variant targeting value-seeking consumers in ${g}`, descFn: (a,s,g) => `${a} introduces an upgraded ${s||"product"} line in ${g} to compete in the premium segment.`, type: "Product & Innovation", impact: 81, level: "high" },
  { titleFn: (a,s)   => `${a} files reformulation patent for ${s||"product"} with improved ingredient profile`, descFn: (a,s) => `${a} patents a next-generation formulation for its ${s||"product"} line targeting regulatory and consumer shifts.`, type: "Formulation / Ingredients", impact: 68, level: "medium" },
  { titleFn: (a,s,g) => `${a} increases promotional investment 22% in ${s||"product"} segment across ${g}`, descFn: (a,s,g) => `${a} steps up trade and consumer promotion for ${s||"product"} in ${g}, pressuring margin across the category.`, type: "Pricing & Commercial", impact: 66, level: "medium" },
  { titleFn: (a,_s,g) => `${a} secures exclusive shelf agreement with leading retail chains in ${g}`, descFn: (a,s,g) => `${a} locks in premium shelf placement for ${s||"product"} across 200+ retail outlets in ${g}.`, type: "Distribution & Access", impact: 75, level: "high" },
  { titleFn: (a,s)   => `${a} repositions ${s||"product"} brand around "trusted quality" platform globally`, descFn: (a,s) => `${a} overhauls brand messaging for ${s||"product"} with a unified "trusted quality" positioning.`, type: "Market Positioning", impact: 60, level: "medium" },
  { titleFn: (a,s)   => `${a} expands R&D team with 16 new innovation hires for ${s||"product"} pipeline`, descFn: (a,s) => `${a} invests in talent to accelerate ${s||"product"} innovation cycle and respond to category shifts.`, type: "Organisational Signals", impact: 52, level: "medium" },
  { titleFn: (a,s,g) => `${a} launches DTC subscription model for ${s||"product"} in ${g}`, descFn: (a,s,g) => `${a} enters direct-to-consumer with a subscription offering for its ${s||"product"} range targeting urban ${g}.`, type: "Digital & Commerce", impact: 58, level: "medium" },
  { titleFn: (a,s)   => `${a} transitions ${s||"product"} packaging to sustainable materials ahead of regulation`, descFn: (a,s) => `${a} announces full packaging transition for ${s||"product"} range to recyclable materials.`, type: "Packaging & Sustainability", impact: 47, level: "low" },
];

function getTemplates(catGroup: ReturnType<typeof detectCategoryGroup>) {
  if (catGroup === "confectionery") return CONFECTIONERY_TEMPLATES;
  if (catGroup === "beverage")      return BEVERAGE_TEMPLATES;
  if (catGroup === "dairy")         return DAIRY_TEMPLATES;
  return FMCG_TEMPLATES;
}

const DATES = ["Apr 14, 2026","Apr 11, 2026","Apr 8, 2026","Apr 5, 2026","Apr 2, 2026","Mar 30, 2026","Mar 27, 2026","Mar 24, 2026"];
const MOMENTUMS = ["up-strong","up","up","flat","down"] as const;
const CHANGES   = ["+19%","+12%","+8%","0%","-6%"];
const SIGNAL_COUNTS = [13, 9, 7, 5, 4];

const DEFAULT_COMPETITORS_RADAR: Record<ReturnType<typeof detectCategoryGroup>, string[]> = {
  pc:            ["Microsoft", "Dell", "HP", "Lenovo", "ASUS"],
  confectionery: ["Cadbury", "Ferrero", "Nestlé", "Mars", "Lindt"],
  beverage:      ["Coca-Cola", "PepsiCo", "Red Bull", "Dabur", "Minute Maid"],
  dairy:         ["Amul", "Nestlé", "Mother Dairy", "Britannia", "Danone"],
  fmcg:          ["HUL", "ITC", "Nestlé", "P&G", "Colgate"],
};

function buildDynamicEvents(inputCompetitors: string[], category: string, subCategory: string, country: string) {
  const catGroup   = detectCategoryGroup(category);
  const competitors = inputCompetitors.length > 0 ? inputCompetitors : DEFAULT_COMPETITORS_RADAR[catGroup];
  const sub = subCategory || category;
  const geo = country || "India";
  const templates = getTemplates(catGroup);
  const numEvents = Math.min(8, Math.max(5, competitors.length));
  return Array.from({ length: numEvents }, (_, i) => {
    const actor = competitors[i % competitors.length];
    const tmpl  = templates[i % templates.length];
    return {
      id: i + 1,
      title:   tmpl.titleFn(actor, sub, geo),
      impact:  Math.max(40, tmpl.impact - i * 3),
      level:   tmpl.level,
      company: actor,
      type:    tmpl.type,
      date:    DATES[i % DATES.length],
    };
  });
}

function buildDynamicMomentum(competitors: string[]) {
  return competitors.slice(0, 5).map((name, i) => ({
    name,
    momentum: MOMENTUMS[i % MOMENTUMS.length],
    change:   CHANGES[i % CHANGES.length],
    signals:  SIGNAL_COUNTS[i % SIGNAL_COUNTS.length],
  }));
}

function buildDynamicWarnings(category: string, country: string) {
  const geo = country || "India";
  const catGroup = detectCategoryGroup(category);
  if (catGroup === "pc") return PC_EARLY_WARNINGS;
  return [
    { label: "Share of voice",                 direction: "down", value: "-11%", icon: Search,        color: "text-red-600 bg-red-50",       valueColor: "text-red-600" },
    { label: "Competitor sentiment",            direction: "up",   value: "+9%",  icon: MessageSquare, color: "text-orange-600 bg-orange-50", valueColor: "text-orange-600" },
    { label: `Search intent — ${geo} market`,  direction: "up",   value: "+14%", icon: Repeat2,       color: "text-blue-600 bg-blue-50",     valueColor: "text-blue-600" },
  ];
}

function buildDynamicBrief(competitors: string[], category: string, subCategory: string, country: string) {
  const top    = competitors[0] ?? "a key competitor";
  const second = competitors[1] ?? "another rival";
  const sub    = subCategory || category;
  const geo    = country || "India";
  return {
    preview: `"2–3 threats emerging in ${sub} — ${top}'s recent move and ${second}'s activity converge on your core consumer base in ${geo}..."`,
    threats: [
      { label: "Threat 1", text: `${top}'s latest ${sub} initiative directly targets your primary consumer segment in ${geo}.` },
      { label: "Threat 2", text: `${second}'s increased activity risks share erosion in your key price tier over the next quarter.` },
      { label: "Threat 3", text: `Broader category signal velocity is up ~38% vs. prior 30 days — the competitive window may be shorter than expected.` },
    ],
  };
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

const IMPACT_COLORS: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-gray-100 text-gray-600",
};

interface Props {
  category:    CategoryType;
  config?:     StoredConfig | null;
  onNavigate?: (tab: string) => void;
}

export default function CompetitorsRadar({ category, config, onNavigate }: Props) {
  const [showBrief, setShowBrief] = useState(false);

  // Use the dynamic path whenever a real workspace config exists.
  // buildDynamicEvents / buildDynamicMomentum fall back to category-appropriate defaults
  // when the user didn't enter any competitors.
  const hasDynamic = !!config?.category;

  const catGroup       = hasDynamic ? detectCategoryGroup(config!.category) : null;
  const effectiveComps = hasDynamic
    ? (config!.competitors.length > 0 ? config!.competitors : DEFAULT_COMPETITORS_RADAR[catGroup!])
    : [];

  const events   = hasDynamic
    ? buildDynamicEvents(effectiveComps, config!.category, config!.subCategory, config!.country)
    : category === "pc" ? PC_HIGH_IMPACT_EVENTS : SNACKS_HIGH_IMPACT_EVENTS;

  const momentum = hasDynamic
    ? buildDynamicMomentum(effectiveComps)
    : category === "pc" ? PC_COMPETITOR_MOMENTUM : SNACKS_COMPETITOR_MOMENTUM;

  const warnings = hasDynamic
    ? buildDynamicWarnings(config!.category, config!.country)
    : category === "pc" ? PC_EARLY_WARNINGS : SNACKS_EARLY_WARNINGS;

  const brief = hasDynamic
    ? buildDynamicBrief(effectiveComps, config!.category, config!.subCategory, config!.country)
    : category === "pc" ? PC_BRIEF : SNACKS_BRIEF;

  const updatedLabel = hasDynamic ? "Apr 14, 2026" : category === "pc" ? "Apr 13, 2026" : "Apr 11, 2026";

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* LEFT: Priority Feeds */}
      <div className="col-span-2 space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Priority Feeds</h3>
          <span className="text-xs text-gray-400">Updated {updatedLabel}</span>
        </div>

        {/* High Impact Events */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="font-bold text-gray-900 text-sm">High Impact Events</h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {events.filter((e) => e.impact >= 65).length}
              </span>
            </div>
            <button
              onClick={() => onNavigate?.("events")}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {events.map((event, idx) => (
              <div key={event.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{event.company}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{event.type}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{event.date}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-snug">{event.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${IMPACT_COLORS[event.level]}`}>
                      Impact {event.impact}
                    </div>
                    <button
                      onClick={() => onNavigate?.("events")}
                      className="text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Market Signals */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Market Signals</h3>

        {/* Early Warning Indicators */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Early Warning Indicators</h3>
          <div className="space-y-2.5">
            {warnings.map(({ label, direction, value, icon: Icon, color, valueColor }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {direction === "down" ? (
                    <TrendingDown size={13} className="text-red-500" />
                  ) : (
                    <TrendingUp size={13} className="text-green-500" />
                  )}
                  <span className={`text-xs font-bold ${valueColor}`}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Momentum */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 text-sm">Competitor Momentum</h3>
          </div>
          <div className="space-y-2">
            {momentum.map(({ name, momentum: m, change, signals }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">{name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{signals} signals</span>
                  <div className={`flex items-center gap-0.5 ${
                    m === "up-strong" || m === "up" ? "text-green-600" : m === "down" ? "text-red-500" : "text-gray-400"
                  }`}>
                    {m === "up-strong" && <><TrendingUp size={13} /><TrendingUp size={13} /></>}
                    {m === "up"        && <TrendingUp size={13} />}
                    {m === "down"      && <TrendingDown size={13} />}
                    {m === "flat"      && <Minus size={13} />}
                  </div>
                  <span className={`text-xs font-bold ${
                    m === "up-strong" || m === "up" ? "text-green-600" : m === "down" ? "text-red-500" : "text-gray-500"
                  }`}>{change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Intelligence Brief */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-blue-200" />
            <h3 className="font-bold text-sm">Weekly Intelligence Brief</h3>
          </div>
          <p className="text-blue-100 text-xs leading-relaxed mb-3">{brief.preview}</p>
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {showBrief ? "Close Brief" : "→ Open Brief"}
          </button>
          {showBrief && (
            <div className="mt-3 bg-white/10 rounded-lg p-3 text-xs text-blue-100 leading-relaxed space-y-2">
              {brief.threats.map(({ label, text }) => (
                <p key={label}>
                  <strong className="text-white">{label}:</strong> {text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
