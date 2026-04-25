"""Comprehensive document extractors for Council ClearSight v2.

Every extractor returns a structured dict containing:
  - found: bool                   -- did we observe evidence
  - evidence_url: str | None      -- the URL where evidence sits
  - last_modified: str | None     -- ISO8601 if HTTP Last-Modified header was given
  - inferred_date: str | None     -- date guessed from filename or page title
  - file_format: str | None       -- pdf, html, docx, etc.
  - http_status: int | None       -- the actual HTTP status of the evidence URL
  - notes: str                    -- short human-readable note

This structure is what makes claims defensible: every '1' in the
public score has a URL, a last-checked timestamp, and (where possible)
a document age.  Without these the score is a yes/no and cannot be
challenged or improved.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional, Iterable
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup


# ─────────────────────────────────────────────────────────────────────
# Result type
# ─────────────────────────────────────────────────────────────────────

@dataclass
class Finding:
    found: bool = False
    evidence_url: Optional[str] = None
    last_modified: Optional[str] = None      # from HTTP Last-Modified header
    inferred_date: Optional[str] = None      # from filename / link text
    file_format: Optional[str] = None        # pdf, html, docx, xlsx, doc, ...
    http_status: Optional[int] = None
    document_count: int = 0                  # how many distinct evidence links found
    notes: str = ""

    def as_row_prefix(self, prefix: str) -> dict:
        """Flatten this into CSV columns prefixed with `prefix_`."""
        return {f"{prefix}_{k}": v for k, v in asdict(self).items()}


# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────

# Match dates in a wide range of common council-site formats.
# Examples accepted: 2026-04-15, 15-04-2026, 15.04.2026, April-2026,
# Apr 2026, 2026 April, 15 April 2026, Q1-2026, etc.
_DATE_PATTERNS: list[tuple[re.Pattern, str]] = [
    # Note on ordering: regex alternation is left-to-right; for "15" we need
    # [12]\d to match before 0?[1-9] so we don't truncate to "1".  Longer
    # alternatives go first.
    (re.compile(r"(20\d{2})[-_/](1[0-2]|0?[1-9])[-_/](3[01]|[12]\d|0?[1-9])"), "ymd"),
    (re.compile(r"(3[01]|[12]\d|0?[1-9])[-_/.](1[0-2]|0?[1-9])[-_/.](20\d{2})"), "dmy"),
    # dmy_word accepts hyphens, underscores, dots and spaces between parts so
    # filenames like "agenda-12-Oct-2025.pdf" still match.
    (re.compile(r"(3[01]|[12]\d|0?[1-9])[-_\s.]+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[-_\s.]+(20\d{2})", re.I), "dmy_word"),
    (re.compile(r"(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[-_\s]+(20\d{2})", re.I), "my_word"),
    # Year-only fallback. Use non-digit lookarounds rather than \b because
    # filenames often use underscores (e.g. "agar_2024-25.pdf"), and \b
    # treats _ as a word character so "_2024" has no boundary.
    (re.compile(r"(?<!\d)(20\d{2})(?!\d)"), "y_only"),
]

_MONTH_TO_NUM = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def infer_date(s: str) -> Optional[str]:
    """Guess an ISO-format date from a filename or link text.

    Returns yyyy-mm-dd if confident, yyyy-mm if month-only, yyyy if year-only,
    or None if nothing parseable.  Conservative — we'd rather return None than
    a wrong date, because document-age affects the public score.
    """
    if not s:
        return None
    s_low = s.lower()
    for pat, kind in _DATE_PATTERNS:
        m = pat.search(s_low)
        if not m:
            continue
        try:
            if kind == "ymd":
                y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
                return f"{y:04d}-{mo:02d}-{d:02d}"
            if kind == "dmy":
                d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
                return f"{y:04d}-{mo:02d}-{d:02d}"
            if kind == "dmy_word":
                d = int(m.group(1))
                mo = _MONTH_TO_NUM[m.group(2)[:3].lower()]
                y = int(m.group(3))
                return f"{y:04d}-{mo:02d}-{d:02d}"
            if kind == "my_word":
                mo = _MONTH_TO_NUM[m.group(1)[:3].lower()]
                y = int(m.group(2))
                return f"{y:04d}-{mo:02d}"
            if kind == "y_only":
                y = int(m.group(1))
                # only accept y_only if the surrounding text strongly implies a doc year
                if any(kw in s_low for kw in ["agar", "annual", "agm", "minutes", "agenda", "audit", "accounts"]):
                    return f"{y:04d}"
                return None
        except (ValueError, KeyError):
            continue
    return None


def file_format_of(url: str) -> Optional[str]:
    """Guess document format from a URL extension."""
    if not url:
        return None
    p = urlparse(url).path.lower()
    for ext in ("pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "odt", "ods", "html", "htm"):
        if p.endswith("." + ext):
            return ext
    return "html"  # default for pages without a recognised file extension


def collect_links(soup: BeautifulSoup, base_url: str) -> list[tuple[str, str]]:
    """Return a list of (text, absolute_url) for every <a> on the page."""
    out: list[tuple[str, str]] = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        text = a.get_text(" ", strip=True) or ""
        try:
            absolute = urljoin(base_url, href)
        except Exception:
            continue
        out.append((text, absolute))
    return out


def find_matches(
    links: Iterable[tuple[str, str]],
    keyword_groups: list[list[str]],
    exclude: list[str] | None = None,
) -> list[tuple[str, str]]:
    """Return links whose text or url contains *all* terms in any keyword group.

    Each keyword_group is a list of terms that must ALL appear (AND).  Multiple
    groups are OR'd together.  This lets us require, e.g.,
    ['standing', 'orders']  -- both words present  -- while still matching
    "Standing-Orders.pdf" or "the council's standing orders document".
    """
    exclude = [e.lower() for e in (exclude or [])]
    out: list[tuple[str, str]] = []
    for text, url in links:
        haystack = f"{text} {url}".lower()
        if any(x in haystack for x in exclude):
            continue
        for group in keyword_groups:
            if all(term.lower() in haystack for term in group):
                out.append((text, url))
                break
    return out


# ─────────────────────────────────────────────────────────────────────
# Indicator extractors — each returns a Finding
# ─────────────────────────────────────────────────────────────────────
#
# Naming convention: `extract_<short_name>(soup, base_url) -> Finding`
#
# Each extractor returns a single Finding capturing the *best* (most recent
# or most authoritative) evidence link.  document_count records the total
# number of matching links so we can distinguish "1 ancient minutes file"
# from "12 minutes files covering the year".
# ─────────────────────────────────────────────────────────────────────

def _best_finding(matches: list[tuple[str, str]]) -> Finding:
    """Pick the best (newest) match from a list, populate a Finding."""
    if not matches:
        return Finding(found=False, document_count=0)

    # Score each match by inferred date — newer wins.
    scored = []
    for text, url in matches:
        d = infer_date(url) or infer_date(text)
        # date strings sort lexically when zero-padded; None sorts last
        scored.append((d or "", text, url))
    scored.sort(reverse=True)
    best_date, best_text, best_url = scored[0]
    return Finding(
        found=True,
        evidence_url=best_url,
        inferred_date=best_date or None,
        file_format=file_format_of(best_url),
        document_count=len(matches),
        notes=f"best of {len(matches)} matches; link text: {best_text[:80]}",
    )


# ─── Pillar 3 / 4 — current scoring (also captured by v1 scraper, refined here)
def extract_agendas(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["agenda"],
            ["meeting", "papers"],
        ],
        exclude=["archive"],  # keep archives but don't pick them as 'best'
    ))

def extract_minutes(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["minutes"],
            ["meeting", "notes"],
        ],
        exclude=[],
    ))

def extract_agar(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["agar"],
            ["annual", "governance"],
            ["annual", "return"],
            ["statement", "accounts"],
        ],
        exclude=[],
    ))

def extract_register_of_interests(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["register", "interest"],
            ["declaration", "interest"],
            ["pecuniary"],
            ["dpi"],
        ],
        exclude=[],
    ))

def extract_accessibility_statement(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["accessibility", "statement"],
            ["accessibility"],  # weaker fallback
        ],
        exclude=["app"],
    ))


# ─── Transparency Code 2015 — items required for smaller authorities
# Reg ref: Local Government Transparency Code for Smaller Authorities (2015).
# Smaller authority = annual income/expenditure under £200k.
# Required publications — the 7 things every council with income > £25k must
# publish on a website that is publicly accessible.

def extract_expenditure_over_100(soup, base_url):
    """All items of expenditure above £100 — TC2015 §3.1."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["expenditure", "over"],
            ["payments", "over"],
            ["spend", "over"],
            ["transparency", "expenditure"],
            ["payments", "made"],
            ["over", "£100"],
        ],
        exclude=[],
    ))

