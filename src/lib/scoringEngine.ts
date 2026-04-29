/**
 * Competitive Signal Scoring Engine
 *
 * TypeScript port of the Python score_competitor_event pipeline.
 * Mirrors all 6 steps: Scope → Significance → Impact → Fact/Inference → Actionability → Route
 *
 * Key propagation chain (Python spec):
 *   raw_impact
 *     → adjusted_impact   = raw_impact × (0.5 + 0.5 × sig/100)          [sig→impact]
 *     → conf_impact       = adjusted   × (0.6 + 0.4 × confidence)        [conf→impact]
 *     → final_impact      = conf_impact × (0.5 + 0.5 × actionability/100)[action→impact]
 *   Routing uses final_impact, not raw_impact.
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface WorkspaceProfile {
  categories: string[];
  markets: string[];
  channels: string[];
  competitors: Array<{ name: string; tier: "primary" | "secondary" }>;
  minScopeThreshold: number;
  alertThreshold: number;
  positioning: string;
  consumerProfiles: string[];
  vulnerabilities: string[];
  intents: string[];
  capabilities: {
    product: number;
    pricing: number;
    messaging: number;
    distribution: number;
  };
  revenueShare: Record<string, number>;
  eventHistory: SignalEvent[];
}

export interface SignalEvent {
  id: string;
  title: string;
  category: string;
  geography: string;
  channel: string;
  actor: string;
  eventType: string;
  magnitude: number;
  sourceConfidence: number;
  isDirectlyVerifiable: boolean;
  timestamp: Date;
  description: string;
}

export interface ScoringResult {
  eventId: string;
  // ── Step 1: Scope ──────────────────────────────────────────────────────────
  scopeRelevance: number;
  scopeBreakdown: {
    categoryMatch: number;
    geoMatch: number;
    channelMatch: number;
    competitorMatch: number;
  };
  // ── Step 2: Significance ───────────────────────────────────────────────────
  significanceScore: number;
  significanceBreakdown: {
    materiality: number;
    proximity: number;
    velocity: number;
  };
  // ── Step 3: Brand Impact (full chain) ──────────────────────────────────────
  rawImpactScore: number;          // before sig/conf/action adjustments
  impactScore: number;             // = final_impact_score after full chain
  impactBreakdown: {
    marketOverlap: number;
    positioningThreat: number;
    switchingRisk: number;
    commercialExposure: number;
    urgency: number;
  };
  // ── Step 4: Fact vs Inference ──────────────────────────────────────────────
  label: "observed_fact" | "inferred_intent" | "emerging_signal" | "unverified_signal";
  confidence: number;
  supportingSignalCount: number;
  // ── Step 5: Actionability ──────────────────────────────────────────────────
  actionabilityScore: number;
  actionabilityBreakdown: {
    productFit: number;
    priceFit: number;
    messageFit: number;
    distroFit: number;
    bestLever: string;
    timeScore: number;
    complexityPenalty: number;
  };
  // ── Step 6: Route ──────────────────────────────────────────────────────────
  route: "suppressed" | "digest_only"
       | "urgent_alert_response_plan" | "urgent_alert_suggest_options" | "urgent_alert_explain_only"
       | "analyst_review_response_plan" | "analyst_review_suggest_options" | "analyst_review_explain_only";
  suppressReason?: string;
  actionabilityLabel: "Explain Only" | "Suggest Options" | "Generate Plan + Owners";
}

// ─── STEP 1 HELPERS ───────────────────────────────────────────────────────────

function overlap(value: string, list: string[]): number {
  if (!list.length || !value) return 0;
  const v = value.toLowerCase();
  for (const item of list) {
    if (item.toLowerCase() === v) return 1.0;
  }
  for (const item of list) {
    const i = item.toLowerCase();
    if (i.includes(v) || v.includes(i)) return 0.7;
  }
  return 0;
}

function competitorPriority(
  actor: string,
  competitors: WorkspaceProfile["competitors"]
): number {
  const comp = competitors.find(c => c.name.toLowerCase() === actor.toLowerCase());
  if (!comp) return 0.1;
  return comp.tier === "primary" ? 1.0 : 0.6;
}

// ─── STEP 2 HELPERS ───────────────────────────────────────────────────────────

const MATERIALITY_SCORES: Record<string, number> = {
  // Product & Innovation
  "SKU launches": 0.90,
  "Reformulations": 0.85,
  "Feature releases": 0.88,
  "Patent filings": 0.65,
  "Clinical trial registrations": 0.70,
  "IND applications": 0.72,
  "Pilot / test market launches": 0.75,
  "Product discontinuations": 0.60,
  // Pricing & Commercial
  "List price changes": 0.88,
  "Promotional mechanics": 0.82,
  "Bundle / multi-pack offers": 0.70,
  "Channel-specific pricing shifts": 0.74,
  "Trade terms renegotiations": 0.68,
  "Reimbursement applications": 0.60,
  // Market Positioning
  "Campaign launches": 0.75,
  "Claim changes or additions": 0.80,
  "Brand repositioning signals": 0.82,
  "Comparative / head-to-head claims": 0.85,
  "Spokesperson / KOL activity": 0.60,
  // Distribution & Access
  "New retail / channel entries": 0.85,
  "Exclusive partnership announcements": 0.90,
  "DTC / e-commerce launches": 0.78,
  "App / DTC launches": 0.78,
  "Geographic expansions": 0.80,
  "Formulary / listing additions": 0.72,
  "Co-branding / licensing deals": 0.72,
  // Organisational
  "Executive hires (C-level, VP)": 0.55,
  "M&A activity": 0.95,
  "Team expansions in R&D / Sales": 0.58,
  "Talent acquisition surge": 0.58,
  "Investor day guidance": 0.65,
  "Leadership departures": 0.60,
  // Regulatory
  "Regulatory submissions": 0.78,
  "Approval decisions": 0.88,
  "Safety communications / recalls": 0.96,
  "Regulatory filings": 0.68,
  "IP / patent filings": 0.65,
  "Label expansions": 0.72,
  // Manufacturing / Packaging
  "New facility announcements": 0.78,
  "Capacity expansions / scale-ups": 0.82,
  "Sustainable material switches": 0.60,
  // Digital
  "Connected product launches": 0.85,
  "AI personalization features": 0.80,
};

/** assess_materiality(event_type, magnitude) */
function assessMateriality(eventType: string, magnitude: number): number {
  const base = MATERIALITY_SCORES[eventType] ?? 0.50;
  return base * (0.70 + 0.30 * magnitude);
}

