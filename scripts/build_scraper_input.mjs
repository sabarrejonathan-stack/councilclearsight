// Build scraper/data/councils_input.csv from the live per-slug JSONs.
//
// Output columns: council_id, slug, name, type, county, region, website_url
// Used by scraper/vdti_scanner.py.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const COUNCILS_DIR = "client/public/data/councils";
const OUT = "scraper/data/councils_input.csv";

mkdirSync("scraper/data", { recursive: true });

const rows = [["council_id", "slug", "name", "type", "county", "region", "website_url", "audit_status"]];
let withUrl = 0;
let total = 0;
for (const file of readdirSync(COUNCILS_DIR)) {
  if (!file.endsWith(".json")) continue;
  const c = JSON.parse(readFileSync(join(COUNCILS_DIR, file), "utf8"));
  total++;
  let website = c.website || null;
  if (!website) {
    const ind11 = (c.indicators || []).find(i => i.id === "1.1");
    website = ind11?.input_snapshot?.website || null;
  }
  if (website) withUrl++;
  rows.push([
    String(c.council_id || ""),
    c.slug || "",
    c.name || "",
    c.type || "",
    c.county || "",
    c.region || "",
    website || "",
    c.audit_status || "",
  ]);
}

const csv = rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v)).join(",")).join("\n");
writeFileSync(OUT, csv + "\n");
console.log(`wrote ${OUT}: ${total} rows (${withUrl} with website URL)`);
