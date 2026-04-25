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

export const PILLAR_META: Record<Pillar, { label: string; shortLabel: string; max: number; description: string; tone: string }> = {
  1: { label: "Digital Presence",       shortLabel: "Digital",       max: 30, description: "Can a resident find the council online and use the site?", tone: "digital" },
  2: { label: "Contact Transparency",   shortLabel: "Contact",       max: 30, description: "Can a resident reach a named human at the council?",     tone: "contact" },
  3: { label: "Governance Documents",   shortLabel: "Governance",    max: 25, description: "Does the council publish the statutory documents?",     tone: "governance" },
  4: { label: "Democratic Openness",    shortLabel: "Democracy",     max: 15, description: "Can residents identify who represents them?",          tone: "democratic" },
};

export type IndicatorMeta = {
  id: string;
  pillar: Pillar;
  label: string;
  max: number;
  inputFields: string[];
  statute?: string;
};

export const INDICATORS: IndicatorMeta[] = [
  { id: "1.1", pillar: 1, label: "Active council website",                 max: 20, inputFields: ["website_url", "website_resolves"] },
  { id: "1.2", pillar: 1, label: "Website on a .gov.uk domain",            max: 5,  inputFields: ["website_url"], statute: "GDS Standard" },
  { id: "1.3", pillar: 1, label: "Accessibility statement published",      max: 5,  inputFields: ["has_accessibility_statement"], statute: "Accessibility Regs 2018" },
  { id: "2.1", pillar: 2, label: "General council email published",        max: 10, inputFields: ["email"] },
  { id: "2.2", pillar: 2, label: "Phone number published",                 max: 5,  inputFields: ["phone"] },
  { id: "2.3", pillar: 2, label: "Named clerk identified",                 max: 10, inputFields: ["clerk_name"], statute: "LGA 1972 s.112" },
  { id: "2.4", pillar: 2, label: "Clerk email published",                  max: 5,  inputFields: ["clerk_email"] },
  { id: "3.1", pillar: 3, label: "Meeting agendas published",              max: 7,  inputFields: ["has_agendas"], statute: "LGA 1972" },
  { id: "3.2", pillar: 3, label: "Meeting minutes published",              max: 8,  inputFields: ["has_minutes"], statute: "LGA 1972" },
  { id: "3.3", pillar: 3, label: "Financial documents / AGAR published",   max: 10, inputFields: ["has_financials"], statute: "Accounts & Audit Regs 2015" },
  { id: "4.1", pillar: 4, label: "Chair / Mayor named",                    max: 3,  inputFields: ["chair_name"] },
  { id: "4.2", pillar: 4, label: "At least three councillors listed",      max: 5,  inputFields: ["councillors_listed_count"] },
  { id: "4.3", pillar: 4, label: "Councillor contact methods published",   max: 4,  inputFields: ["councillors_email_count"] },
  { id: "4.4", pillar: 4, label: "Register of interests published",        max: 3,  inputFields: ["has_register_of_interests"], statute: "Localism Act 2011" },
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