/** assess_velocity(event, workspace.event_history) */
function assessVelocity(event: SignalEvent, history: SignalEvent[]): number {
  const now  = event.timestamp.getTime();
  const ms30 = 30 * 86_400_000;
  const ms90 = 90 * 86_400_000;
  const recent = history.filter(e => e.actor === event.actor && now - e.timestamp.getTime() <= ms30).length;
  const older  = history.filter(e => e.actor === event.actor && now - e.timestamp.getTime() > ms30 && now - e.timestamp.getTime() <= ms90).length;
  if (older === 0) return recent > 0 ? 0.65 : 0.30;
  return Math.min(1.0, 0.25 + 0.375 * (recent / older));
}

// ─── STEP 3 HELPERS ───────────────────────────────────────────────────────────

/** semantic_market_overlap(event, workspace) */
function semanticMarketOverlap(event: SignalEvent, workspace: WorkspaceProfile): number {
  return 0.60 * overlap(event.category, workspace.categories)
       + 0.40 * overlap(event.geography, workspace.markets);
}

/** threat_against_positioning(event, workspace.positioning) */
function threatAgainstPositioning(event: SignalEvent, positioning: string): number {
  const posLower = positioning.toLowerCase();
  const evtLower = `${event.title} ${event.description} ${event.eventType}`.toLowerCase();
  const THREAT_PAIRS = [
    { pos: ["premium", "luxury", "super premium"],               evt: ["low-cost", "affordable", "budget", "value", "mass", "discount"] },
    { pos: ["health", "natural", "clean", "wellness", "organic"],evt: ["health", "natural", "clean", "organic", "better-for-you", "functional"] },
    { pos: ["innovati", "technology", "digital", "smart", "ai"], evt: ["launch", "feature", "patent", "innovation", "ai", "connected"] },
    { pos: ["indulg", "taste", "delight", "sensory"],            evt: ["better-for-you", "health", "functional", "wellness", "clean"] },
    { pos: ["access", "distribution", "available", "retail"],   evt: ["exclusive", "partnership", "new channel", "listing"] },
  ];
  let score = 0.15;
  for (const { pos, evt } of THREAT_PAIRS) {
    if (pos.some(p => posLower.includes(p)) && evt.some(e => evtLower.includes(e))) score += 0.28;
  }
  return Math.min(1.0, score);
}

