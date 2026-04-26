"""publish_v2/publish.py — single sync script that builds every council page.

Reads:
  publish_v2/data/canonical.csv          (the 11,057-council universe)
  scraper/data/scrape_results_enriched.csv  (v2 scraper output)
  scraper/data/scrape_results_full.csv      (v1 scraper output — for chair name)
  Council_ClearSight_16.04.26.xlsx       (clerk names, fallback contacts)

Writes:
  client/public/data/councils/{slug}.json   (one per canonical council)
  client/public/data/directory.json         (slim index for /directory)
  client/public/data/councils_scored.json   (same shape; legacy compat)

For each council we emit one of three audit states:

  audit_status="verified"
    - v2 scraper reached the site (scrape_status=ok)
    - We compute a real VDTI v4.0 score using observed evidence
    - input_snapshot for each indicator carries an evidence_url where present
    - The 16 extra Transparency Code / LCAS indicators ride along in
      compliance_audit so the front-end can render the gold/platinum panel.

  audit_status="under_audit"
    - Either v2 was blocked / unreachable, OR the council is ONS-only
      (i.e. we have a name + region but no scraping data yet)
    - No score, no band — explicitly marked as awaiting verification
    - The council is still listed; profile page renders the audit-pending
      state and drives subscription CTA

  audit_status="under_audit_with_url"
    - We have a website URL on file (Excel) but v2 hasn't successfully
      scraped it. The council page still shows contact info from Excel
      and links to the website, but no score.
"""
from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

import openpyxl

import os

REPO = Path(__file__).resolve().parents[1]
CANONICAL = REPO / "publish_v2" / "data" / "canonical.csv"
V2 = REPO / "scraper" / "data" / "scrape_results_enriched.csv"
V1 = REPO / "scraper" / "data" / "scrape_results_full.csv"
EXCEL = REPO / "Council_ClearSight_16.04.26.xlsx"
# Allow overriding output dir via env to avoid OneDrive write latency.
# Set CCS_OUT_DATA to a fast local dir, then rsync once at the end.
OUT_DATA = Path(os.environ.get("CCS_OUT_DATA") or (REPO / "client" / "public" / "data"))
OUT_COUNCILS = OUT_DATA / "councils"
OUT_DIRECTORY = OUT_DATA / "directory.json"
OUT_SCORED = OUT_DATA / "councils_scored.json"

METHODOLOGY_VERSION = "VDTI v4.0"
DATA_EXTRACTION_DATE = "2026-04-25"

# VDTI v4.0 — must match client/src/lib/scoring.ts INDICATORS
INDICATORS = [
    ("1.1", 1, "Working council website",                            10),
    ("1.2", 1, "Council email address published",                    5),
    ("1.3", 1, "Phone number published",                             5),
    ("1.4", 1, "Named clerk identified",                             5),
    ("2.1", 2, "Meeting agendas published",                          15),
    ("2.2", 2, "Meeting minutes published",                          10),
    ("3.1", 3, "AGAR / annual financial statement published",        15),
    ("3.2", 3, "Clerk email — correspondence channel for audit",     10),
    ("4.1", 4, "Chair / Mayor named",                                5),
    ("4.2", 4, "At least one councillor identified",                 5),
    ("4.3", 4, "Accessibility statement published",                  10),
    ("4.4", 4, "Secure connection (HTTPS)",                          5),
]

# Extra v2 indicators surfaced in compliance_audit (Transparency Code 2015 + LCAS)
COMPLIANCE_AUDIT = [
    # Transparency Code 2015 §3.x
    ("expenditure_over_100",        "Expenditure over £100",          "TC2015 §3.1"),
    ("end_of_year_accounts",        "End-of-year accounts",           "TC2015 §3.2"),
    ("annual_governance_statement", "Annual Governance Statement",    "TC2015 §3.3"),
    ("internal_audit_report",       "Internal Audit Report",          "TC2015 §3.4"),
    ("councillor_responsibilities", "Councillor responsibilities",    "TC2015 §3.5"),
    ("asset_register",              "Asset register",                 "TC2015 §3.6"),
    ("dates_of_meetings",           "Dates of meetings",              "TC2015 §3.7"),
    # LCAS Foundation / Quality
    ("standing_orders",             "Standing orders",                "LCAS"),
    ("financial_regulations",       "Financial regulations",          "LCAS"),
    ("risk_assessment",             "Risk assessment",                "LCAS"),
    ("code_of_conduct",             "Code of conduct",                "LCAS"),
    ("complaints_procedure",        "Complaints procedure",           "LCAS"),
    ("gdpr_policy",                 "GDPR / data protection policy",  "LCAS"),
    ("foi_publication_scheme",      "FOI publication scheme",         "LCAS"),
    ("register_of_interests",       "Register of interests",          "Localism Act 2011"),
]


