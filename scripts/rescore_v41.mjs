// Rescore every council JSON against the VDTI v4.1 14-indicator engine.
//
// What this does:
//   - Reads every file in client/public/data/councils/*.json
//   - Re-emits 14 indicators for each. The 11 carried-forward indicators are
//     scored from the same input fields they always used. The 3 new v4.1
//     indicators (3.2 Internal Audit, 3.3 Public Inspection, 4.5 Register of
//     Members' Interests) are marked Not Assessed unless the JSON already
//     contains evidence (which today it does not, but will once the new
//     scraper runs).
//   - Recomputes pillar_earned, pillar_max_assessed, numerator, denominator,
//     score, completeness, band, methodology_version.
//   - Writes the file back in place.
//   - Rebuilds client/public/data/directory.json from the per-slug files so
//     the directory page reflects v4.1 scores immediately.
//
// Run: `node scripts/rescore_v41.mjs`

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const COUNCILS_DIR = "client/public/data/councils";
const DIRECTORY_OUT = "client/public/data/directory.json";

// -------------------------------------------------------------------------
// v4.1 indicator definitions — mirror of client/src/lib/scoring.ts
// -------------------------------------------------------------------------
const INDICATORS = [
  { id: "1.1", pillar: 1, label: "Working council website",                       max: 10, kind: "carry" },
  { id: "1.2", pillar: 1, label: "Council email address published",               max: 5,  kind: "carry" },
  { id: "1.3", pillar: 1, label: "Phone number published",                        max: 5,  kind: "carry" },
  { id: "1.4", pillar: 1, label: "Named clerk identified",                        max: 5,  kind: "carry" },
  { id: "2.1", pillar: 2, label: "Meeting agendas published",                     max: 15, kind: "carry" },
  { id: "2.2", pillar: 2, label: "Meeting minutes published",                     max: 10, kind: "carry" },
  { id: "3.1", pillar: 3, label: "AGAR / annual financial statement published",   max: 10, kind: "carry" }, // was 15 in v4.0
  { id: "3.2", pillar: 3, label: "Internal Audit Report or Annual Governance Statement", max: 8, kind: "new" },
  { id: "3.3", pillar: 3, label: "Notice of Public Inspection of accounts",       max: 7,  kind: "new" },
  { id: "4.1", pillar: 4, label: "Chair / Mayor named",                           max: 4,  kind: "carry" }, // was 5
  { id: "4.2", pillar: 4, label: "At least one councillor identified",            max: 4,  kind: "carry" }, // was 5
  { id: "4.3", pillar: 4, label: "Accessibility statement published",             max: 10, kind: "carry" },
  { id: "4.4", pillar: 4, label: "Secure connection (HTTPS)",                     max: 3,  kind: "carry" }, // was 5
  { id: "4.5", pillar: 4, label: "Register of Members' Interests published",      max: 4,  kind: "new" },
];

const present = (v) => v != null && (typeof v !== "string" || v.trim().length > 0);
const isEmail = (v) => present(v) && /@/.test(String(v));
const isChair = (v) => present(v) && !String(v).includes(";");

function bandFor(score, auditStatus) {
  if (auditStatus === "under_audit" || auditStatus === "under_audit_with_url") return "Under Audit";
  if (score == null) return "Not Yet Assessed";
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Developing";
  return "Needs Attention";
}

// Locate the v4.0 indicator row (if any) inside a stored JSON, by id.
function findOldRow(c, id) {
  return (c.indicators || []).find((i) => i.id === id);
}

function scoreV41(c) {
  // Source-of-truth input fields. We trust the top-level fields where present;
  // otherwise we fall back to the v4.0 indicator's input snapshot.
  const website   = c.website ?? findOldRow(c, "1.1")?.input_snapshot?.website ?? null;
  const email     = c.email   ?? findOldRow(c, "1.2")?.input_snapshot?.email ?? null;
  const phone     = c.phone   ?? findOldRow(c, "1.3")?.input_snapshot?.phone ?? null;
  const clerkName = c.clerk_name ?? findOldRow(c, "1.4")?.input_snapshot?.clerk_name ?? null;
  const hasAgendas   = !!(c.has_agendas ?? findOldRow(c, "2.1")?.input_snapshot?.has_agendas);
  const hasMinutes   = !!(c.has_minutes ?? findOldRow(c, "2.2")?.input_snapshot?.has_minutes);
  const hasFin       = !!(c.has_financials ?? findOldRow(c, "3.1")?.input_snapshot?.has_financials);
  const chair        = c.chair_name ?? findOldRow(c, "4.1")?.input_snapshot?.chair_name ?? null;
  const cllrs        = !!(c.councillors_listed ?? findOldRow(c, "4.2")?.input_snapshot?.councillors_listed);
  const hasAccess    = !!(c.has_accessibility_statement ?? findOldRow(c, "4.3")?.input_snapshot?.has_accessibility_statement);

  // Tri-state inputs for new v4.1 indicators (null/undefined → Not Assessed)
  const intAudit     = c.has_internal_audit ?? null;            // null = NA
  const pubInsp      = c.has_public_inspection_notice ?? null;  // null = NA
  const register     = c.has_register_of_interests ?? null;     // null = NA

  const isHttps = !!website && /^https:\/\//i.test(String(website));

  const rows = [];
  const push = (id, pillar, label, max, earned, assessed, snap) =>
    rows.push({ id, pillar, label, max_points: max, earned, assessed, input_snapshot: snap });

  push("1.1", 1, "Working council website",         10, present(website) ? 10 : 0, true, { website: website || null });
  push("1.2", 1, "Council email address published", 5,  isEmail(email) ? 5 : 0,    true, { email: email || null });
  push("1.3", 1, "Phone number published",          5,  present(phone) ? 5 : 0,    true, { phone: phone || null });
  push("1.4", 1, "Named clerk identified",          5,  present(clerkName) ? 5 : 0, true, { clerk_name: clerkName || null });
  push("2.1", 2, "Meeting agendas published",       15, hasAgendas ? 15 : 0, true, { has_agendas: hasAgendas });
  push("2.2", 2, "Meeting minutes published",       10, hasMinutes ? 10 : 0, true, { has_minutes: hasMinutes });
  push("3.1", 3, "AGAR / annual financial statement published", 10, hasFin ? 10 : 0, true, { has_financials: hasFin });
  push("3.2", 3, "Internal Audit Report or Annual Governance Statement", 8,
       intAudit === true ? 8 : 0, intAudit !== null, { has_internal_audit: intAudit });
  push("3.3", 3, "Notice of Public Inspection of accounts", 7,
       pubInsp === true ? 7 : 0, pubInsp !== null, { has_public_inspection_notice: pubInsp });
  push("4.1", 4, "Chair / Mayor named",             4,  isChair(chair) ? 4 : 0, true, { chair_name: chair || null });
  push("4.2", 4, "At least one councillor identified", 4, cllrs ? 4 : 0, true, { councillors_listed: cllrs });
  push("4.3", 4, "Accessibility statement published", 10, hasAccess ? 10 : 0, true, { has_accessibility_statement: hasAccess });
  push("4.4", 4, "Secure connection (HTTPS)",       3,  isHttps ? 3 : 0, true, { website: website || null, https: isHttps });
  push("4.5", 4, "Register of Members' Interests published", 4,
       register === true ? 4 : 0, register !== null, { has_register_of_interests: register });

  const pe = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const pm = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const r of rows) {
    if (!r.assessed) continue;
    pe[r.pillar] += r.earned;
    pm[r.pillar] += r.max_points;
  }
  const num = rows.filter(r => r.assessed).reduce((s, r) => s + r.earned, 0);
  const den = rows.filter(r => r.assessed).reduce((s, r) => s + r.max_points, 0);
  const score = den > 0 ? Math.round((num / den) * 100) : 0;
  return { rows, pe, pm, num, den, score };
}

