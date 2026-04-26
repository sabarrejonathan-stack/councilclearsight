"""VDTI Scanner v1 — concurrent, evidence-aware, CRM-ready scraper.

Single-file scraper that for each council in the input CSV produces:
  - 14 indicator verdicts with per-document evidence URLs
  - CRM-ready contact row (council email, clerk name, clerk email, phone, chair)

Design choices (April 2026):
  - Concurrent across hosts (default 80 workers), but only ONE in-flight
    request per host. Per-host politeness budget (3s minimum between requests
    to the same host) enforced inside the per-host worker loop.
  - robots.txt fetched once per host, cached.
  - Resume-safe: skips councils already in the output CSV by slug.
  - Two-pass extraction: pass 1 = homepage + accessibility link; pass 2 follows
    up to 6 keyword-matched internal links (agendas, minutes, finance,
    register-of-interests, councillors, accessibility).
  - PDF detection: HEAD/GET with Range, content-type sniff, document_date from
    URL slug or first-page text.
  - Transparent UA, no fake-Mozilla.

Outputs:
  - scraper/data/scrape_results_v41.csv   — full indicator results + evidence URLs
  - scraper/data/crm_contacts.csv         — one row per council, CRM-ready

Usage:
  python -m scraper.vdti_scanner \
      --input  scraper/data/councils_input.csv \
      --output scraper/data/scrape_results_v41.csv \
      --crm    scraper/data/crm_contacts.csv \
      --workers 80 \
      --limit 5000

Required CSV columns on input: council_id, slug, name, website_url
"""
from __future__ import annotations

import argparse
import csv
import logging
import queue
import re
import sys
import threading
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Optional, Iterable, Tuple, Dict, List, Set
from urllib import robotparser
from urllib.parse import urlparse, urljoin, urlsplit

import requests
from bs4 import BeautifulSoup

USER_AGENT = (
    "CouncilClearSightBot/1.1 "
    "(+https://councilclearsight.org.uk; operator@councilclearsight.org.uk) "
    "polite static fetcher - respects robots.txt"
)

PER_HOST_MIN_INTERVAL_S = 3.0
REQUEST_TIMEOUT_S = 12.0
MAX_PAGE_BYTES = 2_500_000   # 2.5 MB
MAX_PDF_SNIFF_BYTES = 200_000  # 200 KB enough to read first page
MAX_FOLLOW_PAGES = 6

# ---------------------------------------------------------------------------
# Output schema
# ---------------------------------------------------------------------------
OUTPUT_COLUMNS = [
    "council_id", "slug", "name",
    # Pillar 1
    "website_url", "website_resolves", "is_https",
    "council_email", "council_email_evidence_url",
    "council_phone", "council_phone_evidence_url",
    "clerk_name", "clerk_name_evidence_url",
    # Pillar 2
    "has_agendas", "agendas_evidence_url", "agendas_latest_date",
    "has_minutes", "minutes_evidence_url", "minutes_latest_date",
    # Pillar 3
    "has_financials", "financials_evidence_url", "financials_latest_date",
    "has_internal_audit", "internal_audit_evidence_url", "internal_audit_latest_date",
    "has_public_inspection_notice", "public_inspection_evidence_url",
    "public_inspection_window",
    # Pillar 4
    "chair_name", "chair_name_evidence_url",
    "councillors_listed", "councillors_listed_count", "councillors_evidence_url",
    "has_accessibility_statement", "accessibility_evidence_url",
    "has_register_of_interests", "register_evidence_url",
    # Meta
    "clerk_email", "scraped_at", "scrape_status", "scrape_error",
]

CRM_COLUMNS = [
    "council_id", "slug", "council_name",
    "council_type", "county", "region",
    "website_url",
    "primary_contact_email",  # clerk_email if present, else council_email
    "primary_contact_role",   # 'clerk' or 'council'
    "clerk_name", "phone",
    "chair_name",
    "verified_at",
]

# ---------------------------------------------------------------------------
# Polite per-host fetcher
# ---------------------------------------------------------------------------

@dataclass
class FetchResult:
    url: str
    status: int
    final_url: str
    headers: dict
    body: bytes
    text: str
    is_pdf: bool