/** consumer_switch_probability(event, workspace.consumer_profile) */
function consumerSwitchProbability(event: SignalEvent, consumers: string[]): number {
  const evtLower  = event.eventType.toLowerCase();
  const consText  = consumers.join(" ").toLowerCase();
  const HIGH_SW   = ["sku launches", "list price changes", "reformulations", "brand repositioning"];
  const MED_SW    = ["promotional mechanics", "campaign launches", "new retail", "bundle", "claim changes"];
  let base = HIGH_SW.some(e => evtLower.includes(e)) ? 0.75
           : MED_SW.some(e => evtLower.includes(e))  ? 0.55 : 0.30;
  if ((consText.includes("price") || consText.includes("budget") || consText.includes("value")) &&
      (evtLower.includes("price") || evtLower.includes("promot") || evtLower.includes("bundle")))
    base = Math.min(1.0, base + 0.18);
  if ((consText.includes("health") || consText.includes("wellness") || consText.includes("fitness")) &&
      (evtLower.includes("health") || evtLower.includes("natural") || evtLower.includes("reformul")))
    base = Math.min(1.0, base + 0.18);
  if ((consText.includes("premium") || consText.includes("luxury")) &&
      (evtLower.includes("premium") || evtLower.includes("repositioning")))
    base = Math.min(1.0, base + 0.15);
  return base;
}

/** revenue_exposure(event, workspace.revenue_model) */
function revenueExposure(event: SignalEvent, revenueShare: Record<string, number>): number {
  const geoLower = event.geography.toLowerCase();
  let exposure = 0;
  for (const [market, share] of Object.entries(revenueShare)) {
    const m = market.toLowerCase();
    if (m.includes(geoLower) || geoLower.includes(m)) exposure += share;
  }
  return Math.min(1.0, exposure > 0 ? exposure : 0.45);
}

const URGENCY_SCORES: Record<string, number> = {
  "List price changes": 0.92,
  "Safety communications / recalls": 0.96,
  "Exclusive partnership announcements": 0.88,
  "SKU launches": 0.85,
  "Campaign launches": 0.78,
  "New retail / channel entries": 0.80,
  "Approval decisions": 0.82,
  "Brand repositioning signals": 0.76,
  "M&A activity": 0.80,
  "Reformulations": 0.72,
  "Capacity expansions / scale-ups": 0.50,
  "Patent filings": 0.42,
  "Executive hires (C-level, VP)": 0.38,
  "Investor day guidance": 0.45,
};

/** time_to_market_impact(event) — urgency of the competitive threat */
function timeToMarketImpact(event: SignalEvent): number {
  return URGENCY_SCORES[event.eventType] ?? 0.55;
}

// ─── STEP 4 HELPERS ───────────────────────────────────────────────────────────

function collectSupportingSignals(event: SignalEvent, history: SignalEvent[], windowDays = 180): SignalEvent[] {
  const now    = event.timestamp.getTime();
  const window = windowDays * 86_400_000;
  return history.filter(e => e.id !== event.id && e.actor === event.actor && Math.abs(now - e.timestamp.getTime()) <= window);
}

function inferIntentConfidence(supportingSignals: SignalEvent[]): number {
  const n = supportingSignals.length;
  if (n === 0) return 0.20;
  if (n === 1) return 0.45;
  if (n === 2) return 0.62;
  return Math.min(0.90, 0.62 + (n - 2) * 0.09);
}

