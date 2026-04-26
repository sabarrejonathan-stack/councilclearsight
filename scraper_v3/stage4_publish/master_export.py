"""Stage 4b — emit a single Excel + CSV with every captured field per council.

After stage 4 has written the per-slug JSONs the website consumes, this
script joins:

    councils.csv          (canonical list — slug, name, type, county, region, ons_code)
    urls_resolved.json    (stage 1 — chosen website + confidence + source)
    detections/{slug}.json (stage 3 — every indicator with evidence URL/snippet)
    client/public/data/councils/{slug}.json  (stage 4a — final score, rank, band)

into one row per council with every column needed for review:

    Identity       slug, council_name, type, county, region, ons_code
    Discovery      website, website_confidence, website_source, candidates_tried
    Contact        email, phone, clerk_name, clerk_email, chair_name, councillors_listed
    Documents      has_agendas, agenda_recent_date, agenda_evidence_url
                   has_minutes, minutes_recent_date, minutes_evidence_url
                   has_financials_AGAR, agar_evidence_url
                   has_accessibility_statement, accessibility_evidence_url
                   has_https
    Per-indicator  {ind}_confidence, {ind}_evidence_url, {ind}_evidence_snippet  (×12)
    Scoring       pillar_1, pillar_2, pillar_3, pillar_4, total_score, band, rank, percentile
    Provenance    data_extraction_date, scrape_status

Outputs:
    scraper_v3/data/master_export.csv     — lossless tabular export
    scraper_v3/data/master_export.xlsx    — same data, formatted (frozen header)

If openpyxl isn't installed the XLSX step is skipped with a warning; the CSV
is always written.
"""
from __future__ import annotations
import argparse
import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


INDICATOR_IDS = ("1.1", "1.2", "1.3", "1.4",
                 "2.1", "2.2",
                 "3.1", "3.2",
                 "4.1", "4.2", "4.3", "4.4")


def _safe_get(d: Optional[dict], key: str, default=None):
    return d.get(key, default) if isinstance(d, dict) else default


def _detector_field(det_payload: dict, ind_id: str, field: str, default=None):
    """Reach into stage-3 detections for a per-indicator field."""
    inds = det_payload.get("indicators") or {}
    one = inds.get(ind_id) or {}
    return one.get(field, default)