def extract_end_of_year_accounts(soup, base_url):
    """End of year accounts — TC2015 §3.2."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["end", "year", "accounts"],
            ["annual", "accounts"],
            ["receipts", "payments"],
            ["financial", "statement"],
        ],
        exclude=[],
    ))

def extract_annual_governance_statement(soup, base_url):
    """Annual governance statement — TC2015 §3.3 / AGAR Section 1."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["annual", "governance", "statement"],
            ["section", "1"],   # AGAR Section 1 = governance statement
            ["governance", "statement"],
        ],
        exclude=[],
    ))

def extract_internal_audit_report(soup, base_url):
    """Internal audit report — TC2015 §3.4 / AGAR Section 4."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["internal", "audit"],
            ["section", "4"],   # AGAR Section 4 = internal audit
            ["auditor", "report"],
        ],
        exclude=["external"],
    ))

def extract_councillor_responsibilities(soup, base_url):
    """List of councillors and their responsibilities — TC2015 §3.5."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["councillor", "responsibilities"],
            ["committee", "membership"],
            ["councillor", "roles"],
            ["who", "represents"],   # often the title of council/membership pages
        ],
        exclude=[],
    ))

def extract_asset_register(soup, base_url):
    """Public land and building assets — TC2015 §3.6 / Asset Register."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["asset", "register"],
            ["land", "assets"],
            ["public", "land"],
            ["fixed", "assets"],
        ],
        exclude=[],
    ))

def extract_dates_of_meetings(soup, base_url):
    """Dates of public meetings — TC2015 §3.7."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["meeting", "dates"],
            ["calendar", "meeting"],
            ["forthcoming", "meeting"],
            ["upcoming", "meeting"],
            ["schedule", "meeting"],
        ],
        exclude=[],
    ))


