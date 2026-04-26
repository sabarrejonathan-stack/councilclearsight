"""publish_v2/scrape_lite.py - self-contained council homepage scraper.

Thread-safe. Polite. Robots-aware. Emits the same column layout as the
v2 enriched CSV. See module docstring at the bottom of this file's
sibling history if you need the long-form description; this rewrite
exists because OneDrive corrupted scraper.scraper_v2.extractors mid-file.
"""
from __future__ import annotations

import re
import socket
import ssl
import threading
import time
import urllib.parse
import urllib.robotparser
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

UA = "CouncilClearSight/4.0 (+https://councilclearsight.org.uk/about/bot - info@councilclearsight.org.uk)"
TIMEOUT = 12
MIN_HOST_GAP = 3.0
GENERIC_CLERK_LOCAL_PARTS = (
    "clerk", "info", "office", "admin", "enquiries", "contact",
    "council", "parishclerk", "townclerk",
)

INDICATOR_PATTERNS = {
    "agendas": [r"\bagenda(s)?\b"],
    "minutes": [r"\bminutes?\b", r"\bmeeting minutes\b"],
    "agar": [r"\bagar\b", r"\bannual governance.*accountability\b",
             r"\bannual return\b",
             r"\bsection \d.*(annual|return|agar)\b"],
    "accessibility_statement": [r"\baccessibility statement\b",
                                r"\baccessibility\b"],
    "register_of_interests": [r"\bregister of interests?\b",
                              r"\bdisclosable pecuniary interests?\b",
                              r"\bdpi\b"],
    "expenditure_over_100": [
        r"\bexpenditure (over|above|exceeding) (.|gbp)?\s*(100|250|500)\b",
        r"\b(.|gbp)\s*100\+? (expenditure|payments?)\b",
        r"\b(spend|expenditure) report\b",
    ],
    "end_of_year_accounts": [r"\bend.of.year accounts?\b",
                             r"\bannual accounts?\b",
                             r"\bstatement of accounts?\b"],
    "annual_governance_statement": [r"\bannual governance statement\b",
                                    r"\bsection 1\b"],
    "internal_audit_report": [r"\binternal audit\b", r"\bsection 4\b"],
    "councillor_responsibilities": [r"\bcouncillor responsibilit(y|ies)\b",
                                    r"\brole(s)? of councillors?\b"],
    "asset_register": [r"\basset register\b", r"\blist of assets?\b",
                       r"\bfixed assets\b"],
    "dates_of_meetings": [r"\bdates? of meetings?\b",
                          r"\bmeeting dates?\b",
                          r"\bschedule of meetings?\b"],
    "standing_orders": [r"\bstanding orders?\b"],
    "financial_regulations": [r"\bfinancial regulations?\b"],
    "risk_assessment": [r"\brisk assessment\b", r"\brisk register\b"],
    "code_of_conduct": [r"\bcode of conduct\b"],
    "complaints_procedure": [r"\bcomplaints? procedure\b",
                             r"\bcomplaints? policy\b"],
    "gdpr_policy": [r"\bgdpr\b", r"\bdata protection policy\b",
                    r"\bprivacy notice\b"],
    "foi_publication_scheme": [r"\bfoi publication scheme\b",
                               r"\bfreedom of information\b",
                               r"\bpublication scheme\b"],
    "health_safety_policy": [r"\bhealth\s*&?\s*safety\b"],
    "equality_policy": [r"\bequality (and|&) diversity\b",
                        r"\bequalities? policy\b"],
    "co_option_policy": [r"\bco.option (policy|procedure)\b"],
    "training_policy": [r"\btraining policy\b"],
    "grants_policy": [r"\bgrants? policy\b", r"\bgrants? application\b"],
    "consultation_page": [r"\bconsultation\b"],
    "newsletter": [r"\bnewsletter\b"],
    "communications_policy": [r"\bcommunications? policy\b"],
    "annual_report": [r"\bannual report\b", r"\bchairmans? report\b"],
    "forward_meeting_calendar": [r"\bcalendar\b", r"\bupcoming meetings?\b"],
}
INDICATOR_KEYS = list(INDICATOR_PATTERNS.keys())


class PoliteGate:
    """Per-host minimum gap. Thread-safe."""

    def __init__(self, gap: float = MIN_HOST_GAP):
        self.gap = gap
        self.last: dict[str, float] = {}
        self._lock = threading.Lock()

    def wait(self, url: str) -> None:
        host = (urllib.parse.urlparse(url).hostname or "").lower()
        if not host:
            return
        now = time.time()
        with self._lock:
            last = self.last.get(host, 0.0)
            wait_for = max(0.0, self.gap - (now - last))
            # Reserve our slot before sleeping
            self.last[host] = now + wait_for
        if wait_for > 0:
            time.sleep(wait_for)


def robots_allows(url: str, session: requests.Session) -> bool:
    parsed = urllib.parse.urlparse(url)
    rurl = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        r = session.get(rurl, timeout=TIMEOUT)
        if r.status_code != 200:
            return True
        rp = urllib.robotparser.RobotFileParser()
        rp.parse(r.text.splitlines())
        return rp.can_fetch(UA, url)
    except requests.RequestException:
        return True


