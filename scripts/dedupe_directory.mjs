// Dedupe the council directory.
//
// The current directory has ~541 likely-duplicates: same council appearing twice
// with different slugs (e.g. "abbotskerswell" + "abbotskerswell-parish-council").
//
// This script:
//   1. Computes a canonical key per council from a normalised name + county.
//      (county prevents collapsing two genuinely-distinct "Alton"s into one.)
//   2. For each duplicate group, keeps the row with the most data and
//      audit_status === "verified" preferred over "under_audit".
//   3. Moves the loser JSON file into client/public/data/councils/_dedupe_archive/
//      so it's preserved but not served.
//   4. Rebuilds directory.json from what remains.
//   5. Logs the count of merges and an audit trail to scripts/dedupe_log.json.
//
// Run: `node scripts/dedupe_directory.mjs --dry-run` first to preview.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";

const DRY = process.argv.includes("--dry-run");
const COUNCILS_DIR = "client/public/data/councils";
const ARCHIVE_DIR = "client/public/data/councils/_dedupe_archive";
const DIRECTORY_OUT = "client/public/data/directory.json";
const LOG_OUT = "scripts/dedupe_log.json";

if (!DRY) mkdirSync(ARCHIVE_DIR, { recursive: true });

function normaliseName(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "")
    .replace(/[''`]/g, "")
    .replace(/[&]/g, "and")
    .replace(/\(.+?\)/g, "")
    .replace(/\b(parish|town|community|city)\s+council\b/, "")
    .replace(/\bcouncil\b/, "")
    .replace(/[\s\-_,.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "Score" a candidate to pick the keeper for a duplicate group.
function score(c) {
  let s = 0;
  if (c.audit_status === "verified") s += 1000;
  if (c.has_website) s += 50;
  if (c.score != null) s += c.score; // tie-break by VDTI
  if (c.completeness != null) s += (c.completeness || 0);
  return s;
}

const files = readdirSync(COUNCILS_DIR).filter(f => f.endsWith(".json"));
const councils = [];
for (const f of files) {
  try {
    const c = JSON.parse(readFileSync(join(COUNCILS_DIR, f), "utf8"));
    councils.push({ ...c, _file: f });
  } catch {}
}

// Group by canonical key
const byKey = new Map();
for (const c of councils) {
  const key = normaliseName(c.name) + "::" + (c.county || "").toLowerCase();
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(c);
}

const groups = [...byKey.values()].filter(g => g.length > 1);
const removeFiles = [];
const auditTrail = [];

for (const g of groups) {
  // Sort: best first
  g.sort((a, b) => score(b) - score(a));
  const keeper = g[0];
  const losers = g.slice(1);
  for (const l of losers) {
    removeFiles.push(l._file);
    auditTrail.push({
      keeper: { slug: keeper.slug, audit_status: keeper.audit_status, score: keeper.score },
      removed: { slug: l.slug, audit_status: l.audit_status, score: l.score },
    });
  }
}

console.log(`Found ${groups.length} duplicate groups → ${removeFiles.length} files to archive`);
if (DRY) {
  console.log("Sample (first 10):");
  for (const a of auditTrail.slice(0, 10)) console.log(`  keep ${a.keeper.slug}  drop ${a.removed.slug}`);
  process.exit(0);
}

// Move losers into archive
for (const f of removeFiles) {
  const src = join(COUNCILS_DIR, f);
  const dst = join(ARCHIVE_DIR, f);
  if (existsSync(src)) renameSync(src, dst);
}

// Rebuild directory.json from what remains
const remainingFiles = readdirSync(COUNCILS_DIR).filter(f => f.endsWith(".json"));
const directory = [];
for (const f of remainingFiles) {
  const c = JSON.parse(readFileSync(join(COUNCILS_DIR, f), "utf8"));
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

// Re-rank
const verified = directory.filter(c => c.score != null).sort((a, b) => b.score - a.score);
for (let i = 0; i < verified.length; i++) {
  const tieRank = i === 0 || verified[i].score !== verified[i - 1].score ? i + 1 : verified[i - 1].rank_national;
  verified[i].rank_national = tieRank;
}
const byId = new Map(verified.map(v => [v.slug, v]));
for (const d of directory) {
  if (byId.has(d.slug)) d.rank_national = byId.get(d.slug).rank_national;
}
directory.sort((a, b) => {
  if (a.rank_national && b.rank_national) return a.rank_national - b.rank_national;
  if (a.rank_national) return -1;
  if (b.rank_national) return 1;
  return a.name.localeCompare(b.name);
});
writeFileSync(DIRECTORY_OUT, JSON.stringify(directory));
writeFileSync(LOG_OUT, JSON.stringify({ groups: groups.length, archived: removeFiles.length, audit: auditTrail }, null, 2));
console.log(`Final directory: ${directory.length} councils (was ${councils.length})`);
console.log(`Audit log: ${LOG_OUT}`);