// ─── STEP 5 HELPERS ───────────────────────────────────────────────────────────

const LEVER_EVENT_MAP: Record<string, string[]> = {
  product:      ["sku", "reformulat", "feature", "patent", "innovati", "clinical", "reformul", "new product"],
  pricing:      ["price", "promot", "bundle", "trade term", "reimburs"],
  messaging:    ["campaign", "repositioning", "claim", "spokesperson", "kol", "comparative"],
  distribution: ["channel", "partnership", "geographic", "listing", "retail", "exclusive", "dtc", "co-brand"],
};

function capabilityFit(event: SignalEvent, capabilityScore: number, lever: string): number {
  const keywords  = LEVER_EVENT_MAP[lever] ?? [];
  const evtLower  = `${event.eventType} ${event.category}`.toLowerCase();
  const isRelevant = keywords.some(k => evtLower.includes(k));
  return isRelevant ? capabilityScore : capabilityScore * 0.30;
}

/**
 * assess_time_to_execute(event) — how fast can the client respond to this type of move?
 * Pricing changes are near-instant; reformulations take months.
 */
const EXECUTION_TIME_SCORES: Record<string, number> = {
  "List price changes": 0.95,
  "Promotional mechanics": 0.90,
  "Claim changes or additions": 0.80,
  "Campaign launches": 0.75,
  "Brand repositioning signals": 0.65,
  "New retail / channel entries": 0.60,
  "App / DTC launches": 0.60,
  "DTC / e-commerce launches": 0.60,
  "Exclusive partnership announcements": 0.55,
  "Co-branding / licensing deals": 0.55,
  "SKU launches": 0.50,
  "Geographic expansions": 0.45,
  "New facility announcements": 0.40,
  "Reformulations": 0.35,
  "Patent filings": 0.30,
  "M&A activity": 0.25,
};

function assessTimeToExecute(event: SignalEvent): number {
  return EXECUTION_TIME_SCORES[event.eventType] ?? 0.55;
}

/**
 * assess_execution_complexity(event) — how complex is mounting a response?
 * Returns a penalty 0..1 (0 = simple, 1 = near-impossible).
 */
const COMPLEXITY_PENALTIES: Record<string, number> = {
  "M&A activity": 0.40,
  "Reformulations": 0.35,
  "Geographic expansions": 0.30,
  "SKU launches": 0.25,
  "New facility announcements": 0.25,
  "Exclusive partnership announcements": 0.20,
  "Patent filings": 0.20,
  "Co-branding / licensing deals": 0.18,
  "Campaign launches": 0.15,
  "New retail / channel entries": 0.15,
  "Brand repositioning signals": 0.12,
  "Claim changes or additions": 0.10,
  "App / DTC launches": 0.10,
  "Promotional mechanics": 0.10,
  "List price changes": 0.05,
};

function assessExecutionComplexity(event: SignalEvent): number {
  return COMPLEXITY_PENALTIES[event.eventType] ?? 0.15;
}

// ─── WEIGHTED SUM ─────────────────────────────────────────────────────────────

function weightedSum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

// ─── MAIN SCORING FUNCTION ────────────────────────────────────────────────────

