/**
 * Shared dynamic event and workspace builders.
 * Used by EventIntelligence, ImpactAnalysis, ResponseAction, and Step2SignalConfig.
 */
import type { SignalEvent, WorkspaceProfile } from "@/lib/scoringEngine";
import type { StoredConfig } from "@/lib/types";

// ─── CATEGORY DETECTION ───────────────────────────────────────────────────────

export type CatGroup = "pc" | "confectionery" | "beverage" | "dairy" | "fmcg";

export function detectCatGroup(cat: string): CatGroup {
  const c = cat.toLowerCase();
  if (/pc|laptop|computer|tablet|electron|phone|mobile/.test(c)) return "pc";
  if (/chocolate|confection|candy|sweet|cocoa|dessert|gum/.test(c)) return "confectionery";
  if (/beverage|drink|juice|tea|coffee|water|soda|cola|soft.?drink|energy.?drink|carbonat/.test(c)) return "beverage";
  if (/dairy|yogurt|milk|cheese|cream|butter/.test(c)) return "dairy";
  return "fmcg";
}

export const DEFAULT_COMPETITORS: Record<CatGroup, string[]> = {
  pc:            ["Microsoft", "Dell", "HP", "Lenovo", "ASUS"],
  confectionery: ["Cadbury", "Ferrero", "Nestlé", "Mars", "Lindt"],
  beverage:      ["Coca-Cola", "PepsiCo", "Red Bull", "Dabur", "Minute Maid"],
  dairy:         ["Amul", "Nestlé", "Mother Dairy", "Britannia", "Danone"],
  fmcg:          ["HUL", "ITC", "Nestlé", "P&G", "Colgate"],
};

const BAR_COLORS = [
  "bg-blue-500", "bg-orange-500", "bg-red-500",
  "bg-purple-500", "bg-green-500", "bg-yellow-500",
];
export function competitorColor(i: number): string {
  return BAR_COLORS[i % BAR_COLORS.length];
}

// ─── SIGNAL EVENT TEMPLATES ───────────────────────────────────────────────────

interface SignalTpl {
  titleFn: (actor: string, sub: string, geo: string) => string;
  descFn:  (actor: string, sub: string, geo: string) => string;
  category: string;
  eventType: string;
  magnitude: number;
  sourceConfidence: number;
  isDirectlyVerifiable: boolean;
  channel: string;
}

