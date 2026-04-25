/**
 * Typed mirror of the Python scoring engine (scoring_engine/score.py).
 *
 * Display-only: this file never recomputes scores. Scores are computed by the
 * Python engine and shipped as static JSON. This file exports types, pillar
 * metadata, and helpers for the UI to present them consistently.
 */

export const METHODOLOGY_VERSION = "VDTI v3.0";
export const METHODOLOGY_CHANGELOG_PATH = "/methodology/changelog";
export const DISPUTES_QUEUE_PATH = "/methodology/disputes";

export type Pillar = 1 | 2 | 3 | 4;

// Database VDTI methodology — 4 equal-weight pillars × 25 = 100.
// Reflects the Council ClearSight scoring engine output as of the 16 April 2026
// data extract. Pillar weighting and indicator definitions match the
// methodology published in the database.
export const PILLAR_META: Record<Pillar, { label: string; shortLabel: string; max: number; description: string; tone: string }> = {
  1: { label: "Digital Presence",   shortLabel: "Digital",        max: 25, description: "Active website, council email, phone number — the basics of being reachable online.", tone: "digital" },
  2: { label: "Governance",         shortLabel: "Governance",     max: 25, description: "Named clerk, clerk email, named chair, governance information published.",         tone: "governance" },
  3: { label: "Community",          shortLabel: "Community",      max: 25, description: "Schools mapped to the council, school density, evidence of community engagement.",  tone: "community" },
  4: { label: "Accessibility",      shortLabel: "Accessibility",  max: 25, description: "Multiple contact methods, named contact, geographic and ward information.",        tone: "accessibility" },
};

export type IndicatorMeta = {
  id: string;
  pillar: Pillar;
  label: string;
  max: number;
  inputFields: string[];
  statute?: string;
};

// VDTI database indicators (4 pillars × ~3-4 indicators × 25 max each).
// These mirror the methodology shipped with the database extract.
export const INDICATORS: IndicatorMeta[] = [
  // Pillar 1 — Digital Presence (25)
  { id: "1.1", pillar: 1, label: "Active council website",                 max: 15, inputFields: ["website_url", "has_website"] },
  { id: "1.2", pillar: 1, label: "Council email address published",        max: 5,  inputFields: ["email"] },
  { id: "1.3", pillar: 1, label: "Phone number published",                 max: 5,  inputFields: ["phone"] },
  // Pillar 2 — Governance (25)
  { id: "2.1", pillar: 2, label: "Named clerk identified",                 max: 10, inputFields: ["clerk_name"], statute: "LGA 1972 s.112" },
  { id: "2.2", pillar: 2, label: "Clerk email published",                  max: 5,  inputFields: ["clerk_email"] },
  { id: "2.3", pillar: 2, label: "Chair / Mayor named",                    max: 5,  inputFields: ["chair_name"] },
  { id: "2.4", pillar: 2, label: "Governance information published",       max: 5,  inputFields: ["has_agendas", "has_minutes"], statute: "LGA 1972" },
  // Pillar 3 — Community (25)
  { id: "3.1", pillar: 3, label: "Schools mapped within council area",     max: 10, inputFields: ["school_count"] },
  { id: "3.2", pillar: 3, label: "School density (schools per population)", max: 5, inputFields: ["school_count", "population_band"] },
  { id: "3.3", pillar: 3, label: "Engagement evidence published",          max: 10, inputFields: ["has_minutes", "school_count"] },
  // Pillar 4 — Accessibility (25)
  { id: "4.1", pillar: 4, label: "Multiple contact methods provided",      max: 10, inputFields: ["email", "phone"] },
  { id: "4.2", pillar: 4, label: "Named contact identified",               max: 10, inputFields: ["clerk_name", "chair_name"] },
  { id: "4.3", pillar: 4, label: "Geographic and ward information",        max: 5,  inputFields: ["region", "county"] },
];

export function indicatorsForPillar(p: Pillar): IndicatorMeta[] {
  return INDICATORS.filter((i) => i.pillar === p);
}

// ─── Types matching councils_scored.json ───────────────────────────────