def _domain_resolves(host: str) -> bool:
    if not host:
        return False
    try:
        socket.gethostbyname(host)
        return True
    except (OSError, UnicodeError):
        return False


def _ssl_valid(host: str) -> bool | None:
    if not host:
        return None
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((host, 443), timeout=TIMEOUT) as s:
            with ctx.wrap_socket(s, server_hostname=host) as ss:
                ss.do_handshake()
                return True
    except (ssl.SSLError, socket.error, OSError):
        return False


def validate_url(url: str, fast: bool = False) -> dict:
    parsed = urllib.parse.urlparse(url)
    host = (parsed.hostname or "").lower()
    is_https = parsed.scheme == "https"
    is_gov_uk = host.endswith(".gov.uk")
    resolves = _domain_resolves(host)
    if fast:
        ssl_ok = "" if not is_https else 1
    else:
        ssl_ok = _ssl_valid(host) if is_https and resolves else None
    return {
        "website_scheme": parsed.scheme,
        "website_is_https": int(is_https),
        "website_is_gov_uk": int(is_gov_uk),
        "website_domain_resolves": int(resolves),
        "website_ssl_valid": "" if ssl_ok is None else int(ssl_ok)
        if ssl_ok is not None and ssl_ok != "" else "",
    }


EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def validate_email(email: str) -> dict:
    e = (email or "").strip()
    fmt_ok = bool(EMAIL_RE.match(e))
    domain = e.split("@", 1)[1].lower() if fmt_ok else ""
    domain_ok = _domain_resolves(domain) if domain else False
    is_gov = domain.endswith(".gov.uk") if domain else False
    local = e.split("@", 1)[0].lower() if fmt_ok else ""
    is_generic = local in GENERIC_CLERK_LOCAL_PARTS
    return {"raw": e, "format_valid": int(fmt_ok), "domain": domain,
            "domain_resolves": int(domain_ok), "is_gov_uk": int(is_gov),
            "is_generic_clerk": int(is_generic)}


PHONE_RE = re.compile(r"[\d \-+()]{7,}")


def validate_phone(raw: str) -> dict:
    if not raw:
        return {"raw": "", "format_valid": 0, "normalised": "", "is_mobile": 0}
    m = PHONE_RE.search(raw)
    if not m:
        return {"raw": raw, "format_valid": 0, "normalised": "", "is_mobile": 0}
    digits = re.sub(r"[^\d+]", "", m.group(0))
    if digits.startswith("0"):
        digits = "+44" + digits[1:]
    is_mobile = int(digits.startswith("+447"))
    return {"raw": raw, "format_valid": int(len(digits) >= 10),
            "normalised": digits, "is_mobile": is_mobile}


def file_format_of(href: str) -> str:
    h = href.lower().split("?", 1)[0]
    for ext in ("pdf", "docx", "doc", "xls", "xlsx", "html", "htm"):
        if h.endswith("." + ext):
            return ext
    return "html"


def date_from_filename(href: str) -> str:
    m = re.search(r"(20\d{2})-(\d{2})-(\d{2})", href)
    if m:
        return m.group(0)
    m = re.search(r"\b(20\d{2})\b", href)
    return m.group(1) if m else ""


def classify_links(soup, base_url):
    found = {k: [] for k in INDICATOR_KEYS}
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        abs_href = urllib.parse.urljoin(base_url, href)
        text = " ".join((a.get_text() or "").split()).lower()
        haystack = (text + " " + href).lower()
        fmt = file_format_of(abs_href)
        inferred = date_from_filename(abs_href)
        for key, patterns in INDICATOR_PATTERNS.items():
            if any(re.search(p, haystack) for p in patterns):
                found[key].append({
                    "href": abs_href, "text": text,
                    "file_format": fmt, "inferred_date": inferred,
                })
                break
    return found