def truthy(v: Any) -> bool:
    if v is True:
        return True
    s = str(v or "").strip().lower()
    return s in ("true", "1", "yes")


def band_for(score: int) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 65:
        return "Good"
    if score >= 50:
        return "Developing"
    return "Needs Attention"


def load_v2() -> dict[str, dict]:
    out = {}
    with V2.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            out[r["slug"]] = r
    return out


def load_v1() -> dict[str, dict]:
    out = {}
    with V1.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            out[r["slug"]] = r
    return out


def load_excel() -> dict[str, dict]:
    wb = openpyxl.load_workbook(EXCEL, read_only=True, data_only=True)
    ws = wb["All Councils"]
    header = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    out = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] is None:
            continue
        d = dict(zip(header, row))
        slug = d.get("Slug")
        if slug:
            out[slug] = d
    return out


# Map v2 indicator keys to VDTI ids where applicable
V2_TO_VDTI = {
    "agendas": "2.1",
    "minutes": "2.2",
    "agar": "3.1",
    "accessibility_statement": "4.3",
}


def build_indicator(ind_id: str, pillar: int, label: str, max_pts: int,
                    council: dict, v2: dict | None, v1: dict | None,
                    excel: dict | None) -> dict:
    """Construct one VDTI indicator result with evidence_url where available."""
    snap: dict[str, Any] = {}
    earned = 0
    found = False

    # Pillar 1
    if ind_id == "1.1":
        url = ""
        if v2 and v2.get("scrape_status") == "ok":
            url = v2.get("website_url") or ""
        if not url and excel:
            url = (excel.get("Website URL") or "").strip()
        snap = {"website": url or None}
        if url:
            earned, found = max_pts, True
    elif ind_id == "1.2":
        email = ""
        if v2 and truthy(v2.get("council_email_format_valid")):
            email = v2.get("council_email_raw") or ""
        if not email and excel:
            email = (excel.get("Email") or "").strip()
        snap = {"email": email or None}
        if email and "@" in email:
            earned, found = max_pts, True
    elif ind_id == "1.3":
        phone = ""
        if v2 and truthy(v2.get("phone_format_valid")):
            phone = v2.get("phone_normalised") or v2.get("phone_raw") or ""
        if not phone and excel:
            phone = str(excel.get("Phone") or "").strip()
        snap = {"phone": phone or None}
        if phone:
            earned, found = max_pts, True
    elif ind_id == "1.4":
        clerk = ""
        if excel:
            clerk = (excel.get("Clerk Name") or "").strip()
        snap = {"clerk_name": clerk or None}
        if clerk:
            earned, found = max_pts, True
    # Pillar 2
    elif ind_id == "2.1":
        if v2 and truthy(v2.get("agendas_found")):
            snap = {
                "has_agendas": True,
                "evidence_url": v2.get("agendas_evidence_url") or None,
                "document_date": v2.get("agendas_last_modified") or v2.get("agendas_inferred_date") or None,
                "file_format": v2.get("agendas_file_format") or None,
                "document_count": int(v2.get("agendas_document_count") or 0) or None,
            }
            earned, found = max_pts, True
        elif v1 and truthy(v1.get("has_agendas")):
            snap = {"has_agendas": True, "evidence_url": v1.get("agendas_evidence_url") or None}
            earned, found = max_pts, True
        else:
            snap = {"has_agendas": False}
    elif ind_id == "2.2":
        if v2 and truthy(v2.get("minutes_found")):
            snap = {
                "has_minutes": True,
                "evidence_url": v2.get("minutes_evidence_url") or None,
                "document_date": v2.get("minutes_last_modified") or v2.get("minutes_inferred_date") or None,
                "file_format": v2.get("minutes_file_format") or None,
                "document_count": int(v2.get("minutes_document_count") or 0) or None,
            }
            earned, found = max_pts, True
        elif v1 and truthy(v1.get("has_minutes")):
            snap = {"has_minutes": True, "evidence_url": v1.get("minutes_evidence_url") or None}
            earned, found = max_pts, True
        else:
            snap = {"has_minutes": False}
    # Pillar 3
    elif ind_id == "3.1":
        if v2 and truthy(v2.get("agar_found")):
            snap = {
                "has_financials": True,
                "evidence_url": v2.get("agar_evidence_url") or None,
                "document_date": v2.get("agar_last_modified") or v2.get("agar_inferred_date") or None,
                "file_format": v2.get("agar_file_format") or None,
            }
            earned, found = max_pts, True
        else:
            snap = {"has_financials": False}
    elif ind_id == "3.2":
        clerk_email = ""
        if v2 and truthy(v2.get("clerk_email_format_valid")):
            clerk_email = v2.get("clerk_email_raw") or ""
        if not clerk_email and excel:
            clerk_email = (excel.get("Clerk Email") or "").strip()
        snap = {"clerk_email": clerk_email or None}
        if clerk_email and "@" in clerk_email:
            earned, found = max_pts, True
    # Pillar 4
    elif ind_id == "4.1":
        chair = ""
        if v1:
            chair = (v1.get("chair_name_scraped") or "").strip()
        if not chair and excel:
            chair = (excel.get("Chair Name") or "").strip()
        # Reject semicolon-delimited "chair" — that's a councillor list
        if chair and ";" not in chair:
            snap = {"chair_name": chair}
            earned, found = max_pts, True
        else:
            snap = {"chair_name": None}
    elif ind_id == "4.2":
        listed = False
        if v1:
            try:
                listed = int(v1.get("councillors_listed_count") or 0) > 0
            except ValueError:
                listed = False
        if not listed and excel:
            top3 = (excel.get("Councillors (Top 3 Names)") or "").strip()
            listed = bool(top3)
        snap = {"councillors_listed": listed}
        if listed:
            earned, found = max_pts, True
    elif ind_id == "4.3":
        if v2 and truthy(v2.get("accessibility_statement_found")):
            snap = {
                "has_accessibility_statement": True,
                "evidence_url": v2.get("accessibility_statement_evidence_url") or None,
                "document_date": v2.get("accessibility_statement_last_modified") or None,
            }
            earned, found = max_pts, True
        else:
            snap = {"has_accessibility_statement": False}
    elif ind_id == "4.4":
        is_https = False
        url = ""
        if v2 and v2.get("scrape_status") == "ok":
            url = v2.get("website_url") or ""
            is_https = truthy(v2.get("website_is_https"))
        elif excel:
            url = (excel.get("Website URL") or "").strip()
            is_https = url.lower().startswith("https://")
        snap = {"website": url or None, "https": is_https}
        if is_https:
            earned, found = max_pts, True

    return {
        "id": ind_id,
        "pillar": pillar,
        "label": label,
        "max_points": max_pts,
        "earned": earned,
        "assessed": True,
        "input_snapshot": snap,
    }