const CONF_TEMPLATES: SignalTpl[] = [
  { titleFn: (a,s,g) => `${a} launches premium low-sugar ${s||"chocolate"} variant in ${g}`,                   descFn: (a,s,g) => `${a} introduces a low-sugar ${s||"confectionery"} line targeting health-conscious millennials in ${g}.`,                                     category:"product",      eventType:"SKU launches",                       magnitude:0.90, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} files sugar-reduction reformulation patent for ${s||"chocolate"} range`,         descFn: (a,s)   => `${a} patents a reformulation reducing sugar content 30% in core ${s||"confectionery"} lines.`,                                               category:"formulation",  eventType:"Patent filings",                     magnitude:0.78, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} increases promotional spend 20% in ${s||"confectionery"} segment in ${g}`,      descFn: (a,s,g) => `${a} ramps trade marketing investment by 20% in ${g}'s premium ${s||"confectionery"} tier, pressuring category margins.`,                 category:"pricing",      eventType:"Promotional mechanics",              magnitude:0.74, sourceConfidence:0.80, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,_s,g) => `${a} secures exclusive shelf placement across top retail chains in ${g}`,           descFn: (a,s,g) => `${a} locks in exclusive premium shelf space for its ${s||"confectionery"} portfolio at 300+ modern trade outlets in ${g}.`,               category:"distribution", eventType:"Exclusive partnership announcements", magnitude:0.88, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} shifts ${s||"chocolate"} messaging to "artisan cocoa" positioning across APAC`, descFn: (a,s)   => `${a} relaunches ${s||"confectionery"} brand identity around single-origin cocoa and artisan credentials.`,                                   category:"positioning",  eventType:"Brand repositioning signals",         magnitude:0.67, sourceConfidence:0.72, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} expands R&D team with 14 new hires for ${s||"confectionery"} innovation`,       descFn: (a,s)   => `${a} brings in 14 specialist R&D roles for next-generation ${s||"confectionery"} formulations.`,                                            category:"org",          eventType:"Team expansions in R&D / Sales",     magnitude:0.60, sourceConfidence:0.88, isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} launches DTC gifting subscription for premium ${s||"chocolate"} in ${g}`,       descFn: (a,s,g) => `${a} enters direct-to-consumer with a premium ${s||"confectionery"} gifting subscription targeting urban ${g}.`,                          category:"digital",      eventType:"App / DTC launches",                 magnitude:0.63, sourceConfidence:0.78, isDirectlyVerifiable:false, channel:"E-commerce"   },
  { titleFn: (a,s)   => `${a} transitions ${s||"confectionery"} packaging to fully recyclable materials`,     descFn: (a,s)   => `${a} announces 100% recyclable packaging transition for its ${s||"confectionery"} range.`,                                                  category:"packaging",    eventType:"Sustainable material switches",       magnitude:0.52, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
];

const BEV_TEMPLATES: SignalTpl[] = [
  { titleFn: (a,s,g) => `${a} launches zero-sugar ${s||"soft drink"} targeting health-focused consumers in ${g}`,            descFn: (a,s,g) => `${a} introduces a zero-calorie variant of its ${s||"beverage"} line to capture health-conscious consumers in ${g}.`,              category:"product",      eventType:"SKU launches",                       magnitude:0.92, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,_s,g) => `${a} secures 5-year exclusive distribution deal with major retail chain in ${g}`,                  descFn: (a,s,g) => `${a} locks in exclusive cold-chain distribution for its ${s||"beverage"} portfolio at 400+ modern trade outlets in ${g}.`,        category:"distribution", eventType:"Exclusive partnership announcements", magnitude:0.88, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} files patent for extended-shelf-life ${s||"beverage"} formulation`,                             descFn: (a,s)   => `${a} patents a cold-chain reduction technology for its ${s||"beverage"} range, enabling wider off-grid distribution.`,                category:"formulation",  eventType:"Patent filings",                     magnitude:0.73, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} cuts ${s||"beverage"} price 15% across metro markets in ${g}`,                                descFn: (a,s,g) => `${a} drops price on core ${s||"soft drink"} SKUs by 15% to defend volume share in ${g} metros.`,                              category:"pricing",      eventType:"List price changes",                  magnitude:0.78, sourceConfidence:0.82, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} repositions ${s||"beverage"} brand as "natural hydration" platform in ${g}`,                  descFn: (a,s,_g) => `${a} overhauls ${s||"beverage"} brand identity around natural ingredients and wellness.`,                                        category:"positioning",  eventType:"Brand repositioning signals",         magnitude:0.67, sourceConfidence:0.70, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} expands into QSR and co-branding partnerships for ${s||"beverage"} in ${g}`,                  descFn: (a,s,g) => `${a} signs co-branding deals with top QSR chains in ${g} to drive ${s||"beverage"} trial.`,                                      category:"distribution", eventType:"Co-branding / licensing deals",        magnitude:0.72, sourceConfidence:0.80, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} launches energy and functionality-enhanced ${s||"beverage"} range in ${g}`,                   descFn: (a,s,g) => `${a} enters the functional ${s||"beverage"} space with electrolyte and vitamin-enriched variants in ${g}.`,                     category:"product",      eventType:"SKU launches",                       magnitude:0.84, sourceConfidence:0.90, isDirectlyVerifiable:true,  channel:"E-commerce"   },
  { titleFn: (a,_s,g) => `${a} scales digital and vending channel strategy for on-the-go consumption in ${g}`,              descFn: (a,_s,g) => `${a} deploys 2,000+ smart vending units and a direct delivery app to capture on-the-go ${g} consumers.`,                       category:"digital",      eventType:"App / DTC launches",                 magnitude:0.65, sourceConfidence:0.78, isDirectlyVerifiable:false, channel:"E-commerce"   },
];

