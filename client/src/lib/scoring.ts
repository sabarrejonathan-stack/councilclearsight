/**
 * Typed mirror of the Python scoring engine.
 *
 * Display-only: this file never recomputes scores. Scores are computed by the
 * publish pipeline and shipped as static JSON. This file exports types,
 * pillar metadata, and helpers for the UI to present them consistently.
 */

export const METHODOLOGY_VERSION = "VDTI v4.0";
export const METHODOLOGY_CHANGELOG_PATH = "/methodology/changelog";
export const DISPUTES_QUEUE_PATH = "/methodology/disputes";

export type Pillar = 1 | 2 | 3 | 4;

// VDTI v4.0 methodology — 4 equal-weight pillars × 25 = 100.
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
  { id: "1.1", pillar: 1, label: "Working council website",          max: 10, inputFields: ["website"], statute: "LGA 1972 § 96–101" },
  { id: "1.2", pillar: 1, label: "Council email address published",  max: 5,  inputFields: ["email"],   statute: "Transparency Code 2015 § 2.2" },
  { id: "1.3", pillar: 1, label: "Phone number published",           max: 5,  inputFields: ["phone"],   statute: "Transparency Code 2015 § 2.2" },
  { id: "1.4", pillar: 1, label: "Named clerk identified",           max: 5,  inputFields: ["clerk_name"], statute: "Local Government Act 1972 § 112" },
  { id: "2.1", pillar: 2, label: "Meeting agendas published",        max: 15, inputFields: ["has_agendas"], statute: "Local Government Act 1972 § 100B" },
  { id: "2.2", pillar: 2, label: "Meeting minutes published",        max: 10, inputFields: ["has_minutes"], statute: "Local Government Act 1972 § 100C" },
  { id: "3.1", pillar: 3, label: "AGAR / annual financial statement published", max: 15, inputFields: ["has_financials"], statute: "Accounts and Audit Regulations 2015 § 10" },
  { id: "3.2", pillar: 3, label: "Clerk email — correspondence channel for audit", max: 10, inputFields: ["clerk_email"], statute: "Accounts and Audit Regulations 2015" },
  { id: "4.1", pillar: 4, label: "Chair / Mayor named",              max: 5,  inputFields: ["chair_name"], statute: "Local Government Act 1972 § 15" },
  { id: "4.2", pillar: 4, label: "At least one councillor identified", max: 5, inputFields: ["councillors_listed"], statute: "Local Government Act 1972 § 15" },
  { id: "4.3", pillar: 4, label: "Accessibility statement published", max: 10, inputFields: ["has_accessibility_statement"], statute: "Accessibility Regs 2018" },
  { id: "4.4", pillar: 4, label: "Secure connection (HTTPS)",        max: 5,  inputFields: ["website"],   statute: "UK GDPR Art. 32" },
];

export function indicatorsForPillar(p: Pillar): IndicatorMeta[] {
  return INDICATORS.filter((i) => i.pillar === p);
}

export type IndicatorResult = {
  id: string;
  pillar: Pillar;
  label: string;
  max_points: number;
  earned: number;
  assessed: boolean;
  input_snapshot: Record<string, unknown> & {
    evidence_url?: string | null;
    document_date?: string | null;
    file_format?: string | null;
    document_count?: number | null;
  };
};

// Compliance-audit panel (the 16 extra Transparency Code 2015 + LCAS indicators
// surfaced in the per-slug JSON).
export type ComplianceAuditItem = {
  key: string;
  label: string;
  statute: string;
  found: boolean;
  evidence_url: string | null;
  document_date: string | null;
  file_format: string | null;
};

// Audit state — every council page is one of these three.
export type AuditStatus = "verified" | "under_audit" | "under_audit_with_url";

export type CouncilScore = {
  council_id: string | number;
  slug: string;
  name: string;
  type: string;
  county: string;
  region: string;
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
  indicators: IndicatorResult[];
  pillar_earned: Record<string, number>;
  pillar_max_assessed: Record<string, number>;
  numerator: number;
  denominator: number;
  score: number | null;
  completeness: number;
  band: BandKey | string;  // string allowed for backwards-compat; new JSONs use BandKey values
  rank_national: number | null;
  rank_type: number | null;
  rank_region: number | null;
  rank?: number | null;
  regional_rank?: number | null;
  percentile?: number | null;
  methodology_version: string;
  // Audit-state fields — present on every council JSON shipped after publish_v2
  audit_status?: AuditStatus;
  audit_status_reason?: string | null;
  discovered_via?: string | null;
  ons_code?: string | null;
  principal_authority?: string | null;
  compliance_audit?: ComplianceAuditItem[];
  evidence_links_total_count?: number;
  fresh_documents_count?: number;
  stale_documents_count?: number;
  indicators_evidence_found_count?: number;
  data_completeness_pct?: number;
  scraped_at?: string | null;
};

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

function present(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return Boolean(v);
}

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

export type CouncilFieldsV4 = CouncilFields & {
  has_financials?: boolean;
  has_accessibility_statement?: boolean;
  councillors_listed?: boolean;
};

