/**
 * Typed mirror of the Python scoring engine (scoring_engine/score.py).
 *
 * Display-only: this file never recomputes scores. Scores are computed by the
 * Python engine and shipped as static JSON. This file exports types, pillar
 * metadata, and helpers for the UI to present them consistently.
 */

export const METHODOLOGY_VERSION = "VDTI v4.0";
export const METHODOLOGY_CHANGELOG_PATH = "/methodology/changelog";
export const DISPUTES_QUEUE_PATH = "/methodology/disputes";

export type Pillar = 1 | 2 | 3 | 4;

// VDTI v4.0 methodology — 4 equal-weight pillars × 25 = 100.
// Every indicator is binary or near-binary, anchored to a specific statute
// or regulation, and verifiable from observable evidence.
export const PILLAR_META: Record<Pillar, { label: string; shortLabel: string; max: number; description: string; tone: string }> = {
  1: { label: "Core Reachability",                shortLabel: "Reachability",   max: 25, description: "Can residents find and contact this council? Working website, email, phone, and a named clerk under LGA 1972 § 112.", tone: "digital" },
  2: { label: "Statutory Meeting Transparency",   shortLabel: "Meetings",       max: 25, description: "Are meeting agendas and minutes published? Required by Local Government Act 1972 §§ 100B and 100C.",                tone: "governance" },
  3: { label: "Financial Accountability",         shortLabel: "Financial",      max: 25, description: "Is the council's annual financial statement (AGAR) published? Required by the Accounts and Audit Regulations 2015.", tone: "community" },
  4: { label: "Democratic & Accessibility",       shortLabel: "Democratic",     max: 25, description: "Are councillors and chair named, the website accessible, and the connection secure? Localism Act 2011 + Accessibility Regs 2018.", tone: "accessibility" },
};

export type IndicatorMeta = {
  id: string;
  pillar: Pillar;
  label: string;
  max: number;
  inputFields: string[];
  statute?: string;
};

// VDTI v4.0 indicators — 12 indicators, statute-anchored, observably verifiable.
export const INDICATORS: IndicatorMeta[] = [
  // Pillar 1 — Core Reachability (25)
  { id: "1.1", pillar: 1, label: "Working council website",          max: 10, inputFields: ["website"], statute: "LGA 1972 § 96–101 (notice of business)" },
  { id: "1.2", pillar: 1, label: "Council email address published",  max: 5,  inputFields: ["email"],   statute: "Transparency Code 2015 § 2.2" },
  { id: "1.3", pillar: 1, label: "Phone number published",           max: 5,  inputFields: ["phone"],   statute: "Transparency Code 2015 § 2.2" },
  { id: "1.4", pillar: 1, label: "Named clerk identified",           max: 5,  inputFields: ["clerk_name"], statute: "Local Government Act 1972 § 112 (clerk as proper officer)" },
  // Pillar 2 — Statutory Meeting Transparency (25)
  { id: "2.1", pillar: 2, label: "Meeting agendas published",        max: 15, inputFields: ["has_agendas"], statute: "Local Government Act 1972 § 100B (agendas published 3 clear days before meeting)" },
  { id: "2.2", pillar: 2, label: "Meeting minutes published",        max: 10, inputFields: ["has_minutes"], statute: "Local Government Act 1972 § 100C (minutes preserved 6 years; right of inspection)" },
  // Pillar 3 — Financial Accountability (25)
  { id: "3.1", pillar: 3, label: "AGAR / annual financial statement published", max: 15, inputFields: ["has_financials"], statute: "Accounts and Audit Regulations 2015 § 10 (publication of AGAR)" },
  { id: "3.2", pillar: 3, label: "Clerk email — correspondence channel for audit", max: 10, inputFields: ["clerk_email"], statute: "Accounts and Audit Regulations 2015 (proper officer must be contactable)" },
  // Pillar 4 — Democratic & Accessibility (25)
  { id: "4.1", pillar: 4, label: "Chair / Mayor named",              max: 5,  inputFields: ["chair_name"], statute: "Local Government Act 1972 § 15 (chair election & record)" },
  { id: "4.2", pillar: 4, label: "At least one councillor identified", max: 5, inputFields: ["councillors_listed"], statute: "Local Government Act 1972 § 15 (electoral framework)" },
  { id: "4.3", pillar: 4, label: "Accessibility statement published", max: 10, inputFields: ["has_accessibility_statement"], statute: "Public Sector Bodies (Websites & Mobile Apps) Accessibility Regs 2018" },
  { id: "4.4", pillar: 4, label: "Secure connection (HTTPS)",        max: 5,  inputFields: ["website"],   statute: "UK GDPR Art. 32 (security of processing); NCSC guidance" },
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
  score: numb