class HostBudget:
    """One per host. Enforces robots.txt + the 3-second per-host gate."""

    def __init__(self, host: str):
        self.host = host
        self.lock = threading.Lock()
        self.last_request_at: float = 0.0
        self.robots: Optional[robotparser.RobotFileParser] = None
        self.robots_loaded = False
        self.robots_error: Optional[str] = None
        self.disabled = False  # set true if we get hard-banned (HTTP 403/410)

    def wait_then_mark(self):
        with self.lock:
            now = time.monotonic()
            wait = max(0.0, self.last_request_at + PER_HOST_MIN_INTERVAL_S - now)
            if wait > 0:
                time.sleep(wait)
            self.last_request_at = time.monotonic()

    def load_robots(self):
        if self.robots_loaded:
            return
        rp = robotparser.RobotFileParser()
        rp.set_url(f"https://{self.host}/robots.txt")
        try:
            rp.read()
            self.robots = rp
        except Exception as e:
            self.robots_error = str(e)
        self.robots_loaded = True

    def can_fetch(self, url: str) -> bool:
        self.load_robots()
        if self.robots is None:
            return True  # treat as allow if robots unreachable
        try:
            return self.robots.can_fetch(USER_AGENT, url)
        except Exception:
            return True


_host_budgets: Dict[str, HostBudget] = {}
_host_budgets_lock = threading.Lock()


def host_budget_for(url: str) -> HostBudget:
    host = urlparse(url).netloc.lower()
    with _host_budgets_lock:
        b = _host_budgets.get(host)
        if b is None:
            b = HostBudget(host)
            _host_budgets[host] = b
        return b


