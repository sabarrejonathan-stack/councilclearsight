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
  methodology_version: string;
};

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