export function scoreCouncil(f: CouncilFieldsV4): ScoredResult {
  const inds: IndicatorResult[] = [];
  const hasWebsite = present(f.website);
  const hasEmail = isValidEmail(f.email);
  const hasPhone = present(f.phone);
  const hasClerk = present(f.clerk_name);
  const hasClerkEmail = isValidEmail(f.clerk_email);
  const hasChair = isValidChair(f.chair_name);
  const hasAgendas = !!f.has_agendas;
  const hasMinutes = !!f.has_minutes;
  const hasFinancials = !!(f as any).has_financials;
  const hasAccessibility = !!(f as any).has_accessibility_statement;
  const hasCouncillorList = !!(f as any).councillors_listed;
  const isHttps = hasWebsite && /^https:\/\//i.test(String(f.website));

  const push = (id: string, pillar: Pillar, label: string, max: number, earned: number, snap: Record<string, unknown>) => {
    inds.push({ id, pillar, label, max_points: max, earned, assessed: true, input_snapshot: snap });
  };

  push("1.1", 1, "Working council website",         10, hasWebsite ? 10 : 0, { website: f.website || null });
  push("1.2", 1, "Council email address published", 5,  hasEmail ? 5 : 0,    { email: f.email || null });
  push("1.3", 1, "Phone number published",          5,  hasPhone ? 5 : 0,    { phone: f.phone || null });
  push("1.4", 1, "Named clerk identified",          5,  hasClerk ? 5 : 0,    { clerk_name: f.clerk_name || null });
  push("2.1", 2, "Meeting agendas published",       15, hasAgendas ? 15 : 0, { has_agendas: hasAgendas });
  push("2.2", 2, "Meeting minutes published",       10, hasMinutes ? 10 : 0, { has_minutes: hasMinutes });
  push("3.1", 3, "AGAR / annual financial statement published", 15, hasFinancials ? 15 : 0, { has_financials: hasFinancials });
  push("3.2", 3, "Clerk email — correspondence channel for audit", 10, hasClerkEmail ? 10 : 0, { clerk_email: f.clerk_email || null });
  push("4.1", 4, "Chair / Mayor named",             5,  hasChair ? 5 : 0,            { chair_name: f.chair_name || null });
  push("4.2", 4, "At least one councillor identified", 5, hasCouncillorList ? 5 : 0,  { councillors_listed: hasCouncillorList });
  push("4.3", 4, "Accessibility statement published", 10, hasAccessibility ? 10 : 0, { has_accessibility_statement: hasAccessibility });
  push("4.4", 4, "Secure connection (HTTPS)",       5,  isHttps ? 5 : 0,             { website: f.website || null, https: isHttps });

  const pillar_earned: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
  for (const i of inds) pillar_earned[String(i.pillar)] += i.earned;
  const pillar_max_assessed: Record<string, number> = { "1": 25, "2": 25, "3": 25, "4": 25 };
  const score = inds.reduce((s, i) => s + i.earned, 0);
  return { indicators: inds, pillar_earned, pillar_max_assessed, score, numerator: score, denominator: 100, completeness: 1.0 };
}

export const BAND_META = {
  "Excellent":         { range: "80\u2013100", tone: "emerald", description: "Meets or exceeds nearly all observable transparency requirements." },
  "Good":              { range: "65\u201379",  tone: "teal",    description: "Meets most requirements with identifiable specific gaps." },
  "Developing":        { range: "50\u201364",  tone: "amber",   description: "Partial compliance; at least one pillar shows substantial gaps." },
  "Needs Attention":   { range: "0\u201349",   tone: "red",     description: "Substantial gaps across multiple pillars." },
  "Not Yet Assessed":  { range: "\u2014",      tone: "slate",   description: "Insufficient evidence to band." },
  "Under Audit":       { range: "\u2014",      tone: "sky",     description: "Council ClearSight is currently auditing this council. Subscribers are notified when verification completes." },
} as const;

export type BandKey = keyof typeof BAND_META;

export function bandFor(score: number | null, auditStatus?: AuditStatus): BandKey {
  if (auditStatus === "under_audit" || auditStatus === "under_audit_with_url") return "Under Audit";
  if (score === null) return "Not Yet Assessed";
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Developing";
  return "Needs Attention";
}

export function isUnderAudit(s?: AuditStatus | string | null): boolean {
  return s === "under_audit" || s === "under_audit_with_url";
}

export function bandColorClasses(b: BandKey | string): { bg: string; border: string; text: string; dot: string } {
  const tone = (BAND_META as any)[b]?.tone || "slate";
  return {
    bg: `bg-${tone}-50`,
    border: `border-${tone}-200`,
    text: `text-${tone}-800`,
    dot: `bg-${tone}-500`,
  };
}

export function pillarColorClasses(p: Pillar): { bg: string; border: string; text: string } {
  const tones: Record<Pillar, string> = { 1: "sky", 2: "indigo", 3: "emerald", 4: "amber" };
  const tone = tones[p];
  return { bg: `bg-${tone}-50`, border: `border-${tone}-200`, text: `text-${tone}-800` };
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) return "\u2014";
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
