"""Per-council depth-limited crawler.

For each confirmed URL:
  - Fetch homepage (depth 0)
  - Extract all internal links (HTML), follow up to max_depth
  - Identify all PDF links and download (subject to size cap)
  - Cap at max_pages_per_host
  - Respect robots.txt + per-host delay throughout (handled by PoliteClient)

Output: nothing to disk directly; everything lands in the SQLite cache.
The cache acts as the per-council corpus that stage 3 detectors read from.
"""
from __future__ import annotations
import asyncio
from collections import deque
from dataclasses import dataclass, field
from typing import Set, List
from urllib.parse import urljoin, urlparse, urldefrag

import structlog
from selectolax.parser import HTMLParser

from ..core.http import PoliteClient
from ..core.cache import CachedResponse


log = structlog.get_logger()


@dataclass
class CrawlResult:
    slug: str
    homepage: str
    pages_fetched: int
    pdfs_fetched: int
    skipped_robots: int
    skipped_extension: int
    bytes: int
    visited_urls: List[str] = field(default_factory=list)


def _same_host(a: str, b: str) -> bool:
    return urlparse(a).netloc.lower() == urlparse(b).netloc.lower()


def _is_html_or_pdf(url: str, allowed_extensions: List[str]) -> bool:
    path = urlparse(url).path.lower()
    if not path or path.endswith("/"):
        return True              # likely HTML index
    for ext in allowed_extensions:
        if ext == "":
            if "." not in path.split("/")[-1]:
                return True
        elif path.endswith(ext):
            return True
    return False


async def crawl_council(
    slug: str,
    homepage_url: str,
    client: PoliteClient,
    *,
    max_depth: int,
    max_pages_per_host: int,
    max_pdf_size_mb: int,
    allowed_extensions: List[str],
) -> CrawlResult:
    """Crawl one council. Stores responses in client.cache."""
    result = CrawlResult(slug=slug, homepage=homepage_url, pages_fetched=0, pdfs_fetched=0,
                         skipped_robots=0, skipped_extension=0, bytes=0)

    visited: Set[str] = set()
    queue: deque[tuple[str, int]] = deque([(homepage_url, 0)])
    max_pdf_bytes = max_pdf_size_mb * 1024 * 1024

    while queue and len(visited) < max_pages_per_host:
        url, depth = queue.popleft()
        url, _ = urldefrag(url)
        if url in visited:
            continue
        if not _same_host(url, homepage_url):
            continue
        if not _is_html_or_pdf(url, allowed_extensions):
            result.skipped_extension += 1
            continue

        response = await client.fetch(url)
        visited.add(url)
        if response is None:
            result.skipped_robots += 1
            continue

        result.bytes += response.size_bytes

        # PDF handling
        if response.is_pdf():
            if response.size_bytes <= max_pdf_bytes:
                result.pdfs_fetched += 1
            continue

        # HTML handling
        if response.is_html():
            result.pages_fetched += 1
            if depth < max_depth:
                # Extract internal links + PDF links
                tree = HTMLParser(response.text())
                for a in tree.css("a[href]"):
                    href = (a.attributes.get("href") or "").strip()
                    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
                        continue
                    abs_url = urljoin(url, href)
                    abs_url, _ = urldefrag(abs_url)
                    if _same_host(abs_url, homepage_url) and abs_url not in visited:
                        queue.append((abs_url, depth + 1))

    result.visited_urls = sorted(visited)
    log.info("crawl.done", slug=slug, pages=result.pages_fetched, pdfs=result.pdfs_fetched, mb=round(result.bytes / 1024 / 1024, 2))
    return result
