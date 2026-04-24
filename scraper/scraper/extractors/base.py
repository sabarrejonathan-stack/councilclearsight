"""Shared extractor helpers: HTML soup, link harvesting, keyword checks."""
from __future__ import annotations
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup


def parse(body: bytes) -> BeautifulSoup:
    """Parse HTML bytes. Returns empty soup on failure."""
    try:
        return BeautifulSoup(body or b"", "lxml")
    except Exception:
        return BeautifulSoup("", "lxml")


def all_links(soup: BeautifulSoup, base_url: str) -> list[tuple[str, str]]:
    """Returns [(href_abs, visible_text_lower)] for every <a> on the page."""
    out = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        abs_url = urljoin(base_url, href)
        text = " ".join(a.get_text(" ", strip=True).split()).lower()
        out.append((abs_url, text))
    return out


def any_keyword_in(haystack: str, needles: list[str]) -> bool:
    h = haystack.lower()
    return any(n.lower() in h for n in needles)


def matching_links(links: list[tuple[str, str]], keywords: list[str]) -> list[tuple[str, str]]:
    """Return links where either URL or text matches any keyword."""
    out = []
    for url, text in links:
        if any_keyword_in(url, keywords) or any_keyword_in(text, keywords):
            out.append((url, text))
    return out


def same_host(a: str, b: str) -> bool:
    try:
        return urlparse(a).netloc.lower() == urlparse(b).netloc.lower()
    except Exception:
        return False
