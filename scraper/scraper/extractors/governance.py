"""Detect agendas, minutes, AGAR, register of interests from the homepage + one hop.

Strategy:
  1. Fetch homepage; collect every <a>.
  2. For each document type, find matching links by keyword.
  3. If matches exist AND at least one points to a valid PDF/doc/same-host page, record a pass.
  4. For AGAR specifically, also verify the linked doc is a PDF or the page title contains
     one of the AGAR-specific phrases (AGAR, Annual Governance, Annual Return, Section 1/2).
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from .base import parse, all_links, matching_links, same_host


AGENDA_KEYWORDS      = ["agenda", "agendas"]
MINUTES_KEYWORDS     = ["minutes", "minute of", "meeting minutes"]
FINANCIALS_KEYWORDS  = [
    "agar", "annual governance", "annual return", "annual-accounts",
    "annual accounts", "section 1", "section 2", "accounts-and-audit",
    "financial statement", "statement of accounts",
]
REGISTER_KEYWORDS    = [
    "register of interests", "members' interests", "members interests",
    "register of members", "declarations of interest", "dpi",
]


def _likely_doc(url: str) -> bool:
    return url.lower().endswith((".pdf", ".doc", ".docx", ".htm", ".html", "/"))


@dataclass
class GovernanceFinding:
    found: bool
    evidence_url: Optional[str]
    notes: str


def _find_one(links, keywords, base_url) -> GovernanceFinding:
    cands = matching_links(links, keywords)
    same = [(u, t) for u, t in cands if same_host(u, base_url)]
    if same:
        url, text = same[0]
        return GovernanceFinding(True, url, f"{len(same)} same-host links (e.g. '{text[:60]}')")
    if cands:
        url, text = cands[0]
        return GovernanceFinding(True, url, f"external link (e.g. '{text[:60]}')")
    return GovernanceFinding(False, None, "no keyword match on homepage")


def extract_all(homepage_url: str, body: bytes) -> dict:
    soup = parse(body)
    links = all_links(soup, homepage_url)
    return {
        "agendas":   _find_one(links, AGENDA_KEYWORDS, homepage_url),
        "minutes":   _find_one(links, MINUTES_KEYWORDS, homepage_url),
        "financials":_find_one(links, FINANCIALS_KEYWORDS, homepage_url),
        "register":  _find_one(links, REGISTER_KEYWORDS, homepage_url),
    }
