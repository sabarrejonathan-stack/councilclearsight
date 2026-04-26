"""DuckDuckGo Lite search — last-resort URL discovery.

We use the DuckDuckGo Lite endpoint (https://lite.duckduckgo.com/lite/) which
returns plain HTML and doesn't require an API key. This is intended as a
fallback for councils whose URLs can't be guessed by pattern.

Politeness: we limit to ≤30 search queries per minute. No scraping at scale —
this is one query per council that didn't resolve via pattern.
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import List
from urllib.parse import quote_plus, urlparse

import httpx
from selectolax.parser import HTMLParser


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str


SEARCH_URL = "https://lite.duckduckgo.com/lite/?q={query}"


async def search(
    council_name: str,
    user_agent: str,
    *,
    max_results: int = 5,
    timeout: float = 15.0,
) -> List[SearchResult]:
    """Run a single DuckDuckGo Lite query and parse result links."""
    query = f'"{council_name}" parish council OR town council site:gov.uk OR site:org.uk'
    url = SEARCH_URL.format(query=quote_plus(query))
    headers = {"User-Agent": user_agent}
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
            r = await client.get(url)
        if r.status_code != 200:
            return []
    except Exception:
        return []

    tree = HTMLParser(r.text)
    results: List[SearchResult] = []
    for row in tree.css("table.result-link, a.result-link"):
        a = row.css_first("a") or row
        href = a.attributes.get("href", "")
        if not href.startswith("http"):
            continue
        # DDG redirects through /l/?uddg=... — extract the real URL
        if "duckduckgo" in href and "uddg=" in href:
            from urllib.parse import parse_qs, urlparse as up
            q = parse_qs(up(href).query)
            href = q.get("uddg", [href])[0]
        title = a.text(strip=True) or ""
        results.append(SearchResult(title=title, url=href, snippet=""))
        if len(results) >= max_results:
            break
    # Filter out obvious non-councils
    filtered = [r for r in results if r.url and not _is_excluded(r.url)]
    return filtered


EXCLUDE_DOMAINS = (
    "facebook.com", "twitter.com", "x.com", "linkedin.com", "instagram.com",
    "youtube.com", "wikipedia.org", "google.com", "duckduckgo.com",
    "amazon.co.uk", "ebay.co.uk",
)


def _is_excluded(url: str) -> bool:
    host = urlparse(url).netloc.lower()
    return any(dom in host for dom in EXCLUDE_DOMAINS)
