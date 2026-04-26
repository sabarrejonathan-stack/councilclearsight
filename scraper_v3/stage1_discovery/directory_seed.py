"""URL discovery via the parishcouncils.uk directory.

When pattern-guessing (`{slug}-pc.gov.uk` and friends) fails, this module
searches the parishcouncils.uk directory for the council and pulls out
external links pointing to the council's own website. Those candidate URLs
are still validated by `validate.py` before being accepted — the directory
is treated as a *source of URL hints*, not a source of indicator truth.

Why this exists
---------------
parishcouncils.uk indexes thousands of councils that don't sit on the
canonical `*.gov.uk` namespace (Hugo Fox, 2commune, Vision ICT, plain
WordPress installs etc.). Pattern-guessing misses them entirely. Querying
the directory only for the long-tail councils that pattern-guess can't
resolve gives us wide coverage without paying the slow per-parish search
cost for every one of the 11k+ parishes.

Etiquette
---------
We rate-limit ourselves to one outbound request to parishcouncils.uk every
1.5 seconds via a module-level lock + monotonic clock. The directory will
get hit at most ~7,000 times during a full run (only for councils where
pattern-guess returns nothing), so total directory time ≈ 3 hours,
all in parallel with everything else stage 1 is doing.

Output
------
`lookup_directory(council_name, user_agent)` returns a list of candidate
URL strings (deduped, capped at 5) that are likely to be the council's
own website. The list may be empty.
"""
from __future__ import annotations
import asyncio
import re
import time
from difflib import SequenceMatcher
from typing import List
from urllib.parse import quote, urlparse

import httpx
from selectolax.parser import HTMLParser


SEARCH_URL = "https://www.parishcouncils.uk/?s={query}"
DETAIL_URL_FRAGMENT = "/parish-council/"
MATCH_THRESHOLD = 0.70           # SequenceMatcher ratio — relaxed because
                                 # directory titles include county suffixes etc.

# Polite per-host rate limit — one request every 1.5 s, single in-flight at a time.
_DIRECTORY_LOCK = asyncio.Lock()
_DIRECTORY_DELAY_SECONDS = 1.5
_LAST_DIRECTORY_REQUEST = 0.0

# Domains to discard as candidates — they're never the council's own website.
_BLOCK_DOMAINS = (
    "parishcouncils.uk", "facebook.com", "twitter.com", "x.com",
    "instagram.com", "youtube.com", "linkedin.com", "tiktok.com",
    "google.com", "googleapis.com", "googletagmanager.com",
    "cdn-cgi", "wp.com", "gravatar.com", "wordpress.com",
    "wikipedia.org", "ons.gov.uk", "gov.uk/government",
    "amazon.com", "amazonaws.com", "cloudflare.com",
    "mailchimp.com", "constantcontact.com",
    "youtu.be", "vimeo.com",
    "find-and-update.company-information.service.gov.uk",
)


def _clean_for_match(s: str) -> str:
    s = s.lower().strip()
    # Drop common council suffixes — they're noise for fuzzy matching
    for suf in (" parish council", " town council", " community council",
                " city council", " parish meeting", " (parish council)",
                " parish", " town"):
        if s.endswith(suf):
            s = s[: -len(suf)]
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def _is_useful_candidate(url: str) -> bool:
    parsed = urlparse(url)
    netloc = parsed.netloc.lower()
    if not netloc:
        return False
    for blocked in _BLOCK_DOMAINS:
        if blocked in netloc:
            return False
    # Only accept .uk / .com / .org / .net — most parish councils live on these
    if not any(netloc.endswith(tld) for tld in (".uk", ".com", ".org", ".net", ".info")):
        return False
    return True


def _candidate_priority(url: str) -> int:
    """Lower = better. Used to sort candidates so .gov.uk wins."""
    netloc = urlparse(url).netloc.lower()
    if netloc.endswith(".gov.uk"):
        return 0
    if netloc.endswith(".org.uk"):
        return 1
    if netloc.endswith(".uk"):
        return 2
    return 3


async def _polite_get(client: httpx.AsyncClient, url: str) -> httpx.Response | None:
    """Acquire the directory lock, wait if needed, then issue the request."""
    global _LAST_DIRECTORY_REQUEST
    async with _DIRECTORY_LOCK:
        now = time.monotonic()
        wait = _DIRECTORY_DELAY_SECONDS - (now - _LAST_DIRECTORY_REQUEST)
        if wait > 0:
            await asyncio.sleep(wait)
        try:
            r = await client.get(url)
            _LAST_DIRECTORY_REQUEST = time.monotonic()
            return r
        except Exception:
            _LAST_DIRECTORY_REQUEST = time.monotonic()
            return None


async def lookup_directory(
    council_name: str,
    user_agent: str,
    *,
    timeout: float = 20.0,
    max_candidates: int = 5,
) -> List[str]:
    """Search parishcouncils.uk for `council_name` and return candidate URLs.

    Returns a deduped, priority-sorted list of external links extracted from
    the best-matching directory page. May return an empty list.
    """
    headers = {"User-Agent": user_agent, "Accept": "text/html,*/*;q=0.8"}

    # Build a focused search query — strip the "parish council" suffix because
    # parishcouncils.uk's search is keyword-based and the suffix is noise.
    query = re.sub(
        r"(?i)\s+(parish|town|community|city)\s+council\s*$",
        "",
        council_name,
    ).strip() or council_name

    target_clean = _clean_for_match(council_name)
    candidates: List[str] = []

    try:
        async with httpx.AsyncClient(
            timeout=timeout, follow_redirects=True, headers=headers
        ) as client:
            # 1. Search the directory.
            r = await _polite_get(client, SEARCH_URL.format(query=quote(query)))
            if r is None or r.status_code != 200:
                return []

            tree = HTMLParser(r.text)
            best_url, best_score = None, 0.0

            for a in tree.css("a[href]"):
                href = a.attributes.get("href", "") or ""
                if DETAIL_URL_FRAGMENT not in href:
                    continue
                title = (a.text() or "").strip()
                if not title:
                    continue
                score = _ratio(_clean_for_match(title), target_clean)
                if score > best_score and score >= MATCH_THRESHOLD:
                    best_score = score
                    best_url = href if href.startswith("http") else (
                        "https://www.parishcouncils.uk" + href
                        if href.startswith("/") else f"https://www.parishcouncils.uk/{href}"
                    )
                    if score > 0.95:
                        break

            if not best_url:
                return []

            # 2. Fetch the detail page and harvest external links.
            r2 = await _polite_get(client, best_url)
            if r2 is None or r2.status_code != 200:
                return []

            detail = HTMLParser(r2.text)
            seen: set[str] = set()
            for a in detail.css("a[href]"):
                href = (a.attributes.get("href", "") or "").strip()
                if not href.startswith(("http://", "https://")):
                    continue
                if not _is_useful_candidate(href):
                    continue
                # Strip fragments and trailing slashes for de-dup
                normalised = href.split("#", 1)[0].rstrip("/")
                if normalised in seen:
                    continue
                seen.add(normalised)
                candidates.append(href)

    except Exception:
        return []

    # Priority sort: .gov.uk first, then .org.uk, etc.
    candidates.sort(key=_candidate_priority)
    return candidates[:max_candidates]