export function scoreCompetitorEvent(event: SignalEvent, workspace: WorkspaceProfile): ScoringResult {

  // ── STEP 1: Scope Gate ────────────────────────────────────────────────────
  const categoryMatch   = overlap(event.category,  workspace.categories);
  const geoMatch        = overlap(event.geography,  workspace.markets);
  const channelMatch    = overlap(event.channel,    workspace.channels);
  const competitorMatch = competitorPriority(event.actor, workspace.competitors);

  const scopeRelevance = weightedSum([
    0.35 * categoryMatch,
    0.30 * geoMatch,
    0.15 * channelMatch,
    0.20 * competitorMatch,
  ]);

  if (scopeRelevance < workspace.minScopeThreshold) {
    return {
      eventId: event.id, scopeRelevance,
      scopeBreakdown: { categoryMatch, geoMatch, channelMatch, competitorMatch },
      significanceScore: 0, significanceBreakdown: { materiality: 0, proximity: 0, velocity: 0 },
      rawImpactScore: 0, impactScore: 0,
      impactBreakdown: { marketOverlap: 0, positioningThreat: 0, switchingRisk: 0, commercialExposure: 0, urgency: 0 },
      label: "unverified_signal", confidence: 0, supportingSignalCount: 0,
      actionabilityScore: 0,
      actionabilityBreakdown: { productFit: 0, priceFit: 0, messageFit: 0, distroFit: 0, bestLever: "none", timeScore: 0, complexityPenalty: 0 },
      route: "suppressed", suppressReason: "out_of_scope", actionabilityLabel: "Explain Only",
    };
  }

  // ── STEP 2: Significance ──────────────────────────────────────────────────
  const materiality = assessMateriality(event.eventType, event.magnitude);
  const proximity   = competitorPriority(event.actor, workspace.competitors);
  const velocity    = assessVelocity(event, workspace.eventHistory);

  const significanceScore = 100 * weightedSum([
    0.30 * scopeRelevance,
    0.30 * materiality,
    0.20 * proximity,
    0.20 * velocity,
  ]);

  if (significanceScore < workspace.alertThreshold) {
    return {
      eventId: event.id, scopeRelevance,
      scopeBreakdown: { categoryMatch, geoMatch, channelMatch, competitorMatch },
      significanceScore, significanceBreakdown: { materiality, proximity, velocity },
      rawImpactScore: 0, impactScore: 0,
      impactBreakdown: { marketOverlap: 0, positioningThreat: 0, switchingRisk: 0, commercialExposure: 0, urgency: 0 },
      label: event.sourceConfidence >= 0.8 ? "observed_fact" : "unverified_signal",
      confidence: event.sourceConfidence, supportingSignalCount: 0,
      actionabilityScore: 0,
      actionabilityBreakdown: { productFit: 0, priceFit: 0, messageFit: 0, distroFit: 0, bestLever: "none", timeScore: 0, complexityPenalty: 0 },
      route: "digest_only", actionabilityLabel: "Explain Only",
    };
  }

  // ── STEP 3: Raw Brand Impact ──────────────────────────────────────────────
  const marketOverlap      = semanticMarketOverlap(event, workspace);
  const positioningThreat  = threatAgainstPositioning(event, workspace.positioning);
  const switchingRisk      = consumerSwitchProbability(event, workspace.consumerProfiles);
  const commercialExposure = revenueExposure(event, workspace.revenueShare);
  const urgency            = timeToMarketImpact(event);

  const rawImpactScore = 100 * weightedSum([
    0.25 * marketOverlap,
    0.25 * positioningThreat,
    0.15 * switchingRisk,
    0.20 * commercialExposure,
    0.15 * urgency,
  ]);

  // 🔗 Significance → Impact (Python: adjusted_impact_score = raw * (0.5 + 0.5 * sig/100))
  const adjustedImpactScore = rawImpactScore * (0.5 + 0.5 * (significanceScore / 100));

  // ── STEP 4: Fact vs Inference ─────────────────────────────────────────────
  const isObservedFact = event.sourceConfidence >= 0.8 && event.isDirectlyVerifiable;

  let label: ScoringResult["label"];
  let confidence: number;
  let supportingSignalCount = 0;

  if (isObservedFact) {
    label      = "observed_fact";
    // Python: confidence = min(1.0, 0.7 + 0.3 * source_confidence)
    confidence = Math.min(1.0, 0.7 + 0.3 * event.sourceConfidence);
  } else {
    const supporting    = collectSupportingSignals(event, workspace.eventHistory, 180);
    supportingSignalCount = supporting.length;
    const intentConf    = inferIntentConfidence(supporting);
    // Python thresholds: >= 0.6 → inferred_intent, >= 0.3 → emerging_signal, else unverified
    label      = intentConf >= 0.6 ? "inferred_intent"
               : intentConf >= 0.3 ? "emerging_signal"
               :                     "unverified_signal";
    confidence = intentConf;
  }

  // 🔗 Confidence → Impact (Python: confidence_adjusted = adjusted * (0.6 + 0.4 * confidence))
  const confidenceAdjustedImpact = adjustedImpactScore * (0.6 + 0.4 * confidence);

  // ── STEP 5: Actionability ─────────────────────────────────────────────────
  const productFit = capabilityFit(event, workspace.capabilities.product,      "product");
  const priceFit   = capabilityFit(event, workspace.capabilities.pricing,       "pricing");
  const messageFit = capabilityFit(event, workspace.capabilities.messaging,     "messaging");
  const distroFit  = capabilityFit(event, workspace.capabilities.distribution,  "distribution");

  const levers = { product: productFit, pricing: priceFit, messaging: messageFit, distribution: distroFit };
  const bestLever = Object.entries(levers).sort(([, a], [, b]) => b - a)[0][0];

  // Python: top-2 average (not max) — more realistic execution estimate
  const top2 = [productFit, priceFit, messageFit, distroFit].sort((a, b) => b - a).slice(0, 2);
  const capabilityScore = (top2[0] + top2[1]) / 2;

  const timeScore        = assessTimeToExecute(event);
  const complexityPenalty = assessExecutionComplexity(event);

  // Python: actionability = 100 * capability_score * time_score * (1 - complexity_penalty)
  const actionabilityScore = 100 * capabilityScore * timeScore * (1 - complexityPenalty);

  // 🔗 Actionability → Final Impact (Python: final = conf_adjusted * (0.5 + 0.5 * action/100))
  const finalImpactScore = confidenceAdjustedImpact * (0.5 + 0.5 * (actionabilityScore / 100));

  // ── STEP 6: Composite routing (priority × response_type) ─────────────────
  // Python: priority = high/medium/low; response = response_plan/suggest_options/explain_only
  const priority = finalImpactScore  >= 75 ? "high"   : finalImpactScore  >= 50 ? "medium" : "low";
  const response = actionabilityScore >= 70 ? "response_plan" : actionabilityScore >= 40 ? "suggest_options" : "explain_only";

  const route: ScoringResult["route"] =
    priority === "high"   ? (`urgent_alert_${response}`   as ScoringResult["route"]) :
    priority === "medium" ? (`analyst_review_${response}` as ScoringResult["route"]) :
    "digest_only";

  const actionabilityLabel: ScoringResult["actionabilityLabel"] =
    response === "response_plan"   ? "Generate Plan + Owners" :
    response === "suggest_options" ? "Suggest Options"        : "Explain Only";

  return {
    eventId: event.id,
    scopeRelevance,
    scopeBreakdown: { categoryMatch, geoMatch, channelMatch, competitorMatch },
    significanceScore,
    significanceBreakdown: { materiality, proximity, velocity },
    rawImpactScore,
    impactScore: finalImpactScore,
    impactBreakdown: { marketOverlap, positioningThreat, switchingRisk, commercialExposure, urgency },
    label,
    confidence,
    supportingSignalCount,
    actionabilityScore,
    actionabilityBreakdown: { productFit, priceFit, messageFit, distroFit, bestLever, timeScore, complexityPenalty },
    route,
    actionabilityLabel,
  };
}

// ─── BATCH SCORING ────────────────────────────────────────────────────────────

export function scoreEventBatch(events: SignalEvent[], workspace: WorkspaceProfile): ScoringResult[] {
  return events
    .map(e => scoreCompetitorEvent(e, workspace))
    .sort((a, b) => {
      if (a.route === "suppressed" && b.route !== "suppressed") return 1;
      if (b.route === "suppressed" && a.route !== "suppressed") return -1;
      return b.impactScore - a.impactScore;
    });
}

// ─── DEFAULT THRESHOLDS ───────────────────────────────────────────────────────

export const DEFAULT_THRESHOLDS = {
  minScopeThreshold: 0.35,
  alertThreshold: 50,
  actionabilityThresholds: { generatePlan: 70, suggestOptions: 40 },
  routingThresholds: { urgentAlert: 75, analystReview: 50 },
} as const;