def build_compliance_audit(v2: dict | None) -> list[dict]:
    """Build the extra-indicator panel (Transparency Code + LCAS)."""
    out = []
    for key, label, statute in COMPLIANCE_AUDIT:
        if v2 is None:
            out.append({
                "key": key, "label": label, "statute": statute,
                "found": False, "evidence_url": None, "document_date": None,
                "file_format": None,
            })
            continue
        found = truthy(v2.get(f"{key}_found"))
        out.append({
            "key": key,
            "label": label,
            "statute": statute,
            "found": found,
            "evidence_url": (v2.get(f"{key}_evidence_url") or None) if found else None,
            "document_date": (v2.get(f"{key}_last_modified") or v2.get(f"{key}_inferred_date") or None) if found else None,
            "file_format": (v2.get(f"{key}_file_format") or None) if found else None,
        })
    return out


def build_council_record(canonical_row: dict, v2: dict | None,
                         v1: dict | None, excel: dict | None) -> dict:
    slug = canonical_row["slug"]
    name = canonical_row["name"]

    # Determine audit status
    if v2 and v2.get("scrape_status") == "ok":
        audit_status = "verified"
    elif (v2 and v2.get("scrape_status") == "robots-disallow"):
        audit_status = "under_audit"
    elif canonical_row["source"] == "ons_only":
        audit_status = "under_audit"
    elif excel and (excel.get("Website URL") or "").strip():
        audit_status = "under_audit_with_url"
    else:
        audit_status = "under_audit"

    # ── UNDER-AUDIT council ───────────────────────────────────────────
    if audit_status in ("under_audit", "under_audit_with_url"):
        excel_email = (excel.get("Email") or "").strip() if excel else ""
        excel_phone = str(excel.get("Phone") or "").strip() if excel else ""
        excel_clerk = (excel.get("Clerk Name") or "").strip() if excel else ""
        excel_url = (excel.get("Website URL") or "").strip() if excel else ""
        return {
            "council_id": canonical_row.get("council_id") or None,
            "ons_code": canonical_row.get("ons_code") or None,
            "slug": slug,
            "name": name,
            "type": canonical_row.get("type") or "parish",
            "county": canonical_row.get("county") or None,
            "region": canonical_row.get("region") or None,
            "principal_authority": canonical_row.get("principal_authority") or None,
            # Contact fields where we have them — never invented
            "website": excel_url or None,
            "email": excel_email or None,
            "phone": excel_phone or None,
            "clerk_name": excel_clerk or None,
            "clerk_email": (excel.get("Clerk Email") or "").strip() if excel else None,
            "chair_name": None,
            # Audit state
            "audit_status": audit_status,
            "audit_status_reason": (
                "Awaiting initial verification — no website on file"
                if audit_status == "under_audit" and not excel_url
                else "Website on file but not yet verified by our scanner"
                if audit_status == "under_audit_with_url"
                else "Awaiting verification"
            ),
            "discovered_via": "ONS register" if canonical_row.get("source") == "ons_only" else "Council ClearSight database",
            # No score
            "score": None,
            "band": "Under Audit",
            "completeness": 0,
            "indicators": [],
            "compliance_audit": [],
            "pillar_earned": {"1": 0, "2": 0, "3": 0, "4": 0},
            "pillar_max_assessed": {"1": 0, "2": 0, "3": 0, "4": 0},
            "numerator": 0,
            "denominator": 0,
            "rank_national": None,
            "rank_type": None,
            "rank_region": None,
            "percentile": None,
            "methodology_version": METHODOLOGY_VERSION,
            "data_extraction_date": DATA_EXTRACTION_DATE,
        }

    # ── VERIFIED council ──────────────────────────────────────────────
    indicators = []
    pillar_earned = {"1": 0, "2": 0, "3": 0, "4": 0}
    for ind_id, pillar, label, max_pts in INDICATORS:
        ir = build_indicator(ind_id, pillar, label, max_pts,
                             canonical_row, v2, v1, excel)
        indicators.append(ir)
        pillar_earned[str(pillar)] += ir["earned"]

    score = sum(i["earned"] for i in indicators)

    # Pull flat fields out of the indicators for the contact panel
    def snap(ind_id: str) -> dict:
        return next((i["input_snapshot"] for i in indicators if i["id"] == ind_id), {})

    return {
        "council_id": canonical_row.get("council_id") or None,
        "ons_code": canonical_row.get("ons_code") or None,
        "slug": slug,
        "name": name,
        "type": canonical_row.get("type") or "parish",
        "county": canonical_row.get("county") or None,
        "region": canonical_row.get("region") or None,
        "principal_authority": canonical_row.get("principal_authority") or None,
        "website": snap("1.1").get("website"),
        "email": snap("1.2").get("email"),
        "phone": snap("1.3").get("phone"),
        "clerk_name": snap("1.4").get("clerk_name"),
        "clerk_email": snap("3.2").get("clerk_email"),
        "chair_name": snap("4.1").get("chair_name"),
        "has_agendas": bool(snap("2.1").get("has_agendas")),
        "has_minutes": bool(snap("2.2").get("has_minutes")),
        "has_financials": bool(snap("3.1").get("has_financials")),
        "has_accessibility_statement": bool(snap("4.3").get("has_accessibility_statement")),
        # Audit state
        "audit_status": "verified",
        "audit_status_reason": "Verified by independent scanner",
        "discovered_via": "Council ClearSight scanner",
        # Scoring
        "indicators": indicators,
        "compliance_audit": build_compliance_audit(v2),
        "pillar_earned": pillar_earned,
        "pillar_max_assessed": {"1": 25, "2": 25, "3": 25, "4": 25},
        "numerator": score,
        "denominator": 100,
        "score": score,
        "completeness": 1.0,
        "band": band_for(score),
        # Extra v2 metadata
        "evidence_links_total_count": int(v2.get("evidence_links_total_count") or 0) if v2 else 0,
        "fresh_documents_count": int(v2.get("fresh_documents_count") or 0) if v2 else 0,
        "stale_documents_count": int(v2.get("stale_documents_count") or 0) if v2 else 0,
        "indicators_evidence_found_count": int(v2.get("indicators_evidence_found_count") or 0) if v2 else 0,
        "data_completeness_pct": float(v2.get("data_completeness_pct") or 0) if v2 else 0,
        "methodology_version": METHODOLOGY_VERSION,
        "data_extraction_date": DATA_EXTRACTION_DATE,
        "scraped_at": v2.get("scraped_at") if v2 else None,
    }


