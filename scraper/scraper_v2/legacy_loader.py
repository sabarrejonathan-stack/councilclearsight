"""Legacy Excel loader — Council_ClearSight_16.04.26.xlsx.

A predecessor data extraction (April 2026) produced an Excel file with
real, useful baseline data for many councils. Some of its columns are
worth integrating into v2; some are stale or actively wrong and must be
ignored. This module makes the trustworthy fields available to the
runner while explicitly discarding the rest.

What we KEEP from the legacy file (treated as authoritative baselines)
---------------------------------------------------------------------
  * District            — 93% populated, geographic enrichment we lack
  * Council Email       — 59% populated, real addresses
  * Phone               — 40% populated, real UK numbers
  * Clerk Name          — 31% populated, real names (the v2 chair-regex
                          frequently produces nonsense like "Sub-Group
                          Finance Apostles", so legacy clerks are far
                          more reliable than scraped chairs)
  * Clerk Email         — 59% populated
  * Clerk Phone         — 40% populated
  * School data         — School Count + School Names + School Websites +
                          Head Teachers; powers the brief's school-
                          engagement feature without extra scraping

What we EXPLICITLY DISCARD from the legacy file
------------------------------------------------
  * VDTI Score / VDTI ranks / Pillar 1-4   — old v2.0 methodology;
                                              replaced by CC-TI v3.0
  * Has Website / Agendas / Minutes / etc. — older audit snapshot;
                                              v2 produces fresh data
  * Chair Name field       — only 203 rows populated, AND the values
                              are semicolon-separated councillor
                              lists, not chair names. Field is
                              mislabeled. Do not trust.
  * Population Band, Precept Band, Address, Meeting Frequency,
    Chair Email, Councillors Top 3, School GIAS URNs               —
    all <1% populated. Effectively empty.

The legacy Has-X flags ARE useful for one thing: detecting movement
between scrapes. If legacy says `Has Minutes=Yes` and v2 finds nothing,
that's a removed/moved document worth flagging in the subscriber
dashboard. We expose that as `legacy_*` columns so the merge step can
compare deltas.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import pandas as pd


@dataclass
class LegacyRecord:
    # Identity (always present)
    council_id: str = ""
    slug: str = ""

    # Trustworthy enrichment fields
    district: str = ""
    council_email: str = ""
    council_phone: str = ""
    clerk_name: str = ""
    clerk_email: str = ""
    clerk_phone: str = ""

    # School engagement (real data; powers the brief's school feature)
    school_count: int = 0
    school_names: list[str] = field(default_factory=list)
    school_websites: list[str] = field(default_factory=list)
    school_head_teachers: list[str] = field(default_factory=list)

    # Stale-but-useful Has-X flags. Treat as historical baseline only.
    legacy_has_website: Optional[bool] = None
    legacy_has_agendas: Optional[bool] = None
    legacy_has_minutes: Optional[bool] = None
    legacy_has_financials: Optional[bool] = None
    legacy_has_contact_details: Optional[bool] = None
    legacy_has_accessibility_statement: Optional[bool] = None


def _to_bool(x) -> Optional[bool]:
    """Parse the legacy Yes/No/blank columns to bool|None."""
    if x is None:
        return None
    s = str(x).strip().lower()
    if s in {"yes", "true", "1", "y"}:
        return True
    if s in {"no", "false", "0", "n"}:
        return False
    return None


def _split_pipe(x) -> list[str]:
    """The school columns are pipe-separated when there are multiple values."""
    if not x or pd.isna(x):
        return []
    s = str(x).strip()
    if not s:
        return []
    # Try common separators; pipe is what the legacy file uses
    for sep in ("|", ";", "\n"):
        if sep in s:
            return [item.strip() for item in s.split(sep) if item.strip()]
    return [s]


def _safe_str(x) -> str:
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return ""
    return str(x).strip()


def _safe_int(x) -> int:
    try:
        if pd.isna(x):
            return 0
        return int(x)
    except (TypeError, ValueError):
        return 0


def load(xlsx_path: Path) -> dict[str, LegacyRecord]:
    """Load the legacy Excel and return a dict keyed by slug.

    We read only the 'All Councils' sheet — it contains every field we want.
    The other sheets (Email Outreach List, Named Clerks, Governance Audit,
    Individual Schools, School Engagement) are derived from this one and
    add no new information, so we ignore them.
    """
    if not xlsx_path.exists():
        raise FileNotFoundError(f"legacy Excel not found: {xlsx_path}")

    df = pd.read_excel(xlsx_path, sheet_name="All Councils")
    out: dict[str, LegacyRecord] = {}

    for _, row in df.iterrows():
        slug = _safe_str(row.get("Slug"))
        if not slug:
            continue

        rec = LegacyRecord(
            council_id=_safe_str(row.get("ID")),
            slug=slug,
            district=_safe_str(row.get("District")),

            # Note: legacy file often duplicates Email = Clerk Email when the
            # council uses a single clerk@... address. We carry both fields
            # forward unchanged; the validator will check each independently.
            council_email=_safe_str(row.get("Email")),
            council_phone=_safe_str(row.get("Phone")),
            clerk_name=_safe_str(row.get("Clerk Name")),
            clerk_email=_safe_str(row.get("Clerk Email")),
            clerk_phone=_safe_str(row.get("Clerk Phone")),

            school_count=_safe_int(row.get("School Count")),
            school_names=_split_pipe(row.get("School Names")),
            school_websites=_split_pipe(row.get("School Websites")),
            school_head_teachers=_split_pipe(row.get("School Head Teachers")),

            legacy_has_website=_to_bool(row.get("Has Website")),
            legacy_has_agendas=_to_bool(row.get("Has Agendas")),
            legacy_has_minutes=_to_bool(row.get("Has Minutes")),
            legacy_has_financials=_to_bool(row.get("Has Financials")),
            legacy_has_contact_details=_to_bool(row.get("Has Contact Details")),
            legacy_has_accessibility_statement=_to_bool(row.get("Has Accessibility Statement")),
        )
        out[slug] = rec

    return out


def empty_record() -> LegacyRecord:
    """Return a blank record for councils not in the legacy file."""
    return LegacyRecord()