const DAIRY_TEMPLATES: SignalTpl[] = [
  { titleFn: (a,s,g) => `${a} launches probiotic-enriched ${s||"dairy"} targeting gut-health consumers in ${g}`,            descFn: (a,s,g) => `${a} enters the functional ${s||"dairy"} space with probiotic variants in ${g}.`,                                              category:"product",      eventType:"SKU launches",                       magnitude:0.88, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,_s,g) => `${a} secures traceable farm-to-shelf sourcing partnership in ${g}`,                                descFn: (a,s,g) => `${a} partners with local farms in ${g} for traceable, sustainably sourced ${s||"dairy"} ingredients.`,                         category:"distribution", eventType:"Exclusive partnership announcements", magnitude:0.74, sourceConfidence:0.85, isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} files clean-label patent removing artificial preservatives from ${s||"dairy"} range`,         descFn: (a,s)   => `${a} patents a preservative-free formulation for its ${s||"dairy"} portfolio.`,                                                  category:"formulation",  eventType:"Patent filings",                     magnitude:0.76, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} increases trade promotions 25% in premium ${s||"dairy"} segment across ${g}`,                descFn: (a,s,g) => `${a} ramps trade marketing investment in ${g} to defend volume share against new ${s||"dairy"} entrants.`,                     category:"pricing",      eventType:"Promotional mechanics",              magnitude:0.70, sourceConfidence:0.80, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} shifts ${s||"dairy"} messaging to "family nutrition" platform in ${g}`,                      descFn: (a,s,g) => `${a} relaunches ${s||"dairy"} brand with a unified "family nutrition" positioning across ${g}.`,                                  category:"positioning",  eventType:"Brand repositioning signals",         magnitude:0.62, sourceConfidence:0.72, isDirectlyVerifiable:false, channel:"Modern Trade" },
];

const FMCG_TEMPLATES: SignalTpl[] = [
  { titleFn: (a,s,g) => `${a} launches premium ${s||"product"} variant targeting value-seeking consumers in ${g}`,          descFn: (a,s,g) => `${a} introduces an upgraded ${s||"product"} line in ${g} to compete in the premium tier.`,                                    category:"product",      eventType:"SKU launches",                       magnitude:0.88, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} files reformulation patent for ${s||"product"} with improved ingredient profile`,              descFn: (a,s)   => `${a} patents a next-generation formulation for its ${s||"product"} line.`,                                                      category:"formulation",  eventType:"Patent filings",                     magnitude:0.76, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} increases promotional investment 22% in ${s||"product"} segment across ${g}`,                descFn: (a,s,g) => `${a} steps up trade and consumer promotion for ${s||"product"} in ${g}.`,                                                      category:"pricing",      eventType:"Promotional mechanics",              magnitude:0.73, sourceConfidence:0.78, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,_s,g) => `${a} secures exclusive shelf agreement with leading retail chains in ${g}`,                       descFn: (a,s,g) => `${a} locks in premium shelf placement for its ${s||"product"} range across 200+ outlets in ${g}.`,                            category:"distribution", eventType:"Exclusive partnership announcements", magnitude:0.85, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} repositions ${s||"product"} brand around "trusted quality" platform across APAC`,             descFn: (a,s)   => `${a} overhauls brand messaging for ${s||"product"} with a unified "trusted quality" narrative.`,                                 category:"positioning",  eventType:"Claim changes or additions",          magnitude:0.65, sourceConfidence:0.70, isDirectlyVerifiable:false, channel:"Modern Trade" },
  { titleFn: (a,s)   => `${a} expands R&D team with 16 innovation hires for ${s||"product"} pipeline`,                      descFn: (a,s)   => `${a} invests in innovation talent to accelerate ${s||"product"} cycle.`,                                                          category:"org",          eventType:"Team expansions in R&D / Sales",     magnitude:0.58, sourceConfidence:0.90, isDirectlyVerifiable:true,  channel:"Modern Trade" },
  { titleFn: (a,s,g) => `${a} launches DTC subscription model for ${s||"product"} in ${g}`,                                descFn: (a,s,g) => `${a} enters direct-to-consumer with a subscription offering for its ${s||"product"} range in ${g}.`,                          category:"digital",      eventType:"App / DTC launches",                 magnitude:0.60, sourceConfidence:0.75, isDirectlyVerifiable:false, channel:"E-commerce"   },
  { titleFn: (a,s)   => `${a} transitions ${s||"product"} packaging to sustainable materials`,                               descFn: (a,s)   => `${a} announces full packaging transition for its ${s||"product"} range to recyclable materials.`,                                  category:"packaging",    eventType:"Sustainable material switches",       magnitude:0.50, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Modern Trade" },
];