function reEmit(c) {
  const isUnderAudit = c.audit_status === "under_audit" || c.audit_status === "under_audit_with_url";
  // Capture old evidence URLs by indicator id so we can carry them forward.
  const oldEvidence = {};
  for (const i of (c.indicators || [])) {
    if (i.input_snapshot && i.input_snapshot.evidence_url) {
      oldEvidence[i.id] = i.input_snapshot.evidence_url;
    }
  }
  const { rows, pe, pm, num, den, score } = scoreV41(c);
  // Re-attach evidence URLs from previous indicators (so rescore is non-destructive).
  for (const r of rows) {
    if (oldEvidence[r.id] && r.assessed && r.earned > 0) {
      r.input_snapshot.evidence_url = oldEvidence[r.id];
    }
  }
  c.indicators = rows;
  c.pillar_earned = { "1": pe[1], "2": pe[2], "3": pe[3], "4": pe[4] };
  c.pillar_max_assessed = { "1": pm[1], "2": pm[2], "3": pm[3], "4": pm[4] };
  c.numerator = num;
  c.denominator = den;
  // Under-audit councils retain null score until verified by scraper.
  c.score = isUnderAudit ? null : score;
  c.completeness = den / 100;
  c.band = bandFor(c.score, c.audit_status);
  c.methodology_version = "VDTI v4.1";
  return c;
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------
function run() {
  const files = readdirSync(COUNCILS_DIR).filter(f => f.endsWith(".json"));
  let updated = 0;
  let bandHisto = {};
  const directory = [];
  for (const f of files) {
    const path = join(COUNCILS_DIR, f);
    const raw = readFileSync(path, "utf8");
    let c;
    try { c = JSON.parse(raw); }
    catch { console.error(`bad JSON: ${f}`); continue; }
    reEmit(c);
    writeFileSync(path, JSON.stringify(c) + "\n");
    updated++;
    bandHisto[c.band] = (bandHisto[c.band] || 0) + 1;
    directory.push({
      id: c.council_id,
      slug: c.slug,
      name: c.name,
      type: c.type,
      county: c.county,
      region: c.region,
      principal_authority: c.principal_authority || null,
      score: c.score,
      rank_national: c.rank_national || null,
      rank_region: c.rank_region || null,
      rank_type: c.rank_type || null,
      percentile: c.percentile || null,
      band: c.band,
      completeness: Math.round((c.completeness || 0) * 100),
      audit_status: c.audit_status || null,
      has_website: !!c.website,
    });
  }
  // Recompute national rank
  const verified = directory.filter(c => c.score != null).sort((a, b) => b.score - a.score);
  for (let i = 0; i < verified.length; i++) {
    const tieRank = i === 0 || verified[i].score !== verified[i - 1].score ? i + 1 : verified[i - 1].rank_national;
    verified[i].rank_national = tieRank;
  }
  // Re-attach back
  const byId = new Map(verified.map(v => [v.slug, v]));
  for (const d of directory) {
    if (byId.has(d.slug)) d.rank_national = byId.get(d.slug).rank_national;
  }
  // Sort directory: verified by rank, then under-audit alphabetical
  directory.sort((a, b) => {
    if (a.rank_national && b.rank_national) return a.rank_national - b.rank_national;
    if (a.rank_national) return -1;
    if (b.rank_national) return 1;
    return a.name.localeCompare(b.name);
  });
  writeFileSync(DIRECTORY_OUT, JSON.stringify(directory));
  console.log(`Rescored ${updated} councils against VDTI v4.1`);
  console.log(`Bands: ${JSON.stringify(bandHisto)}`);
}

run();