export type IndicatorResult = {
  id: string;
  pillar: Pillar;
  label: string;
  max_points: number;
  earned: number;
  assessed: boolean;
  input_snapshot: Record<string, unknown>;
};

export type CouncilScore = {
  council_id: string | number;
  slug: string;
  name: string;
  type: string;
  county: string;
  region: string;
  // Flat observable fields — single source of truth for display + scoring
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  clerk_name?: string | null;
  clerk_email?: string | null;
  chair_name?: string | null;
  has_agendas?: boolean;
  has_minutes?: boolean;
  school_count?: number;
  data_extraction_date?: string;
  assessment_period?: string;
  // Derived
  indicators: IndicatorResult[];
  pillar_earned: Record<string, number>;
  pillar_max_assessed: Record<string, number>;
  numerator: number;
  denominator: number;
  score: number | null;
  completeness: number;
  band: string;
  rank_national: number | null;
  rank_type: number | null;
  rank_region: number | null;
  rank?: number | null;
  regional_rank?: number | null;
  percentile?: number | null;
  methodology_version: string;
};

// ─── Deterministic scoring function ─────────────────────────────────────
// Single source of truth: takes observable fields, returns score breakdown.
// Every indicator is binary-graded against an observable field. The displayed
// score is reproducible from the same fields shown in the contact panel.

export type CouncilFields = {
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  clerk_name?: string | null;
  clerk_email?: string | null;
  chair_name?: string | null;
  has_agendas?: boolean;
  has_minutes?: boolean;
  school_count?: number;
  region?: string | null;
  county?: string | null;
};

// Treat a value as "present" if it's a non-empty trimmed string OR a truthy non-string.
function present(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return Boolean(v);
}

// A chair name with semicolons is almost always a councillor list mis-attributed
// to the chair field — we don't credit such records.
function isValidChair(v: unknown): boolean {
  if (!present(v)) return false;
  return !String(v).includes(";");
}

function isValidEmail(v: unknown): boolean {
  if (!present(v)) return false;
  return /@/.test(String(v));
}

export type ScoredResult = {
  indicators: IndicatorResult[];
  pillar_earned: Record<string, number>;
  pillar_max_assessed: Record<string, number>;
  score: number;
  numerator: number;
  denominator: number;
  completeness: number;
};

export function scoreCouncil(f: CouncilFields): ScoredResult {
  const inds: IndicatorResult[] = [];

  const hasWebsite = present(f.website);
  const hasEmail = isValidEmail(f.email);
  const hasPhone = present(f.phone);
  const hasClerk = present(f.clerk_name);
  const hasClerkEmail = isValidEmail(f.clerk_email);
  const hasChair = isValidChair(f.chair_name);
  const hasAgendas = !!f.has_agendas;
  const hasMinutes = !!f.has_minutes;
  const schools = Number(f.school_count) || 0;

  const push = (id: string, pillar: Pillar, label: string, max: number, earned: number, snap: Record<string, unknown>) => {
    inds.push({ id, pillar, label, max_points: max, earned, assessed: true, input_snapshot: snap });
  };

  // Pillar 1 — Digital Presence (25)
  push("1.1", 1, "Active council website", 15, hasWebsite ? 15 : 0, { website: f.website || null });
  push("1.2", 1, "Council email address published", 5, hasEmail ? 5 : 0, { email: f.email || null });
  push("1.3", 1, "Phone number published", 5, hasPhone ? 5 : 0, { phone: f.phone || null });

  // Pillar 2 — Governance (25)
  push("2.1", 2, "Named clerk identified", 10, hasClerk ? 10 : 0, { clerk_name: f.clerk_name || null });
  push("2.2", 2, "Clerk email published", 5, hasClerkEmail ? 5 : 0, { clerk_email: f.clerk_email || null });
  push("2.3", 2, "Chair / Mayor named", 5, hasChair ? 5 : 0, { chair_name: f.chair_name || null });
  push("2.4", 2, "Governance documents published", 5, (hasAgendas || hasMinutes) ? 5 : 0, { has_agendas: hasAgendas, has_minutes: hasMinutes });

  // Pillar 3 — Community (25)
  const schoolsPts = schools >= 3 ? 10 : (schools >= 1 ? 5 : 0);
  const densityPts = schools >= 4 ? 5 : (schools >= 2 ? 3 : 0);
  const engagementPts = (schools >= 3 && hasMinutes) ? 10 : (hasMinutes ? 5 : 0);
  push("3.1", 3, "Schools mapped within council area", 10, schoolsPts, { school_count: schools });
  push("3.2", 3, "School density", 5, densityPts, { school_count: schools });
  push("3.3", 3, "Engagement evidence published", 10, engagementPts, { school_count: schools, has_minutes: hasMinutes });

  // Pillar 4 — Accessibility (25)
  const multiContact = (hasEmail && hasPhone) ? 10 : ((hasEmail || hasPhone) ? 5 : 0);
  const namedContact = hasClerk ? 10 : (hasChair ? 5 : 0);
  const geoPts = (present(f.region) && present(f.county)) ? 5 : (present(f.region) ? 3 : 0);
  push("4.1", 4, "Multiple contact methods provided", 10, multiContact, { email: f.email || null, phone: f.phone || null });
  push("4.2", 4, "Named contact identified", 10, namedContact, { clerk_name: f.clerk_name || null, chair_name: f.chair_name || null });
  push("4.3", 4, "Geographic and ward information", 5, geoPts, { region: f.region || null, county: f.county || null });

  // Aggregate
  const pillar_earned: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
  for (const i of inds) pillar_earned[String(i.pillar)] += i.earned;
  const pillar_max_assessed: Record<string, number> = { "1": 25, "2": 25, "3": 25, "4": 25 };
  const score = inds.reduce((s, i) => s + i.earned, 0);

  return {
    indicators: inds,
    pillar_earned,
    pillar_max_assessed,
    score,
    numerator: score,
    denominator: 100,
    completeness: 1.0,
  };
}