const PC_TEMPLATES: SignalTpl[] = [
  { titleFn: (a,s,g) => `${a} launches OLED ${s||"touchscreen laptop"} targeting premium segment in ${g}`,                  descFn: (a,s,g) => `${a} introduces an OLED ${s||"laptop"} with AI-powered features targeting premium creators and enterprise in ${g}.`,               category:"product",      eventType:"SKU launches",                       magnitude:0.95, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Retail"       },
  { titleFn: (a,_s,g) => `${a} secures exclusive retail placement deal in top electronics outlets in ${g}`,                  descFn: (a,s,g) => `${a} signs exclusive retail partnership at 200+ premium electronics outlets across ${g}.`,                                        category:"distribution", eventType:"Exclusive partnership announcements", magnitude:0.88, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"Retail"       },
  { titleFn: (a,s,g) => `${a} launches keyboard + stylus bundle at competitive price in ${g}`,                               descFn: (a,s,g) => `${a} bundles accessories with its ${s||"laptop"} at an aggressive price to counter entry-level competitors in ${g}.`,           category:"pricing",      eventType:"Promotional mechanics",              magnitude:0.82, sourceConfidence:0.85, isDirectlyVerifiable:false, channel:"E-commerce"   },
  { titleFn: (a,s,g) => `${a} files patent for AI-personalization feature in ${s||"laptop"} range`,                          descFn: (a,s)   => `${a} patents an AI-powered adaptive interface for its ${s||"laptop"} product line.`,                                                category:"digital",      eventType:"Patent filings",                     magnitude:0.72, sourceConfidence:1.0,  isDirectlyVerifiable:true,  channel:"E-commerce"   },
  { titleFn: (a,s,g) => `${a} repositions ${s||"laptop"} line as "creator and enterprise" platform in ${g}`,                descFn: (a,s,g) => `${a} relaunches its ${s||"laptop"} messaging around creator productivity and enterprise AI integration in ${g}.`,                 category:"positioning",  eventType:"Brand repositioning signals",         magnitude:0.78, sourceConfidence:0.80, isDirectlyVerifiable:false, channel:"Retail"       },
  { titleFn: (a,s,g) => `${a} launches enterprise B2B direct sales channel for ${s||"laptop"} in ${g}`,                     descFn: (a,s,g) => `${a} opens an enterprise-direct procurement channel for its ${s||"laptop"} in ${g}, targeting IT decision-makers.`,               category:"distribution", eventType:"New retail / channel entries",         magnitude:0.75, sourceConfidence:0.88, isDirectlyVerifiable:true,  channel:"B2B"          },
  { titleFn: (a,s,g) => `${a} cuts entry-level ${s||"laptop"} price 12% to capture mid-market in ${g}`,                    descFn: (a,s,g) => `${a} reduces pricing on its mid-range ${s||"laptop"} SKUs by 12% to contest budget competition in ${g}.`,                        category:"pricing",      eventType:"List price changes",                  magnitude:0.80, sourceConfidence:0.82, isDirectlyVerifiable:false, channel:"Retail"       },
  { titleFn: (a,s)   => `${a} expands ${s||"laptop"} R&D team with 20 AI and display engineers`,                            descFn: (a,s)   => `${a} adds 20 specialist engineering roles focused on AI and display innovation for its ${s||"laptop"} portfolio.`,                  category:"org",          eventType:"Team expansions in R&D / Sales",     magnitude:0.62, sourceConfidence:0.90, isDirectlyVerifiable:true,  channel:"Retail"       },
];

const DATES = [
  new Date("2026-04-12"), new Date("2026-04-09"), new Date("2026-04-06"), new Date("2026-04-03"),
  new Date("2026-03-30"), new Date("2026-03-27"), new Date("2026-03-24"), new Date("2026-03-20"),
];

function getTemplatesForGroup(catG: CatGroup): SignalTpl[] {
  if (catG === "pc")            return PC_TEMPLATES;
  if (catG === "confectionery") return CONF_TEMPLATES;
  if (catG === "beverage")      return BEV_TEMPLATES;
  if (catG === "dairy")         return DAIRY_TEMPLATES;
  return FMCG_TEMPLATES;
}

// ─── EVENT BUILDER ────────────────────────────────────────────────────────────

export function buildDynamicSignalEvents(config: StoredConfig): SignalEvent[] {
  const { category, subCategory, country } = config;
  const sub  = subCategory || category;
  const geo  = country || "India";
  const catG = detectCatGroup(category);
  const competitors = config.competitors.length > 0
    ? config.competitors
    : DEFAULT_COMPETITORS[catG];
  const tmpls = getTemplatesForGroup(catG);
  const num   = Math.min(8, Math.max(5, competitors.length));
  return Array.from({ length: num }, (_, i) => {
    const actor = competitors[i % competitors.length];
    const tmpl  = tmpls[i % tmpls.length];
    return {
      id:                   `dyn-${i}`,
      title:                tmpl.titleFn(actor, sub, geo),
      description:          tmpl.descFn(actor, sub, geo),
      category:             tmpl.category,
      eventType:            tmpl.eventType,
      magnitude:            Math.max(0.40, tmpl.magnitude - i * 0.02),
      sourceConfidence:     tmpl.sourceConfidence,
      isDirectlyVerifiable: tmpl.isDirectlyVerifiable,
      geography:            geo,
      channel:              tmpl.channel,
      actor,
      timestamp:            DATES[i % DATES.length],
    };
  });
}

// ─── WORKSPACE BUILDER ────────────────────────────────────────────────────────

export function buildDynamicWorkspace(config: StoredConfig): WorkspaceProfile {
  const { category, subCategory, region, country, intentFilters,
          positioning, vulnerabilities, consumers, selectedSignals } = config;
  const geo  = country || region || "India";
  const catG = detectCatGroup(category);
  const competitors = config.competitors.length > 0
    ? config.competitors
    : DEFAULT_COMPETITORS[catG];
  const allCats = (selectedSignals && selectedSignals.length > 0)
    ? selectedSignals
    : catG === "pc"
    ? ["product", "digital", "pricing", "distribution", "positioning", "org"]
    : ["product", "pricing", "positioning", "formulation", "distribution", "packaging", "org", "claims"];
  return {
    categories:  allCats,
    markets:     [geo, region].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i),
    channels:    catG === "pc"
      ? ["Retail", "E-commerce", "B2B", "Enterprise"]
      : catG === "beverage"
      ? ["Modern Trade", "E-commerce", "QSR / Food Service", "General Trade"]
      : ["Modern Trade", "General Trade", "E-commerce"],
    competitors: competitors.map((name, i) => ({
      name,
      tier: (i < Math.ceil(competitors.length / 2) ? "primary" : "secondary") as "primary" | "secondary",
    })),
    minScopeThreshold: 0.35,
    alertThreshold:    50,
    positioning: positioning?.trim()
      ? positioning
      : `Leading ${subCategory || category} brand focused on quality, innovation, and consumer trust`,
    consumerProfiles: consumers && consumers.length > 0
      ? consumers
      : ["Premium Consumers", "Health-conscious Shoppers", "Brand-loyal Households"],
    vulnerabilities: vulnerabilities && vulnerabilities.length > 0
      ? vulnerabilities
      : ["Premium pricing sensitivity", "Shelf placement risk", "Competitor reformulation pace"],
    intents:      intentFilters.length > 0 ? intentFilters : ["Defend market share", "Track competitor moves"],
    capabilities: { product: 0.80, pricing: 0.78, messaging: 0.82, distribution: 0.72 },
    revenueShare: { [geo]: 0.60, Global: 0.40 },
    eventHistory: [],
  };
}

