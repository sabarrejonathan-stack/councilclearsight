"""publish_v2/discover.py - URL discovery for councils with no website on file.

Strategy stack (tried in order; first validated candidate wins):

  1. Manual seed CSV       - operator-provided override
  2. Pattern guess         - try common URL shapes built from the slug
  3. Web search            - Mojeek (primary) -> Bing (fallback);
                             DuckDuckGo blocks scrapers so we don't use it.

A candidate URL is validated by:
  - HTTP fetch within 12s
  - Returns 200 OK with HTML content-type
  - Body contains at least 2 of:
      "parish", "town", "council", "clerk", "agenda", "minutes",
      "accessibility statement", "annual return", "AGAR"
  - Or domain ends .gov.uk / .org.uk and at least 1 keyword matches.

Sync, polite (1s between candidate fetches), never raises.
"""
from __future__ import annotations

import re
import time
import urllib.parse
from dataclasses import dataclass
from pathlib import Path

import requests
from bs4 import BeautifulSoup

UA = "CouncilClearSight/4.0 (+https://councilclearsight.org.uk/about/bot - info@councilclearsight.org.uk)"
TIMEOUT = 12
COUNCIL_KEYWORDS = [
    "parish", "town", "community council", "council", "clerk",
    "agenda", "minutes", "councillor", "accessibility statement",
    "annual return", "agar", "precept",
]
TRUSTED_TLD_SUFFIXES = (".gov.uk", ".org.uk")


@dataclass
class DiscoveryResult:
    url: str
    method: str   # "pattern" | "web_search" | "manual_seed"
    confidence: float


# ----------------------------------------------------------------------
# Pattern-guess candidates
# ----------------------------------------------------------------------
def slug_basename(slug: str) -> str:
    for suf in ("-parish-council", "-town-council", "-community-council",
                "-parish-meeting", "-city-council", "-parish"):
        if slug.endswith(suf):
            return slug[: -len(suf)]
    return slug


def pattern_candidates(slug: str) -> list[str]:
    base = slug_basename(slug)
    return [
        f"https://{base}-pc.gov.uk",
        f"https://www.{base}-pc.gov.uk",
        f"https://{base}.gov.uk",
        f"https://www.{base}.gov.uk",
        f"https://{base}pc.gov.uk",
        f"https://www.{base}pc.gov.uk",
        f"https://{base}-parish-council.gov.uk",
        f"https://www.{base}-parish-council.gov.uk",
        f"https://{base}parishcouncil.gov.uk",
        f"https://www.{base}parishcouncil.gov.uk",
        f"https://{base}.org.uk",
        f"https://www.{base}.org.uk",
        f"https://{base}pc.org.uk",
        f"https://www.{base}pc.org.uk",
        f"https://{base}-parish.org.uk",
        f"https://www.{base}-parish.org.uk",
        f"https://{base}parishcouncil.co.uk",
        f"https://www.{base}parishcouncil.co.uk",
        f"https://{slug}.gov.uk",
        f"https://www.{slug}.gov.uk",
        f"https://{slug}.org.uk",
    ]


# ----------------------------------------------------------------------
# Validation
# ----------------------------------------------------------------------
def looks_like_council(url: str, body: str) -> tuple[bool, int]:
    lower = body.lower()
    hits = sum(1 for kw in COUNCIL_KEYWORDS if kw in lower)
    parsed = urllib.parse.urlparse(url)
    host = parsed.hostname or ""
    trusted_tld = any(host.endswith(s) for s in TRUSTED_TLD_SUFFIXES)
    return (hits >= 2 or (trusted_tld and hits >= 1)), hits


def validate(url: str, session: requests.Session,
             name: str = "") -> DiscoveryResult | None:
    try:
        r = session.get(url, timeout=TIMEOUT, allow_redirects=True)
    except (requests.RequestException, ValueError):
        return None
    if r.status_code != 200:
        return None
    ctype = (r.headers.get("Content-Type") or "").lower()
    if "html" not in ctype:
        return None
    body = r.text[:200_000]
    is_council, hits = looks_like_council(r.url, body)
    if not is_council:
        return None
    name_match = bool(name and name.lower().split()[0] in body.lower())
    confidence = 0.5 + 0.05 * hits + (0.15 if name_match else 0)
    return DiscoveryResult(url=r.url, method="pattern",
                           confidence=min(1.0, confidence))


# ----------------------------------------------------------------------
# Web-search backends (no API key required)
# ----------------------------------------------------------------------
def mojeek_search(query: str, session: requests.Session, top: int = 8) -> list[str]:
    try:
        r = session.get("https://www.mojeek.com/search",
                        params={"q": query}, timeout=TIMEOUT)
    except requests.RequestException:
        return []
    if r.status_code != 200:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    urls: list[str] = []
    seen: set[str] = set()
    skip = ("mojeek.com", "facebook.com", "twitter.com", "linkedin.com",
            "youtube.com", "wikipedia.org", "yell.com", "/news/",
            "instagram.com", "tiktok.com")
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if not href.startswith("http"):
            continue
        if any(x in href for x in skip):
            continue
        if href in seen:
            continue
        seen.add(href)
        urls.append(href)
        if len(urls) >= top:
            break
    return urls


def bing_search(query: str, session: requests.Session, top: int = 8) -> list[str]:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                              "AppleWebKit/537.36 (KHTML, like Gecko) "
                              "Chrome/120.0 Safari/537.36"}
    try:
        r = session.get("https://www.bing.com/search",
                        params={"q": query}, timeout=TIMEOUT, headers=headers)
    except requests.RequestException:
        return []
    if r.status_code != 200:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    urls: list[str] = []
    seen: set[str] = set()
    skip = ("bing.com", "microsoft.com", "/aclick", "go.microsoft",
            "facebook.com", "twitter.com", "youtube.com", "wikipedia.org")
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if not href.startswith("http"):
            continue
        if any(x in href for x in skip):
            continue
        if href in seen:
            continue
        seen.add(href)
        urls.append(href)
        if len(urls) >= top:
            break
    return urls


def web_search(query: str, session: requests.Session, top: int = 8) -> list[str]:
    urls = mojeek_search(query, session, top)
    if urls:
        return urls
    return bing_search(query, session, top)


# ----------------------------------------------------------------------
# Top-level discover()
# ----------------------------------------------------------------------
def discover(slug: str, name: str, session: requests.Session,
             manual_seeds: dict | None = None,
             pause_between: float = 1.0) -> DiscoveryResult | None:
    if manual_seeds and slug in manual_seeds:
        url = manual_seeds[slug]
        res = validate(url, session, name)
        if res:
            return DiscoveryResult(url=res.url, method="manual_seed",
                                   confidence=1.0)

    for cand in pattern_candidates(slug):
        time.sleep(pause_between)
        res = validate(cand, session, name)
        if res:
            return res

    queries = [
        f'"{name}" parish council official website',
        f'{name} parish council clerk agenda minutes',
        f'{name} town council UK',
    ]
    seen_urls: set[str] = set()
    for q in queries:
        time.sleep(pause_between)
        for url in web_search(q, session):
            if url in seen_urls:
                continue
            seen_urls.add(url)
            time.sleep(pause_between)
            res = validate(url, session, name)
            if res:
                return DiscoveryResult(url=res.url, method="web_search",
                                       confidence=0.8)
    return None


def load_manual_seeds(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    import csv
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            slug = (row.get("slug") or "").strip()
            url = (row.get("url") or "").strip()
            if slug and url.startswith("http"):
                out[slug] = url
    return out


def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.8"})
    return s