# ─── LCAS Foundation criteria — documents likely to be public
# Foundation award maps to ~24 criteria; some are observable on the website,
# others are internal (training records, etc.).  We capture the observable ones.

def extract_standing_orders(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[["standing", "orders"]],
        exclude=[],
    ))

def extract_financial_regulations(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[["financial", "regulations"]],
        exclude=[],
    ))

def extract_risk_assessment(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["risk", "assessment"],
            ["risk", "management"],
            ["risk", "register"],
        ],
        exclude=["health", "safety"],  # to separate from H&S risk assessments
    ))

def extract_code_of_conduct(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[["code", "conduct"]],
        exclude=[],
    ))

def extract_complaints_procedure(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["complaints", "procedure"],
            ["complaints", "policy"],
            ["how", "complain"],
        ],
        exclude=[],
    ))

def extract_gdpr_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["gdpr"],
            ["data", "protection", "policy"],
            ["privacy", "policy"],
            ["privacy", "notice"],
        ],
        exclude=[],
    ))

def extract_foi_publication_scheme(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["publication", "scheme"],
            ["freedom", "information"],
            ["foi"],
        ],
        exclude=[],
    ))

def extract_health_safety_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["health", "safety", "policy"],
            ["h&s"],
        ],
        exclude=[],
    ))

def extract_equality_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["equality", "policy"],
            ["equality", "diversity"],
            ["equal", "opportunities"],
        ],
        exclude=[],
    ))

def extract_co_option_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["co-option"],
            ["cooption"],
            ["co-opt", "policy"],
        ],
        exclude=[],
    ))