// ─── IMPACT ANALYSIS HELPERS ──────────────────────────────────────────────────

export interface RiskArea {
  area:        string;
  risk:        "High" | "Medium";
  driver:      string;
  probability: number;
  icon:        string;
}

export function getRiskAreas(config: StoredConfig): RiskArea[] {
  const catG = detectCatGroup(config.category);
  const comp0 = config.competitors[0] ?? DEFAULT_COMPETITORS[catG][0];
  const comp1 = config.competitors[1] ?? DEFAULT_COMPETITORS[catG][1];
  const sub   = config.subCategory || config.category;
  const geo   = config.country || config.region || "the region";

  if (catG === "pc") return [
    { area: "Display Technology Adoption Wave",   risk: "High",   driver: `${comp0} OLED/display launches threatening premium segment`,       probability: 78, icon: "🖥️" },
    { area: "Enterprise Account Loss",            risk: "High",   driver: `${comp0} enterprise AI bundling and ecosystem integration`,         probability: 71, icon: "🏢" },
    { area: "Retail Distribution Disadvantage",   risk: "Medium", driver: `${comp1} exclusive retail channel deals in ${geo}`,                 probability: 58, icon: "🏪" },
    { area: "Mid-Range Price Compression",        risk: "Medium", driver: "Aggressive pricing by secondary competitors",                        probability: 52, icon: "💰" },
  ];
  if (catG === "beverage") return [
    { area: "Health & Zero-Sugar Segment Erosion",risk: "High",   driver: `${comp0} zero-sugar and functional ${sub} launches`,                probability: 76, icon: "🥤" },
    { area: "Consumer Switching to Alternatives", risk: "High",   driver: `${comp1} wellness and natural positioning campaigns`,                probability: 69, icon: "🏃" },
    { area: "Distribution Access Disadvantage",   risk: "Medium", driver: `${comp0} exclusive QSR and vending partnerships in ${geo}`,          probability: 57, icon: "🏪" },
    { area: "Price Compression in Core SKUs",     risk: "Medium", driver: "Price cuts across metro markets by top competitors",                 probability: 51, icon: "💰" },
  ];
  if (catG === "confectionery") return [
    { area: "Premium Segment Erosion",            risk: "High",   driver: `${comp0} artisan and premium ${sub} launches`,                      probability: 75, icon: "🍫" },
    { area: "Health-Conscious Consumer Migration",risk: "High",   driver: `${comp1} sugar-reduction and clean-label campaigns`,                 probability: 68, icon: "🏃" },
    { area: "Distribution Disadvantage",          risk: "Medium", driver: `${comp0} exclusive shelf placement in key retail`,                   probability: 55, icon: "🏪" },
    { area: "Price Tier Compression",             risk: "Medium", driver: "Promotional surges by value-tier entrants",                          probability: 50, icon: "💰" },
  ];
  if (catG === "dairy") return [
    { area: "Plant-Based Alternative Disruption", risk: "High",   driver: `${comp0} plant-based ${sub} product launches`,                      probability: 72, icon: "🌱" },
    { area: "Probiotic / Functional Threat",      risk: "High",   driver: `${comp1} probiotic and functional dairy launches`,                   probability: 65, icon: "🎯" },
    { area: "Cold-Chain Distribution Loss",       risk: "Medium", driver: `${comp0} exclusive farm-to-shelf sourcing partnerships`,             probability: 55, icon: "🏪" },
    { area: "Private Label Growth",               risk: "Medium", driver: "Retailer private-label dairy growth in premium aisle",                probability: 48, icon: "💰" },
  ];
  return [
    { area: "Premium Segment Pressure",           risk: "High",   driver: `${comp0} premium ${sub} launches and reformulations`,               probability: 73, icon: "🎯" },
    { area: "Consumer Brand Loyalty Erosion",     risk: "High",   driver: `${comp1} aggressive digital and DTC positioning`,                    probability: 65, icon: "🏃" },
    { area: "Shelf Space Disadvantage",           risk: "Medium", driver: `${comp0} exclusive retail placement deals`,                          probability: 55, icon: "🏪" },
    { area: "Price Compression",                  risk: "Medium", driver: "Promotional mechanics and trade deals by secondary brands",           probability: 49, icon: "💰" },
  ];
}