def fetch(url: str, *, allow_pdf: bool = False) -> Optional[FetchResult]:
    budget = host_budget_for(url)
    if budget.disabled:
        return None
    if not budget.can_fetch(url):
        return None
    budget.wait_then_mark()
    try:
        with requests.get(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/pdf;q=0.9,*/*;q=0.5"},
            timeout=REQUEST_TIMEOUT_S,
            stream=True,
            allow_redirects=True,
        ) as resp:
            ct = (resp.headers.get("content-type") or "").lower()
            is_pdf = "application/pdf" in ct or url.lower().endswith(".pdf")
            if not allow_pdf and is_pdf:
                return None
            if resp.status_code in (403, 410):
                budget.disabled = True
                return None
            limit = MAX_PDF_SNIFF_BYTES if is_pdf else MAX_PAGE_BYTES
            body = b""
            for chunk in resp.iter_content(chunk_size=32_768):
                body += chunk
                if len(body) > limit:
                    break
            text = "" if is_pdf else body.decode(resp.encoding or "utf-8", errors="replace")
            return FetchResult(
                url=url,
                status=resp.status_code,
                final_url=resp.url,
                headers=dict(resp.headers),
                body=body,
                text=text,
                is_pdf=is_pdf,
            )
    except requests.exceptions.RequestException as e:
        return None


# ---------------------------------------------------------------------------
# Extractors
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(
    r"(?:(?:\+44|0044|0)\s?)?(?:\d\s?){9,11}"
)
DATE_FROM_URL_RE = re.compile(r"(20\d{2})[-_/]?(\d{1,2})[-_/]?(\d{1,2})?")

_NAME = r"((?:Mr|Mrs|Ms|Miss|Mx|Dr|Cllr)?\.?\s*[A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2})"
CLERK_NAME_RE_PRE = re.compile(
    rf"(?:Clerk|Town Clerk|Parish Clerk|Proper Officer|RFO|Clerk to the Council)[\s:–\-]*{_NAME}",
    re.I,
)
CLERK_NAME_RE_POST = re.compile(
    rf"{_NAME}[\s,:\-]+(?:Clerk|Town Clerk|Parish Clerk|RFO|Proper Officer|Clerk to the Council)\b",
    re.I,
)
CHAIR_NAME_RE_PRE = re.compile(
    rf"(?:Chair|Chairman|Chairperson|Mayor)[\s:–\-]*{_NAME}",
    re.I,
)
CHAIR_NAME_RE_POST = re.compile(
    rf"{_NAME}[\s,:\-]+(?:Chair|Chairman|Chairperson|Mayor)\b",
    re.I,
)


def find_clerk_name(text: str) -> Optional[str]:
    for r in (CLERK_NAME_RE_PRE, CLERK_NAME_RE_POST):
        m = r.search(text)
        if m:
            return m.group(1).strip()
    return None


def find_chair_name(text: str) -> Optional[str]:
    for r in (CHAIR_NAME_RE_PRE, CHAIR_NAME_RE_POST):
        m = r.search(text)
        if m:
            return m.group(1).strip()
    return None


def text_of(soup: BeautifulSoup) -> str:
    for s in soup(("script", "style", "nav", "footer", "noscript")):
        s.decompose()
    return soup.get_text(" ", strip=True)


def find_emails(text: str) -> List[str]:
    seen = set()
    out = []
    for m in EMAIL_RE.findall(text):
        e = m.lower()
        if e in seen:
            continue
        seen.add(e)
        # filter out common false positives
        if any(e.endswith(suf) for suf in (".png", ".jpg", ".gif", ".svg")):
            continue
        out.append(e)
    return out


def find_phone(text: str) -> Optional[str]:
    for m in PHONE_RE.finditer(text):
        digits = re.sub(r"\D", "", m.group(0))
        if 10 <= len(digits) <= 13:
            return m.group(0).strip()
    return None


def classify_email(email: str, council_name: str) -> str:
    """Return 'clerk' if the email looks like a clerk address, 'council' otherwise."""
    local = email.split("@", 1)[0].lower()
    if any(w in local for w in ("clerk", "rfo", "townclerk", "parishclerk")):
        return "clerk"
    return "council"


KEYWORDS = {
    "agendas": ["agenda", "agendas", "meeting papers"],
    "minutes": ["minute", "minutes"],
    "financials": ["agar", "annual return", "annual governance accountability", "accounts", "financial statement", "finance", "precept"],
    "internal_audit": ["internal audit", "audit report", "annual governance statement", "governance statement"],
    "public_inspection": ["public inspection", "exercise of public rights", "notice of public rights", "period of inspection", "right to inspect", "inspection of accounts"],
    "register": ["register of interest", "members' interests", "members interests", "declaration of interest", "register of members"],
    "councillors": ["councillor", "councillors", "your council", "who's who", "members of the council", "council members"],
    "accessibility": ["accessibility statement", "accessibility"],
    "contact": ["contact us", "contact", "get in touch"],
}


def classify_link(href: str, text: str) -> Optional[str]:
    """Bucket a link into one of the keyword categories (or None)."""
    h = (href or "").lower()
    t = (text or "").lower()
    for cat, kws in KEYWORDS.items():
        for k in kws:
            if k in h or k in t:
                return cat
    return None


def harvest_links(soup: BeautifulSoup, base_url: str) -> Dict[str, List[Tuple[str, str]]]:
    """Return {category: [(href, anchor_text), ...]}."""
    buckets: Dict[str, List[Tuple[str, str]]] = defaultdict(list)
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("javascript:") or href.startswith("mailto:") or href.startswith("tel:"):
            continue
        text = a.get_text(" ", strip=True)
        cat = classify_link(href, text)
        if cat is None:
            continue
        url = urljoin(base_url, href)
        if not url.startswith("http"):
            continue
        buckets[cat].append((url, text))
    return buckets


def date_from_url_or_text(url: str, text: str) -> Optional[str]:
    for s in (url, text):
        m = DATE_FROM_URL_RE.search(s)
        if m:
            y = m.group(1)
            mo = m.group(2) or "01"
            d = m.group(3) or "01"
            try:
                int(y); int(mo); int(d)
                return f"{y}-{int(mo):02d}-{int(d):02d}"
            except ValueError:
                continue
    return None


# ---------------------------------------------------------------------------
# Per-council scan
# ---------------------------------------------------------------------------

@dataclass
class IndicatorOutcome:
    found: bool = False
    evidence_url: Optional[str] = None
    document_date: Optional[str] = None
    extra: Optional[str] = None


@dataclass
class ScanResult:
    council_id: str
    slug: str
    name: str
    website_url: str
    website_resolves: bool = False
    is_https: bool = False
    council_email: Optional[str] = None
    council_email_evidence_url: Optional[str] = None
    council_phone: Optional[str] = None
    council_phone_evidence_url: Optional[str] = None
    clerk_name: Optional[str] = None
    clerk_name_evidence_url: Optional[str] = None
    clerk_email: Optional[str] = None
    chair_name: Optional[str] = None
    chair_name_evidence_url: Optional[str] = None
    has_agendas: bool = False
    agendas_evidence_url: Optional[str] = None
    agendas_latest_date: Optional[str] = None
    has_minutes: bool = False
    minutes_evidence_url: Optional[str] = None
    minutes_latest_date: Optional[str] = None
    has_financials: bool = False
    financials_evidence_url: Optional[str] = None
    financials_latest_date: Optional[str] = None
    has_internal_audit: Optional[bool] = None
    internal_audit_evidence_url: Optional[str] = None
    internal_audit_latest_date: Optional[str] = None
    has_public_inspection_notice: Optional[bool] = None
    public_inspection_evidence_url: Optional[str] = None
    public_inspection_window: Optional[str] = None
    has_accessibility_statement: bool = False
    accessibility_evidence_url: Optional[str] = None
    councillors_listed: bool = False
    councillors_listed_count: int = 0
    councillors_evidence_url: Optional[str] = None
    has_register_of_interests: Optional[bool] = None
    register_evidence_url: Optional[str] = None
    scraped_at: str = ""
    scrape_status: str = "ok"
    scrape_error: str = ""

    def to_row(self) -> dict:
        d = asdict(self)
        # Boolean fields render as 'true'/'false' or '' (for tri-state Nones).
        for k, v in list(d.items()):
            if isinstance(v, bool):
                d[k] = "true" if v else "false"
            elif v is None:
                d[k] = ""
        return d


def scan_council(council: dict) -> ScanResult:
    name = council.get("name", "") or ""
    res = ScanResult(
        council_id=council.get("council_id", ""),
        slug=council.get("slug", ""),
        name=name,
        website_url=council.get("website_url", "") or "",
        scraped_at=datetime.now(timezone.utc).isoformat(),
    )
    url = res.website_url.strip()
    if not url:
        res.scrape_status = "no-url"
        return res
    if not url.startswith("http"):
        url = "https://" + url
        res.website_url = url
    res.is_https = url.lower().startswith("https://")

    homepage = fetch(url)
    if homepage is None or homepage.is_pdf or homepage.status >= 400:
        res.scrape_status = "homepage-fetch-failed"
        return res

    res.website_resolves = True
    soup = BeautifulSoup(homepage.text, "html.parser")
    body_text = text_of(soup)

    # ---- Pillar 1: contacts on the homepage
    emails = find_emails(homepage.text)
    if emails:
        clerk_emails = [e for e in emails if classify_email(e, name) == "clerk"]
        if clerk_emails:
            res.clerk_email = clerk_emails[0]
        # Council email = first non-clerk; else fall back to clerk address.
        non_clerk = [e for e in emails if classify_email(e, name) == "council"]
        res.council_email = (non_clerk[0] if non_clerk else (clerk_emails[0] if clerk_emails else None))
        if res.council_email:
            res.council_email_evidence_url = homepage.final_url
    phone = find_phone(body_text)
    if phone:
        res.council_phone = phone
        res.council_phone_evidence_url = homepage.final_url

    cm = find_clerk_name(body_text)
    if cm:
        res.clerk_name = cm
        res.clerk_name_evidence_url = homepage.final_url
    chm = find_chair_name(body_text)
    if chm:
        res.chair_name = chm
        res.chair_name_evidence_url = homepage.final_url

    # ---- Discover relevant sub-pages
    buckets = harvest_links(soup, homepage.final_url)
    # Always crawl /contact first if found — biggest single boost to email coverage
    visited: Set[str] = {homepage.final_url}
    sub_pages: List[Tuple[str, str, FetchResult]] = []
    if buckets.get("contact"):
        href, text = buckets["contact"][0]
        if href not in visited:
            r = fetch(href, allow_pdf=False)
            visited.add(href)
            if r and not r.is_pdf:
                # Use this page for email/phone/clerk if homepage had nothing
                contact_soup = BeautifulSoup(r.text, "html.parser")
                contact_text = text_of(contact_soup)
                if not res.council_email:
                    es = find_emails(r.text)
                    if es:
                        clerks = [e for e in es if classify_email(e, name) == "clerk"]
                        if clerks:
                            res.clerk_email = res.clerk_email or clerks[0]
                        non_clerk = [e for e in es if classify_email(e, name) == "council"]
                        res.council_email = non_clerk[0] if non_clerk else (clerks[0] if clerks else None)
                        if res.council_email:
                            res.council_email_evidence_url = r.final_url
                if not res.council_phone:
                    p = find_phone(contact_text)
                    if p:
                        res.council_phone = p
                        res.council_phone_evidence_url = r.final_url
                if not res.clerk_name:
                    cm2 = find_clerk_name(contact_text)
                    if cm2:
                        res.clerk_name = cm2
                        res.clerk_name_evidence_url = r.final_url
                if not res.chair_name:
                    ch2 = find_chair_name(contact_text)
                    if ch2:
                        res.chair_name = ch2
                        res.chair_name_evidence_url = r.final_url
                # And also harvest links from the contact page (some sites have governance links here)
                more = harvest_links(contact_soup, r.final_url)
                for k, v in more.items():
                    buckets[k].extend(v)
    for cat in ("agendas", "minutes", "financials", "internal_audit",
                "public_inspection", "register", "councillors", "accessibility"):
        for href, text in buckets.get(cat, [])[:3]:  # max 3 per category
            if href in visited:
                continue
            r = fetch(href, allow_pdf=True)
            visited.add(href)
            if r is None:
                continue
            sub_pages.append((cat, text, r))
            if len(sub_pages) >= MAX_FOLLOW_PAGES * 4:
                break

    def latest_date_from(group):
        best = None
        for cat_, text_, r_ in group:
            d = date_from_url_or_text(r_.final_url, text_)
            if d and (best is None or d > best):
                best = d
        return best

    by_cat: Dict[str, List] = defaultdict(list)
    for cat, text, r in sub_pages:
        by_cat[cat].append((cat, text, r))

    # Pillar 2 — agendas / minutes
    if by_cat["agendas"]:
        res.has_agendas = True
        res.agendas_evidence_url = by_cat["agendas"][0][2].final_url
        res.agendas_latest_date = latest_date_from(by_cat["agendas"])
    if by_cat["minutes"]:
        res.has_minutes = True
        res.minutes_evidence_url = by_cat["minutes"][0][2].final_url
        res.minutes_latest_date = latest_date_from(by_cat["minutes"])

    # Pillar 3 — AGAR / Internal Audit / Public Inspection
    if by_cat["financials"]:
        res.has_financials = True
        res.financials_evidence_url = by_cat["financials"][0][2].final_url
        res.financials_latest_date = latest_date_from(by_cat["financials"])
    if by_cat["internal_audit"]:
        res.has_internal_audit = True
        res.internal_audit_evidence_url = by_cat["internal_audit"][0][2].final_url
        res.internal_audit_latest_date = latest_date_from(by_cat["internal_audit"])
    else:
        # Tri-state: explicit "no" if we successfully crawled the site but
        # found no internal-audit-related link in either homepage or finance pages.
        res.has_internal_audit = False
    if by_cat["public_inspection"]:
        res.has_public_inspection_notice = True
        res.public_inspection_evidence_url = by_cat["public_inspection"][0][2].final_url
    else:
        res.has_public_inspection_notice = False

    # Pillar 4 — councillors / accessibility / register
    if by_cat["councillors"]:
        cllr_url = by_cat["councillors"][0][2]
        res.councillors_listed = True
        res.councillors_evidence_url = cllr_url.final_url
        cllr_soup = BeautifulSoup(cllr_url.text, "html.parser")
        cllr_text = text_of(cllr_soup)
        # Crude proper-noun count (two capitalised words next to each other)
        names = re.findall(r"\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b", cllr_text)
        res.councillors_listed_count = len(set(names))
        # Try to find chair on the councillors page if not already
        if not res.chair_name:
            ch2 = CHAIR_NAME_RE.search(cllr_text)
            if ch2:
                res.chair_name = ch2.group(1).strip()
                res.chair_name_evidence_url = cllr_url.final_url

    if by_cat["accessibility"]:
        a_page = by_cat["accessibility"][0][2]
        a_text = text_of(BeautifulSoup(a_page.text, "html.parser")) if not a_page.is_pdf else ""
        if any(k in a_text.lower() for k in ("wcag", "accessibility regulations", "2018")):
            res.has_accessibility_statement = True
            res.accessibility_evidence_url = a_page.final_url

    if by_cat["register"]:
        res.has_register_of_interests = True
        res.register_evidence_url = by_cat["register"][0][2].final_url
    else:
        res.has_register_of_interests = False

    return res


# ---------------------------------------------------------------------------
# Concurrent runner
# ---------------------------------------------------------------------------

def load_processed_slugs(path: Path) -> Set[str]:
    if not path.exists():
        return set()
    with path.open("r", encoding="utf-8", newline="") as f:
        return {row.get("slug", "") for row in csv.DictReader(f) if row.get("slug")}


def run(input_csv: Path, output_csv: Path, crm_csv: Path, *, workers: int = 80, limit: Optional[int] = None, log_every: int = 25):
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    crm_csv.parent.mkdir(parents=True, exist_ok=True)

    processed = load_processed_slugs(output_csv)
    pending: List[dict] = []
    council_meta: Dict[str, dict] = {}
    with input_csv.open("r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            slug = row.get("slug", "")
            if not slug or slug in processed:
                continue
            pending.append(row)
            council_meta[slug] = row
            if limit and len(pending) >= limit:
                break

    write_header_main = not output_csv.exists()
    write_header_crm = not crm_csv.exists()
    main_lock = threading.Lock()
    crm_lock = threading.Lock()
    completed = 0

    main_f = output_csv.open("a", encoding="utf-8", newline="")
    main_w = csv.DictWriter(main_f, fieldnames=OUTPUT_COLUMNS)
    if write_header_main:
        main_w.writeheader()
        main_f.flush()

    crm_f = crm_csv.open("a", encoding="utf-8", newline="")
    crm_w = csv.DictWriter(crm_f, fieldnames=CRM_COLUMNS)
    if write_header_crm:
        crm_w.writeheader()
        crm_f.flush()

    print(f"VDTI Scanner v1 — {len(pending)} councils pending, {workers} workers")
    started = time.monotonic()
    try:
        with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="vdti") as pool:
            futures = {pool.submit(scan_council, c): c for c in pending}
            for fut in as_completed(futures):
                council = futures[fut]
                slug = council.get("slug", "")
                try:
                    res = fut.result()
                except Exception as e:
                    res = ScanResult(
                        council_id=council.get("council_id", ""),
                        slug=slug,
                        name=council.get("name", ""),
                        website_url=council.get("website_url", "") or "",
                        scraped_at=datetime.now(timezone.utc).isoformat(),
                        scrape_status="error",
                        scrape_error=repr(e)[:300],
                    )
                with main_lock:
                    main_w.writerow(res.to_row())
                    main_f.flush()
                # Build CRM row
                primary_email = res.clerk_email or res.council_email
                primary_role = "clerk" if res.clerk_email else ("council" if res.council_email else "")
                if primary_email:
                    crm_row = {
                        "council_id": res.council_id,
                        "slug": res.slug,
                        "council_name": res.name,
                        "council_type": council.get("type", ""),
                        "county": council.get("county", ""),
                        "region": council.get("region", ""),
                        "website_url": res.website_url,
                        "primary_contact_email": primary_email,
                        "primary_contact_role": primary_role,
                        "clerk_name": res.clerk_name or "",
                        "phone": res.council_phone or "",
                        "chair_name": res.chair_name or "",
                        "verified_at": res.scraped_at,
                    }
                    with crm_lock:
                        crm_w.writerow(crm_row)
                        crm_f.flush()
                completed += 1
                if completed % log_every == 0:
                    rate = completed / (time.monotonic() - started + 0.001)
                    print(f"  ... {completed}/{len(pending)} done ({rate:.1f}/s)")
    finally:
        main_f.close()
        crm_f.close()
    print(f"VDTI Scanner v1 — done. {completed} councils written to {output_csv}.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv=None):
    p = argparse.ArgumentParser(description="VDTI Scanner v1 — concurrent VDTI v4.1 evidence scraper")
    p.add_argument("--input", default="scraper/data/councils_input.csv", help="Input CSV (council_id, slug, name, website_url)")
    p.add_argument("--output", default="scraper/data/scrape_results_v41.csv", help="Output CSV (full indicator results)")
    p.add_argument("--crm", default="scraper/data/crm_contacts.csv", help="Output CSV (CRM-ready contact rows)")
    p.add_argument("--workers", type=int, default=80, help="Concurrent worker count (default 80)")
    p.add_argument("--limit", type=int, default=None, help="Cap on councils to process (per run)")
    p.add_argument("--verbose", action="store_true")
    args = p.parse_args(argv)

    if args.verbose:
        logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    run(
        input_csv=Path(args.input),
        output_csv=Path(args.output),
        crm_csv=Path(args.crm),
        workers=args.workers,
        limit=args.limit,
    )


if __name__ == "__main__":
    main()