def assemble_row(
    council: dict,
    resolved: Optional[dict],
    detections: Optional[dict],
    published: Optional[dict],
) -> dict:
    """Compose one fully-populated row from the four input sources."""
    slug = council["slug"]
    row: Dict[str, object] = {
        # Identity
        "slug": slug,
        "council_name": council.get("council_name", ""),
        "type": council.get("type", ""),
        "county": council.get("county", ""),
        "district": council.get("district", ""),
        "region": council.get("region", ""),
        "ons_code": council.get("ons_code", ""),
        "data_source": council.get("data_source", ""),
        # Discovery
        "website": _safe_get(resolved, "url") or _safe_get(published, "website") or "",
        "website_confidence": _safe_get(resolved, "confidence", 0.0),
        "website_source": _safe_get(resolved, "source", ""),
        "candidates_tried": _safe_get(resolved, "candidates_tried", 0),
        # Contact (flat fields from published JSON — the source of truth for the website)
        "email": _safe_get(published, "email") or "",
        "phone": _safe_get(published, "phone") or "",
        "clerk_name": _safe_get(published, "clerk_name") or "",
        "clerk_email": _safe_get(published, "clerk_email") or "",
        "chair_name": _safe_get(published, "chair_name") or "",
        "councillors_listed": bool(_safe_get(published, "councillors_listed", False)),
        # Document presence + recency
        "has_agendas": bool(_safe_get(published, "has_agendas", False)),
        "agenda_recent_date": _detector_field(detections or {}, "2.1", "document_date", "") or "",
        "agenda_evidence_url": _detector_field(detections or {}, "2.1", "evidence_url", "") or "",
        "has_minutes": bool(_safe_get(published, "has_minutes", False)),
        "minutes_recent_date": _detector_field(detections or {}, "2.2", "document_date", "") or "",
        "minutes_evidence_url": _detector_field(detections or {}, "2.2", "evidence_url", "") or "",
        "has_financials_AGAR": bool(_safe_get(published, "has_financials", False)),
        "agar_evidence_url": _detector_field(detections or {}, "3.1", "evidence_url", "") or "",
        "has_accessibility_statement": bool(_safe_get(published, "has_accessibility_statement", False)),
        "accessibility_evidence_url": _detector_field(detections or {}, "4.3", "evidence_url", "") or "",
        "has_https": (str(_safe_get(published, "website") or "").startswith("https://")),
    }

    # Per-indicator audit columns: confidence + evidence URL + snippet (×12).
    for ind_id in INDICATOR_IDS:
        row[f"ind_{ind_id}_confidence"] = _detector_field(detections or {}, ind_id, "confidence", 0.0) or 0.0
        row[f"ind_{ind_id}_evidence_url"] = _detector_field(detections or {}, ind_id, "evidence_url", "") or ""
        snippet = _detector_field(detections or {}, ind_id, "evidence_snippet", "") or ""
        # Trim to keep cells from blowing up Excel — full text stays in the JSON
        row[f"ind_{ind_id}_evidence_snippet"] = (snippet[:500]) if isinstance(snippet, str) else ""

    # Scoring (only present when stage 4a has run)
    pillar_earned = _safe_get(published, "pillar_earned") or {}
    row["pillar_1"] = pillar_earned.get("1", 0)
    row["pillar_2"] = pillar_earned.get("2", 0)
    row["pillar_3"] = pillar_earned.get("3", 0)
    row["pillar_4"] = pillar_earned.get("4", 0)
    row["total_score"] = _safe_get(published, "score", 0) or 0
    row["band"] = _safe_get(published, "band", "Not Yet Assessed") or "Not Yet Assessed"
    row["rank"] = _safe_get(published, "rank", "")
    row["regional_rank"] = _safe_get(published, "regional_rank", "")
    row["percentile"] = _safe_get(published, "percentile", "")
    row["methodology_version"] = _safe_get(published, "methodology_version", "VDTI v4.0")

    # Provenance
    row["data_extraction_date"] = _safe_get(published, "data_extraction_date",
                                            datetime.utcnow().strftime("%Y-%m-%d"))
    row["scrape_status"] = _safe_get(published, "scrape_status", "no-website")

    return row


def write_csv(rows: List[dict], path: Path) -> None:
    if not rows:
        print(f"  No rows to write — {path} skipped.")
        return
    fieldnames = list(rows[0].keys())
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
    print(f"  Wrote {len(rows):,} rows → {path}")


def write_xlsx(rows: List[dict], path: Path) -> None:
    """Write Excel via openpyxl. Skipped (with a friendly note) if not installed."""
    try:
        from openpyxl import Workbook
        from openpyxl.utils import get_column_letter
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        print(f"  openpyxl not installed — XLSX skipped. Install with: pip install openpyxl")
        return
    if not rows:
        return
    fieldnames = list(rows[0].keys())

    wb = Workbook()
    ws = wb.active
    ws.title = "Councils"

    # Header
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="0F2C4A")    # Council ClearSight navy
    header_align = Alignment(vertical="center", wrap_text=True)
    for col_idx, name in enumerate(fieldnames, start=1):
        c = ws.cell(row=1, column=col_idx, value=name)
        c.font = header_font
        c.fill = header_fill
        c.alignment = header_align

    # Data rows
    for r_idx, row in enumerate(rows, start=2):
        for c_idx, name in enumerate(fieldnames, start=1):
            v = row.get(name, "")
            if isinstance(v, bool):
                v = "TRUE" if v else "FALSE"
            ws.cell(row=r_idx, column=c_idx, value=v)

    # Freeze header, set sensible column widths
    ws.freeze_panes = "A2"
    width_map = {
        "slug": 32, "council_name": 36, "type": 10, "county": 22,
        "district": 22, "region": 22, "ons_code": 12, "data_source": 12,
        "website": 42, "email": 32, "phone": 18,
        "clerk_name": 28, "clerk_email": 32, "chair_name": 28,
        "agenda_evidence_url": 42, "minutes_evidence_url": 42,
        "agar_evidence_url": 42, "accessibility_evidence_url": 42,
    }
    for col_idx, name in enumerate(fieldnames, start=1):
        ws.column_dimensions[get_column_letter(col_idx)].width = width_map.get(name, 18)

    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    print(f"  Wrote {len(rows):,} rows → {path}")