export function getRevenueAtRisk(catG: CatGroup): string {
  if (catG === "pc")            return "$80–120M";
  if (catG === "beverage")      return "₹35–55Cr";
  if (catG === "confectionery") return "₹40–60Cr";
  if (catG === "dairy")         return "₹25–40Cr";
  return "₹30–50Cr";
}

// ─── RESPONSE ACTION HELPERS ──────────────────────────────────────────────────

export interface LeverOption {
  id: string;
  name: string;
  timeline: string;
  effort: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  effortColor: string;
  impactColor: string;
}

export interface ResponseLever {
  id:          string;
  title:       string;
  options:     LeverOption[];
}

function mkOpt(
  id: string, name: string, timeline: string,
  effort: "High" | "Medium" | "Low", impact: "High" | "Medium" | "Low"
): LeverOption {
  const effortColor = effort === "High" ? "bg-red-100 text-red-700" : effort === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
  const impactColor = impact === "High" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  return { id, name, timeline, effort, impact, effortColor, impactColor };
}

export function buildResponseLevers(config: StoredConfig): ResponseLever[] {
  const catG = detectCatGroup(config.category);
  const sub  = config.subCategory || config.category;

  const shared = {
    pricing: {
      id: "pricing", title: "2. PRICING & PROMOTION",
      options: [
        mkOpt("A", `Introduce bundle / multi-pack pricing for ${sub} in key channels`, "30 days", "Low", "Medium"),
        mkOpt("B", "Increase trade promotional frequency 20% across modern trade",       "45 days", "Medium", "Medium"),
      ],
    } as ResponseLever,
    messaging: {
      id: "messaging", title: "3. MESSAGING",
      options: [
        mkOpt("A", `Shift campaign narrative to quality and authenticity platform for ${sub}`, "21 days", "Low", "High"),
        mkOpt("B", "Counter competitor claims with transparent proof points and ingredient story", "30 days", "Medium", "High"),
      ],
    } as ResponseLever,
  };

  if (catG === "beverage") return [
    { id: "product", title: "1. PRODUCT & INNOVATION", options: [
      mkOpt("A", `Accelerate zero-sugar / functional ${sub} variant launch`, "90 days", "High", "High"),
      mkOpt("B", `Reformulate core ${sub} with natural preservatives and clean label`,   "60 days", "Medium", "High"),
      mkOpt("C", "Launch limited electrolyte / wellness-enhanced trial SKU",              "45 days", "Low", "Medium"),
    ]},
    shared.pricing,
    { id: "messaging", title: "3. MESSAGING", options: [
      mkOpt("A", "Shift campaign to 'natural hydration, real refreshment' platform",     "21 days", "Low", "High"),
      mkOpt("B", "Counter artificial sweetener perception with ingredient transparency", "30 days", "Medium", "High"),
    ]},
    { id: "distribution", title: "4. DISTRIBUTION", options: [
      mkOpt("A", "Secure exclusive cold-shelf placement in top 500 modern trade outlets", "60 days", "High", "High"),
      mkOpt("B", "Expand vending and on-the-go digital channel presence",                 "45 days", "Medium", "Medium"),
    ]},
  ];

  if (catG === "confectionery") return [
    { id: "product", title: "1. PRODUCT & INNOVATION", options: [
      mkOpt("A", `Accelerate low-sugar / clean-label ${sub} variant launch`,           "90 days", "High", "High"),
      mkOpt("B", "Reformulate existing SKU with natural ingredients and clean label",    "60 days", "Medium", "High"),
      mkOpt("C", "Launch limited premium artisan edition for trial and PR value",        "45 days", "Low", "Medium"),
    ]},
    { id: "pricing", title: "2. PRICING & PROMOTION", options: [
      mkOpt("A", "Bundle pricing in gifting channel (pack of 3 + 1 free)",              "30 days", "Low", "Medium"),
      mkOpt("B", "Increase trade promotional frequency 20% in modern trade",             "45 days", "Medium", "Medium"),
    ]},
    { id: "messaging", title: "3. MESSAGING", options: [
      mkOpt("A", "Shift campaign to 'real cocoa, real taste' premium narrative",         "21 days", "Low", "High"),
      mkOpt("B", "Counter health-alternative threat with indulgence + moderation story", "30 days", "Medium", "High"),
    ]},
    { id: "distribution", title: "4. DISTRIBUTION", options: [
      mkOpt("A", "Secure premium shelf placement in top 500 modern trade outlets",       "60 days", "High", "High"),
      mkOpt("B", "Expand gifting / seasonal aisle visibility in key retail chains",      "45 days", "Medium", "Medium"),
    ]},
  ];

  if (catG === "pc") return [
    { id: "product", title: "1. PRODUCT & INNOVATION", options: [
      mkOpt("A", `Accelerate OLED / high-refresh display ${sub} variant for premium segment`, "90 days", "High", "High"),
      mkOpt("B", "Integrate AI-powered stylus and pen interaction features",                    "60 days", "Medium", "High"),
      mkOpt("C", "Launch limited creator edition targeting design professionals",                "45 days", "Low", "Medium"),
    ]},
    { id: "pricing", title: "2. PRICING & PROMOTION", options: [
      mkOpt("A", "Bundle keyboard + stylus accessory at competitive launch price", "30 days", "Low", "Medium"),
      mkOpt("B", "Trade-in upgrade program for 3+ year-old devices",               "45 days", "Medium", "Medium"),
    ]},
    { id: "messaging", title: "3. MESSAGING", options: [
      mkOpt("A", "Shift narrative to 'Built for creators & enterprise professionals'",  "21 days", "Low", "High"),
      mkOpt("B", "Counter ecosystem lock-in with cross-platform flexibility story",     "30 days", "Medium", "High"),
    ]},
    { id: "distribution", title: "4. DISTRIBUTION", options: [
      mkOpt("A", "Secure premium placement in top 200 electronics retail outlets",  "60 days", "High", "High"),
      mkOpt("B", "Expand B2B/enterprise direct sales channel for IT procurement",   "45 days", "Medium", "Medium"),
    ]},
  ];

  if (catG === "dairy") return [
    { id: "product", title: "1. PRODUCT & INNOVATION", options: [
      mkOpt("A", `Accelerate probiotic / functional ${sub} variant launch`, "90 days", "High", "High"),
      mkOpt("B", "Reformulate with clean-label ingredients and traceable sourcing", "60 days", "Medium", "High"),
      mkOpt("C", `Launch limited plant-forward or reduced-fat ${sub} trial SKU`,   "45 days", "Low", "Medium"),
    ]},
    { id: "pricing", title: "2. PRICING & PROMOTION", options: [
      mkOpt("A", "Family bundle promotion with value-pack pricing",                        "30 days", "Low", "Medium"),
      mkOpt("B", "Increase promotional frequency 25% in health & wellness aisle",          "45 days", "Medium", "Medium"),
    ]},
    { id: "messaging", title: "3. MESSAGING", options: [
      mkOpt("A", "Shift campaign to 'family nutrition, traceable quality' platform",       "21 days", "Low", "High"),
      mkOpt("B", "Counter plant-based alternatives with taste and nutrition proof points", "30 days", "Medium", "High"),
    ]},
    { id: "distribution", title: "4. DISTRIBUTION", options: [
      mkOpt("A", "Secure premium cold-shelf in top 400 modern trade outlets",       "60 days", "High", "High"),
      mkOpt("B", "Expand health & wellness aisle and online direct delivery",        "45 days", "Medium", "Medium"),
    ]},
  ];

  // fmcg
  return [
    { id: "product", title: "1. PRODUCT & INNOVATION", options: [
      mkOpt("A", `Accelerate premium ${sub} variant launch with improved ingredient profile`, "90 days", "High", "High"),
      mkOpt("B", "Reformulate with clean-label ingredients to address consumer sentiment",      "60 days", "Medium", "High"),
      mkOpt("C", "Launch limited trial SKU targeting premium health-conscious segment",          "45 days", "Low", "Medium"),
    ]},
    shared.pricing,
    shared.messaging,
    { id: "distribution", title: "4. DISTRIBUTION", options: [
      mkOpt("A", "Secure exclusive shelf placement in top 400 retail outlets", "60 days", "High", "High"),
      mkOpt("B", "Expand DTC and e-commerce subscription channel",             "45 days", "Medium", "Medium"),
    ]},
  ];
}