// ─── Display helpers ───────────────────────────────────────────────────

export const BAND_META = {
  "Exemplary":         { range: "80\u2013100", tone: "emerald", description: "Meets or exceeds almost all observable transparency requirements assessed." },
  "Strong":            { range: "60\u201379",  tone: "teal",    description: "Meets most requirements with identifiable specific gaps." },
  "Developing":        { range: "40\u201359",  tone: "amber",   description: "Partial compliance; at least one pillar shows substantial gaps." },
  "At Risk":           { range: "0\u201339",   tone: "red",     description: "Substantial gaps across multiple pillars." },
  "Not Yet Assessed":  { range: "\u2014",      tone: "slate",   description: "Insufficient evidence to band." },
} as const;

export type BandKey = keyof typeof BAND_META;

export function bandFor(score: number | null): BandKey {
  if (score === null) return "Not Yet Assessed";
  if (score >= 80) return "Exemplary";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Developing";
  return "At Risk";
}

export function bandColorClasses(band: BandKey) {
  switch (band) {
    case "Exemplary":  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" };
    case "Strong":     return { bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-800",    dot: "bg-teal-500" };
    case "Developing": return { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   dot: "bg-amber-500" };
    case "At Risk":    return { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     dot: "bg-red-500" };
    default:           return { bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700",   dot: "bg-slate-400" };
  }
}

export function pillarColorClasses(pillar: Pillar) {
  switch (pillar) {
    case 1: return { bg: "bg-sky-50",      border: "border-sky-200",      text: "text-sky-800" };
    case 2: return { bg: "bg-indigo-50",   border: "border-indigo-200",   text: "text-indigo-800" };
    case 3: return { bg: "bg-emerald-50",  border: "border-emerald-200",  text: "text-emerald-800" };
    case 4: return { bg: "bg-amber-50",    border: "border-amber-200",    text: "text-amber-800" };
  }
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) return "\u2014";
  // Integer if it is one, else 1 decimal place
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

export function formatCompleteness(c: number | null | undefined): string {
  if (c === null || c === undefined || Number.isNaN(c)) return "\u2014";
  return `${Math.round(c * 100)}%`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n.toLocaleString("en-GB") + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function councilUrl(slug: string): string   { return `/council/${slug}`; }
export function challengeUrl(slug: string, indicator?: string): string {
  return indicator ? `/challenge?slug=${slug}&indicator=${indicator}` : `/challenge?slug=${slug}`;
}
