"""Detect whether a council website has a published accessibility statement.

Statutory basis: Public Sector Bodies (Websites & Mobile Applications) Accessibility
Regulations 2018. Every public body website is legally required to publish a statement.

Signals (any one triggers a pass):
  1. A link with text or URL containing "accessibility" (case-insensitive).
  2. A page reachable in one hop from the homepage titled "Accessibility Statement".
  3. An <a> footer link with text "Accessibility" that links to a page referencing the
     regulations or containing phrases like "conforms to WCAG".
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from .base import parse, all_links, matching_links, same_host, any_keyword_in


ACCESSIBILITY_KEYWORDS = [
    "accessibility-statement",
    "accessibility_statement",
    "accessibility statement",
    "/accessibility",
]

STATEMENT_CONTENT_MARKERS = [
    "wcag",
    "accessibility regulations 2018",
    "this accessibility statement applies",
    "public sector bodies",
]


@dataclass
class AccessibilityResult:
    found: bool
    evidence_url: Optional[str]
    notes: str


def extract(homepage_url: str, body: bytes, fetcher) -> AccessibilityResult:
    soup = parse(body)
    if not soup.text.strip():
        return AccessibilityResult(False, None, "homepage parse empty")

    links = all_links(soup, homepage_url)
    candidates = matching_links(links, ACCESSIBILITY_KEYWORDS)
    # Only follow same-host candidates; external accessibility statements don't count.
    for url, text in candidates:
        if not same_host(url, homepage_url):
            continue
        r = fetcher.get(url)
        if r.status != 200:
            continue
        statement_soup = parse(r.body)
        page_text = statement_soup.get_text(" ", strip=True).lower()
        if any_keyword_in(page_text, STATEMENT_CONTENT_MARKERS) or "accessibility statement" in page_text:
            return AccessibilityResult(True, r.final_url, f"matched '{text[:60]}'")
    return AccessibilityResult(False, None, f"{len(candidates)} candidate links, none verified")