export function buildActionPlan(config: StoredConfig): Array<{
  period: string; color: string;
  tasks: Array<{ task: string; team: string; owner: string }>;
}> {
  const catG = detectCatGroup(config.category);
  const sub  = config.subCategory || config.category;

  const week1: (task: string, team: string) => { task: string; team: string; owner: string } =
    (task, team) => ({ task, team, owner: `${team} Lead` });

  if (catG === "beverage") return [
    { period: "Week 1–2", color: "bg-blue-600", tasks: [
      week1(`Evaluate promotional elasticity across metro and QSR channels`, "Pricing"),
      week1(`Update campaign messaging to natural hydration platform for ${sub}`, "Marketing"),
      week1("Brief agency on counter-messaging for sweetener perception", "Marketing"),
    ]},
    { period: "Week 3–6", color: "bg-purple-600", tasks: [
      week1(`Feasibility study on zero-sugar / functional ${sub} variant`, "Product"),
      week1("Identify top 500 modern trade and QSR placement targets",      "Sales"),
      week1("Negotiate bundle mechanics with key retail and QSR partners",  "Trade Marketing"),
    ]},
    { period: "Week 7–12", color: "bg-green-600", tasks: [
      week1(`Launch zero-sugar ${sub} pilot in 3 metro markets`, "Product"),
      week1("Activate full campaign with natural hydration positioning", "Marketing"),
      week1("Review channel execution metrics and distribution coverage",    "Sales"),
    ]},
  ];

  if (catG === "pc") return [
    { period: "Week 1–2", color: "bg-blue-600", tasks: [
      week1("Evaluate bundle pricing elasticity across Tier 1 electronics retail", "Pricing"),
      week1("Update messaging to creator & enterprise professional angle",          "Marketing"),
      week1("Brief agency on cross-platform flexibility counter-narrative",         "Marketing"),
    ]},
    { period: "Week 3–6", color: "bg-purple-600", tasks: [
      week1(`Feasibility study on OLED / premium display ${sub} integration`, "Product"),
      week1("Identify and pitch top 200 electronics retail placement targets",  "Sales"),
      week1("Design and launch trade-in upgrade program mechanics",             "Trade Marketing"),
    ]},
    { period: "Week 7–12", color: "bg-green-600", tasks: [
      week1(`Pilot premium ${sub} variant in 3 key metro markets`,       "Product"),
      week1("Activate full repositioning campaign with creator/pro assets", "Marketing"),
      week1("Review retail placement execution and B2B pipeline metrics",   "Sales"),
    ]},
  ];

  return [
    { period: "Week 1–2", color: "bg-blue-600", tasks: [
      week1("Evaluate promo elasticity and pricing mechanics across key channels",   "Pricing"),
      week1(`Update campaign messaging for ${sub} to quality and trust platform`,   "Marketing"),
      week1("Brief agency on competitive counter-messaging approach",                "Marketing"),
    ]},
    { period: "Week 3–6", color: "bg-purple-600", tasks: [
      week1(`Feasibility study on ${sub} reformulation and ingredient upgrade`, "Product"),
      week1("Identify top 400 retail targets for premium shelf placement",        "Sales"),
      week1("Negotiate bundle and trade deal mechanics with key retailers",       "Trade Marketing"),
    ]},
    { period: "Week 7–12", color: "bg-green-600", tasks: [
      week1(`Launch upgraded ${sub} variant pilot across 3 key markets`, "Product"),
      week1("Activate full campaign with updated positioning",              "Marketing"),
      week1("Review distribution metrics and shelf execution",              "Sales"),
    ]},
  ];
}