def run(
    councils_csv: str,
    urls_resolved_json: str,
    detections_dir: str,
    published_dir: str,
    out_csv: str,
    out_xlsx: str,
) -> None:
    councils_path = Path(councils_csv)
    urls_path = Path(urls_resolved_json)
    det_dir = Path(detections_dir)
    pub_dir = Path(published_dir)

    # Index sources by slug
    print(f"Loading {councils_path}...")
    with open(councils_path, "r", encoding="utf-8") as f:
        councils = list(csv.DictReader(f))
    print(f"  {len(councils):,} councils")

    resolved_by_slug: Dict[str, dict] = {}
    if urls_path.exists():
        with open(urls_path, "r", encoding="utf-8") as f:
            for item in json.load(f):
                if item.get("slug"):
                    resolved_by_slug[item["slug"]] = item
        print(f"  {len(resolved_by_slug):,} URL-resolution records")
    else:
        print(f"  WARN: {urls_path} missing — discovery columns will be empty")

    rows: List[dict] = []
    missing_pub = 0
    for c in councils:
        slug = c.get("slug")
        if not slug:
            continue
        det_path = det_dir / f"{slug}.json"
        pub_path = pub_dir / "councils" / f"{slug}.json"
        det = json.loads(det_path.read_text(encoding="utf-8")) if det_path.exists() else None
        pub = json.loads(pub_path.read_text(encoding="utf-8")) if pub_path.exists() else None
        if pub is None:
            missing_pub += 1
        rows.append(assemble_row(c, resolved_by_slug.get(slug), det, pub))

    print(f"  Assembled {len(rows):,} rows ({missing_pub:,} without published JSON)")

    write_csv(rows, Path(out_csv))
    write_xlsx(rows, Path(out_xlsx))

    # Summary
    have_url = sum(1 for r in rows if r["website"])
    have_email = sum(1 for r in rows if r["email"])
    have_clerk = sum(1 for r in rows if r["clerk_name"])
    have_phone = sum(1 for r in rows if r["phone"])
    have_chair = sum(1 for r in rows if r["chair_name"])
    have_agenda = sum(1 for r in rows if r["has_agendas"])
    have_minutes = sum(1 for r in rows if r["has_minutes"])
    have_agar = sum(1 for r in rows if r["has_financials_AGAR"])
    have_a11y = sum(1 for r in rows if r["has_accessibility_statement"])
    print(
        f"\nCoverage:\n"
        f"  Website found:           {have_url:>6,} / {len(rows):,}\n"
        f"  Email captured:          {have_email:>6,}\n"
        f"  Clerk name captured:     {have_clerk:>6,}\n"
        f"  Phone captured:          {have_phone:>6,}\n"
        f"  Chair name captured:     {have_chair:>6,}\n"
        f"  Agendas detected:        {have_agenda:>6,}\n"
        f"  Minutes detected:        {have_minutes:>6,}\n"
        f"  AGAR detected:           {have_agar:>6,}\n"
        f"  Accessibility statement: {have_a11y:>6,}\n"
    )


def main():
    p = argparse.ArgumentParser(description="Stage 4b: master Excel/CSV export")
    p.add_argument("--councils", default="scraper_v3/data/councils.csv")
    p.add_argument("--urls", default="scraper_v3/data/urls_resolved.json")
    p.add_argument("--detections", default="scraper_v3/data/detections")
    p.add_argument("--published", default="client/public/data")
    p.add_argument("--out-csv", default="scraper_v3/data/master_export.csv")
    p.add_argument("--out-xlsx", default="scraper_v3/data/master_export.xlsx")
    args = p.parse_args()
    run(args.councils, args.urls, args.detections, args.published,
        args.out_csv, args.out_xlsx)


if __name__ == "__main__":
    main()