def head_doc_meta(url, session):
    try:
        r = session.head(url, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code in (405, 501):
            r = session.get(url, timeout=TIMEOUT,
                            headers={"Range": "bytes=0-1023"},
                            allow_redirects=True, stream=True)
            r.close()
        return {"last_modified": r.headers.get("Last-Modified", ""),
                "http_status": r.status_code}
    except requests.RequestException:
        return {"last_modified": "", "http_status": 0}


def parse_http_date(s):
    if not s:
        return None
    for fmt in ("%a, %d %b %Y %H:%M:%S GMT",
                "%a, %d %b %Y %H:%M:%S %Z",
                "%A, %d-%b-%y %H:%M:%S GMT"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def make_session():
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.8"})
    return s


def scrape_council(slug, name, url, council_id="", contact_email="",
                   clerk_email="", phone="", gate=None, session=None,
                   fetch_doc_metadata=True, fast=False):
    """Scrape one council. fast=True skips SSL probe and per-PDF HEAD."""
    gate = gate or PoliteGate()
    session = session or make_session()
    timeout = 6 if fast else TIMEOUT

    row = {
        "council_id": council_id, "slug": slug, "name": name,
        "website_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "scrape_status": "", "error": "",
    }
    for key in INDICATOR_KEYS:
        row[f"{key}_found"] = 0
        row[f"{key}_evidence_url"] = ""
        row[f"{key}_last_modified"] = ""
        row[f"{key}_inferred_date"] = ""
        row[f"{key}_file_format"] = ""
        row[f"{key}_http_status"] = ""
        row[f"{key}_document_count"] = 0
    for sk in ("facebook", "twitter", "instagram", "youtube", "linkedin", "nextdoor"):
        row[f"social_{sk}_url"] = ""

    e_council = validate_email(contact_email)
    e_clerk = validate_email(clerk_email)
    p = validate_phone(phone)
    row.update({
        "council_email_raw": e_council["raw"],
        "council_email_format_valid": e_council["format_valid"],
        "council_email_domain": e_council["domain"],
        "council_email_domain_resolves": e_council["domain_resolves"],
        "council_email_is_gov_uk": e_council["is_gov_uk"],
        "council_email_is_generic_clerk": e_council["is_generic_clerk"],
        "clerk_email_raw": e_clerk["raw"],
        "clerk_email_format_valid": e_clerk["format_valid"],
        "clerk_email_domain": e_clerk["domain"],
        "clerk_email_domain_resolves": e_clerk["domain_resolves"],
        "clerk_email_is_gov_uk": e_clerk["is_gov_uk"],
        "clerk_email_is_generic_clerk": e_clerk["is_generic_clerk"],
        "phone_raw": p["raw"], "phone_format_valid": p["format_valid"],
        "phone_normalised": p["normalised"], "phone_is_mobile": p["is_mobile"],
    })

    row.update(validate_url(url, fast=fast))

    if not url or not url.lower().startswith(("http://", "https://")):
        row["scrape_status"] = "no-url"
        return row

    if not robots_allows(url, session):
        row["scrape_status"] = "robots-disallow"
        return row

    gate.wait(url)
    try:
        r = session.get(url, timeout=timeout, allow_redirects=True)
    except requests.RequestException as e:
        row["scrape_status"] = "unreachable"
        row["error"] = f"{type(e).__name__}: {str(e)[:200]}"
        return row

    if r.status_code != 200:
        row["scrape_status"] = f"unreachable ({r.status_code})"
        return row
    if "html" not in (r.headers.get("Content-Type", "").lower()):
        row["scrape_status"] = "non-html"
        return row

    soup = BeautifulSoup(r.text, "html.parser")
    found = classify_links(soup, r.url)

    found_count = 0
    total_links = 0
    for key, items in found.items():
        if not items:
            continue
        found_count += 1
        first = items[0]
        row[f"{key}_found"] = 1
        row[f"{key}_evidence_url"] = first["href"]
        row[f"{key}_inferred_date"] = first["inferred_date"]
        row[f"{key}_file_format"] = first["file_format"]
        row[f"{key}_document_count"] = len(items)
        total_links += len(items)
        # In fast mode, skip the per-PDF HEAD - inferred_date is good enough
        if (not fast and fetch_doc_metadata
                and first["file_format"] in ("pdf", "docx", "xlsx")):
            gate.wait(first["href"])
            meta = head_doc_meta(first["href"], session)
            row[f"{key}_last_modified"] = meta["last_modified"]
            row[f"{key}_http_status"] = meta["http_status"]

    row["indicators_assessed_count"] = len(INDICATOR_KEYS)
    row["indicators_evidence_found_count"] = found_count
    row["evidence_links_total_count"] = total_links

    fresh = stale = 0
    for key in INDICATOR_KEYS:
        lm = row.get(f"{key}_last_modified")
        dt = parse_http_date(lm) if lm else None
        if dt:
            age = (datetime.now(timezone.utc) - dt).days
            if age <= 90:
                fresh += 1
            elif age > 365:
                stale += 1
    row["fresh_documents_count"] = fresh
    row["stale_documents_count"] = stale
    row["data_completeness_pct"] = round(found_count / len(INDICATOR_KEYS) * 100, 1)

    for k in ("legacy_district", "legacy_school_count", "legacy_school_names",
              "legacy_school_websites", "legacy_school_head_teachers",
              "legacy_has_website", "legacy_has_agendas", "legacy_has_minutes",
              "legacy_has_financials", "legacy_has_contact_details",
              "legacy_has_accessibility_statement",
              "movement_minutes", "movement_agendas",
              "movement_financials", "movement_accessibility_statement"):
        row[k] = ""

    row["scrape_status"] = "ok"
    return row


if __name__ == "__main__":
    import json, sys
    if len(sys.argv) < 2:
        print("Usage: python scrape_lite.py <url> [--fast]", file=sys.stderr)
        sys.exit(1)
    fast = "--fast" in sys.argv
    res = scrape_council(slug="t", name="Test", url=sys.argv[1], fast=fast)
    print(json.dumps({k: v for k, v in res.items() if v not in (0, "", None)},
                     indent=2, ensure_ascii=False))
