// Build the CRM-ready contacts CSV from the existing per-slug JSONs.
//
// Output: scraper/data/crm_contacts_master.csv
//
// One row per council that has an email contact. Columns match the live scraper
// output so subsequent scraper runs can de-duplicate and overwrite by slug.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const COUNCILS_DIR = "client/public/data/councils";
const OUT = "scraper/data/crm_contacts_master.csv";

mkdirSync("scraper/data", { recursive: true });

const HEADER = [
  "council_id","slug","council_name","council_type","county","region","principal_authority",
  "website_url","primary_contact_email","primary_contact_role",
  "clerk_name","phone","chair_name",
  "audit_status","band","score","verified_at","data_source",
];

const rows = [HEADER];
let withEmail = 0;
let total = 0;
for (const file of readdirSync(COUNCILS_DIR)) {
  if (!file.endsWith(".json")) continue;
  total++;
  const c = JSON.parse(readFileSync(join(COUNCILS_DIR, file), "utf8"));
  // primary contact: clerk_email > council email
  const clerkEmail = c.clerk_email || null;
  const councilEmail = c.email || null;
  const primary = clerkEmail || councilEmail;
  if (!primary) continue;
  withEmail++;
  rows.push([
    String(c.council_id || ""),
    c.slug || "",
    c.name || "",
    c.type || "",
    c.county || "",
    c.region || "",
    c.principal_authority || "",
    c.website || "",
    primary,
    clerkEmail ? "clerk" : "council",
    c.clerk_name || "",
    c.phone || "",
    c.chair_name || "",
    c.audit_status || "",
    c.band || "",
    c.score == null ? "" : String(c.score),
    "", // verified_at — populated only by scraper run
    "council_clearsight_database", // existing Excel-sourced data
  ]);
}

const csv = rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v)).join(",")).join("\n");
writeFileSync(OUT, csv + "\n");
console.log(`wrote ${OUT}: ${withEmail} contacts of ${total} councils`);
