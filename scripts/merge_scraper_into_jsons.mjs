// Merge the scraper output (scrape_results_v41.csv) back into the per-slug
// council JSONs so the rescore pass can pick up the new evidence and the new
// v4.1 indicator inputs.
//
// What this does for each scraper row:
//   - Updates top-level fields if scraped value is non-empty:
//       website, email, phone, clerk_name, clerk_email, chair_name
//   - Sets boolean inputs from scraper:
//       has_agendas, has_minutes, has_financials,
//       has_internal_audit, has_public_inspection_notice,
//       has_register_of_interests, has_accessibility_statement,
//       councillors_listed
//   - Where scraper found a positive signal AND an evidence URL, attaches the
//     evidence URL onto the indicator row's input_snapshot.evidence_url.
//   - Promotes audit_status from under_audit → verified if any indicator was
//     positively scraped (we have proof of life now).
//
// Run after the scraper finishes; rescore_v41.mjs picks up the changes.

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const COUNCILS_DIR = "client/public/data/councils";
const SCRAPE_CSV = "scraper/data/scrape_results_v41.csv";

if (!existsSync(SCRAPE_CSV)) {
  console.error(`No scraper results at ${SCRAPE_CSV}; nothing to merge.`);
  process.exit(0);
}

function parseCSV(text) {
  const out = [];
  const rows = [];
  let cur = "", inQ = false, row = [];
  for (const ch of text) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { row.push(cur); cur = ""; continue; }
    if (ch === "\n" && !inQ) { row.push(cur); rows.push(row); row = []; cur = ""; continue; }
    if (ch === "\r") continue;
    cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  if (rows.length === 0) return out;
  const header = rows[0];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 0 || (r.length === 1 && r[0] === "")) continue;
    const o = {};
    header.forEach((h, j) => o[h] = r[j] ?? "");
    out.push(o);
  }
  return out;
}

const triState = (v) => v === "true" ? true : v === "false" ? false : null;

const scraped = parseCSV(readFileSync(SCRAPE_CSV, "utf8"));
console.log(`Scraper rows: ${scraped.length}`);

let touched = 0, promoted = 0;
const fileSet = new Set(readdirSync(COUNCILS_DIR).filter(f => f.endsWith(".json")));

for (const row of scraped) {
  const slug = row.slug;
  if (!slug) continue;
  const file = `${slug}.json`;
  if (!fileSet.has(file)) continue;
  const path = join(COUNCILS_DIR, file);
  const c = JSON.parse(readFileSync(path, "utf8"));

  const before = JSON.stringify(c);

  // Top-level fields
  if (row.website_url) c.website = row.website_url;
  if (row.council_email) c.email = row.council_email;
  if (row.clerk_email) c.clerk_email = row.clerk_email;
  if (row.council_phone) c.phone = row.council_phone;
  if (row.clerk_name) c.clerk_name = row.clerk_name;
  if (row.chair_name) c.chair_name = row.chair_name;

  // Boolean inputs
  c.has_agendas = row.has_agendas === "true";
  c.has_minutes = row.has_minutes === "true";
  c.has_financials = row.has_financials === "true";
  c.has_accessibility_statement = row.has_accessibility_statement === "true";
  c.councillors_listed = row.councillors_listed === "true";
  // Tri-state for v4.1 new indicators
  c.has_internal_audit = triState(row.has_internal_audit);
  c.has_public_inspection_notice = triState(row.has_public_inspection_notice);
  c.has_register_of_interests = triState(row.has_register_of_interests);

  // Evidence URLs — attach to indicator rows
  const ev = {
    "1.1": row.website_url,
    "1.2": row.council_email_evidence_url,
    "1.3": row.council_phone_evidence_url,
    "1.4": row.clerk_name_evidence_url,
    "2.1": row.agendas_evidence_url,
    "2.2": row.minutes_evidence_url,
    "3.1": row.financials_evidence_url,
    "3.2": row.internal_audit_evidence_url,
    "3.3": row.public_inspection_evidence_url,
    "4.1": row.chair_name_evidence_url,
    "4.2": row.councillors_evidence_url,
    "4.3": row.accessibility_evidence_url,
    "4.5": row.register_evidence_url,
  };
  for (const ind of (c.indicators || [])) {
    const url = ev[ind.id];
    if (url) {
      ind.input_snapshot = ind.input_snapshot || {};
      ind.input_snapshot.evidence_url = url;
    }
  }

  // Promote audit status if we got any signal of life
  const liveSignals =
    row.website_resolves === "true" ||
    row.council_email ||
    row.has_agendas === "true" ||
    row.has_minutes === "true" ||
    row.has_financials === "true";
  if (liveSignals && (c.audit_status === "under_audit" || c.audit_status === "under_audit_with_url")) {
    c.audit_status = "verified";
    c.audit_status_reason = "Verified via VDTI Scanner v1";
    promoted++;
  }
  c.scraped_at = row.scraped_at || c.scraped_at;

  if (JSON.stringify(c) !== before) {
    writeFileSync(path, JSON.stringify(c) + "\n");
    touched++;
  }
}

console.log(`Merged scraper output into ${touched} council JSONs (${promoted} newly promoted to verified)`);