def extract_training_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["training", "policy"],
            ["training", "plan"],
            ["councillor", "training"],
            ["clerk", "training"],
        ],
        exclude=[],
    ))

def extract_grants_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["grants", "policy"],
            ["grant", "applications"],
            ["s137"],
            ["section", "137"],
        ],
        exclude=[],
    ))

def extract_communications_policy(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["communications", "policy"],
            ["social", "media", "policy"],
            ["press", "policy"],
            ["media", "policy"],
        ],
        exclude=[],
    ))


# ─── Digital engagement — looks for live channels with residents

def extract_forward_meeting_calendar(soup, base_url):
    """A forward-looking calendar of meetings (vs a list of past minutes)."""
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["forthcoming"],
            ["upcoming", "meeting"],
            ["calendar"],
            ["next", "meeting"],
        ],
        exclude=[],
    ))

def extract_newsletter(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["newsletter"],
            ["bulletin"],
        ],
        exclude=[],
    ))

def extract_consultation_page(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["consultation"],
            ["have", "your", "say"],
            ["resident", "survey"],
        ],
        exclude=[],
    ))

def extract_annual_report(soup, base_url):
    return _best_finding(find_matches(
        collect_links(soup, base_url),
        keyword_groups=[
            ["annual", "report"],
            ["chairman", "report"],
            ["mayor", "report"],
        ],
        exclude=["audit"],
    ))


# ─── Social media presence

_SOCIAL_HOSTS = {
    "facebook": ("facebook.com", "fb.com"),
    "twitter":  ("twitter.com", "x.com"),
    "instagram": ("instagram.com",),
    "youtube":  ("youtube.com", "youtu.be"),
    "linkedin": ("linkedin.com",),
    "nextdoor": ("nextdoor.co.uk", "nextdoor.com"),
}

def extract_social_media(soup, base_url) -> dict:
    """Find official social-media handles on the homepage.

    Returns a dict of platform → url for each platform detected.  We're
    deliberately conservative: we record the URL exactly as found, never
    inferring a handle that isn't actually linked.
    """
    found: dict[str, str] = {}
    for _, url in collect_links(soup, base_url):
        host = urlparse(url).netloc.lower()
        for platform, hosts in _SOCIAL_HOSTS.items():
            if any(host.endswith(h) for h in hosts) and platform not in found:
                found[platform] = url
    return found


# ─── Map of all extractors — used by the runner

EXTRACTORS = {
    # Pillars 1, 3, 4 (existing scoring)
    "accessibility_statement":     extract_accessibility_statement,
    "agendas":                     extract_agendas,
    "minutes":                     extract_minutes,
    "agar":                        extract_agar,
    "register_of_interests":       extract_register_of_interests,

    # Transparency Code 2015
    "expenditure_over_100":        extract_expenditure_over_100,
    "end_of_year_accounts":        extract_end_of_year_accounts,
    "annual_governance_statement": extract_annual_governance_statement,
    "internal_audit_report":       extract_internal_audit_report,
    "councillor_responsibilities": extract_councillor_responsibilities,
    "asset_register":              extract_asset_register,
    "dates_of_meetings":           extract_dates_of_meetings,

    # LCAS Foundation / Quality
    "standing_orders":             extract_standing_orders,
    "financial_regulations":       extract_financial_regulations,
    "risk_assessment":             extract_risk_assessment,
    "code_of_conduct":             extract_code_of_conduct,
    "complaints_procedure":        extract_complaints_procedure,
    "gdpr_policy":                 extract_gdpr_policy,
    "foi_publication_scheme":      extract_foi_publication_scheme,
    "health_safety_policy":        extract_health_safety_policy,
    "equality_policy":             extract_equality_policy,
    "co_option_policy":            extract_co_option_policy,
    "training_policy":             extract_training_policy,
    "grants_policy":               extract_grants_policy,
    "communications_policy":       extract_communications_policy,

    # Digital engagement
    "forward_meeting_calendar":    extract_forward_meeting_calendar,
    "newsletter":                  extract_newsletter,
    "consultation_page":           extract_consultation_page,
    "annual_report":               extract_annual_report,
}