def main():
    print("Loading sources…")
    canonical_rows = []
    with CANONICAL.open(newline="", encoding="utf-8") as f:
        canonical_rows = list(csv.DictReader(f))
    print(f"  canonical: {len(canonical_rows)}")
    v2 = load_v2();   print(f"  v2:        {len(v2)}")
    v1 = load_v1();   print(f"  v1:        {len(v1)}")
    excel = load_excel(); print(f"  excel:     {len(excel)}")

    OUT_COUNCILS.mkdir(parents=True, exist_ok=True)

    # First pass: build all council records
    records = []
    counts = defaultdict(int)
    for cr in canonical_rows:
        slug = cr["slug"]
        rec = build_council_record(
            cr,
            v2.get(slug),
            v1.get(slug),
            excel.get(slug),
        )
        records.append(rec)
        counts[rec["audit_status"]] += 1

    # Rank verified councils nationally and by region
    verified = [r for r in records if r["audit_status"] == "verified"]
    verified.sort(key=lambda r: (-r["score"], r["name"]))
    prev_score = None; prev_rank = 0
    for i, r in enumerate(verified):
        if r["score"] == prev_score:
            r["rank_national"] = prev_rank
        else:
            r["rank_national"] = i + 1
            prev_rank = i + 1; prev_score = r["score"]

    # Regional rank
    by_region = defaultdict(list)
    for r in verified:
        if r.get("region"):
            by_region[r["region"]].append(r)
    for items in by_region.values():
        items.sort(key=lambda r: (-r["score"], r["name"]))
        ps = None; pr = 0
        for i, r in enumerate(items):
            if r["score"] == ps:
                r["rank_region"] = pr
            else:
                r["rank_region"] = i + 1
                pr = i + 1; ps = r["score"]

    # Type rank
    by_type = defaultdict(list)
    for r in verified:
        by_type[r.get("type", "parish")].append(r)
    for items in by_type.values():
        items.sort(key=lambda r: (-r["score"], r["name"]))
        ps = None; pr = 0
        for i, r in enumerate(items):
            if r["score"] == ps:
                r["rank_type"] = pr
            else:
                r["rank_type"] = i + 1
                pr = i + 1; ps = r["score"]

    # Percentile (nationally, against verified universe)
    n = len(verified) or 1
    for r in verified:
        r["percentile"] = round(100 * (n - r["rank_national"] + 1) / n, 1)

    # Write per-slug JSONs
    print("\nWriting per-slug JSONs…")
    for r in records:
        path = OUT_COUNCILS / f"{r['slug']}.json"
        path.write_text(
            json.dumps(r, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )

    # Write directory.json (slim)
    print("Writing directory.json + councils_scored.json…")
    directory = []
    for r in records:
        directory.append({
            "id": r.get("council_id") or r.get("ons_code") or r["slug"],
            "slug": r["slug"],
            "name": r["name"],
            "type": r["type"],
            "county": r.get("county"),
            "region": r.get("region"),
            "principal_authority": r.get("principal_authority"),
            "score": r["score"],
            "rank_national": r.get("rank_national"),
            "rank_region": r.get("rank_region"),
            "rank_type": r.get("rank_type"),
            "percentile": r.get("percentile"),
            "band": r["band"],
            "completeness": r["completeness"],
            "audit_status": r["audit_status"],
            "has_website": bool(r.get("website")),
        })
    OUT_DIRECTORY.write_text(json.dumps(directory, ensure_ascii=False), encoding="utf-8")
    OUT_SCORED.write_text(json.dumps(directory, ensure_ascii=False), encoding="utf-8")

    # Summary
    print("\n=== Publish summary ===")
    for k, v in counts.items():
        print(f"  {k:30s} {v:>6}")
    print(f"  {'TOTAL':30s} {len(records):>6}")
    print(f"\nWrote {len(records)} per-slug JSONs to {OUT_COUNCILS.relative_to(REPO)}")
    print(f"Verified universe: {len(verified)}")
    if verified:
        scores = [r["score"] for r in verified]
        print(f"  score range: {min(scores)} – {max(scores)}, mean {sum(scores)/len(scores):.1f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
"score"] for r in verified]
        print(f"  score range: {min(scores)} - {max(scores)}, mean {sum(scores)/len(scores):.1f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
