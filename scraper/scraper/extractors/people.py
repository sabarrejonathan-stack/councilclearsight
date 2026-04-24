"""Detect chair name, councillor list, councillor emails.

Approach: look for a "councillors" page in one hop from the homepage, then parse for:
  - Chair: an entry labelled "Chair", "Chairman", or "Mayor" near a proper name.
  - Councillor names: count distinct capitalised name patterns near "Councillor"/"Cllr".
  - Councillor emails: count mailto: links on that page.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Optional
from .base import parse, all_links, matching_links, same_host

COUNCILLOR_PAGE_KEYWORDS = [
    "councillors", "your-councillors", "parish-councillors", "town-councillors",
    "our-council", "members", "our-team", "about-us",
]

# Matches "Councillor Jane Smith", "Cllr J. Smith", etc. Two-or-more-word names only.
NAME_AFTER_TITLE = re.compile(
    r"(?:Cllr|Councillor|Mr|Mrs|Ms|Dr|Mx)\.?\s+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,3})",
)

CHAIR_NEAR = re.compile(
    # Intentionally NOT using re.IGNORECASE - we want [A-Z] to mean capital only.
    r"(?:Chair(?:man|person|woman)?|CHAIR|Mayor|MAYOR|Lord Mayor|Chair/Mayor)"
    r"\s*[:\-\u2014]?\s*"
    r"(?:Cllr|Councillor|CLLR|COUNCILLOR|Mr|Mrs|Ms|Dr|Mx)?\.?\s*"
    r"([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,2})"
    r"(?=\s|$|[,.;])"
)


@dataclass
class PeopleResult:
    councillor_page_url: Optional[str]
    chair_name: Optional[str]
    councillors_listed_count: int = 0
    councillors_email_count: int = 0
    names_found: list[str] = field(default_factory=list)
    notes: str = ""


def _find_councillor_page(homepage_url: str, body: bytes, fetcher) -> Optional[bytes]:
    """Return the councillor-page body, or the homepage body if no dedicated page."""
    soup = parse(body)
    links = all_links(soup, homepage_url)
    cands = matching_links(links, COUNCILLOR_PAGE_KEYWORDS)
    same = [(u, t) for u, t in cands if same_host(u, homepage_url)]
    if not same:
        return None, None
    # Prefer shorter URL paths (typically the main landing page)
    same.sort(key=lambda ut: len(ut[0]))
    url, _text = same[0]
    r = fetcher.get(url)
    if r.status != 200:
        return None, None
    return r.final_url, r.body


def extract(homepage_url: str, homepage_body: bytes, fetcher) -> PeopleResult:
    page_url, body = _find_councillor_page(homepage_url, homepage_body, fetcher)
    source_url = page_url or homepage_url
    source_body = body if body is not None else homepage_body
    soup = parse(source_body)
    text = soup.get_text(" ", strip=True)

    # Chair
    chair = None
    m = CHAIR_NEAR.search(text)
    if m:
        chair = m.group(1).strip()

    # Councillor names
    names = set()
    for m in NAME_AFTER_TITLE.finditer(text):
        n = m.group(1).strip()
        if 4 <= len(n) <= 60:
            names.add(n)

    # Councillor emails: mailto links on the councillor page
    emails = 0
    for a in soup.find_all("a", href=True):
        if a["href"].lower().startswith("mailto:"):
            emails += 1

    return PeopleResult(
        councillor_page_url=page_url,
        chair_name=chair,
        councillors_listed_count=len(names),
        councillors_email_count=emails,
        names_found=sorted(names),
        notes=f"chair via regex={'yes' if chair else 'no'}; page={'dedicated' if page_url else 'homepage-only'}",
    )
