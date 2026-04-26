"""Per-council document corpus: HTML pages + PDFs from the cache.

The corpus is the input to every detector. It exposes search helpers (find
PDFs whose filename matches a regex; find HTML pages mentioning a string) so
detectors stay short and declarative.
"""
from __future__ import annotations
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Iterator, List, Optional, Pattern
from urllib.parse import urlparse

import aiosqlite
import pdfplumber
from selectolax.parser import HTMLParser

from .dates import extract_date  # re-export for backward compatibility
from io import BytesIO


@dataclass
class CachedDoc:
    url: str
    status: int
    content_type: str
    body: bytes
    fetched_at: int

    @property
    def is_html(self) -> bool:
        return "text/html" in (self.content_type or "")

    @property
    def is_pdf(self) -> bool:
        return "application/pdf" in (self.content_type or "") or self.url.lower().endswith(".pdf")

    def text(self) -> str:
        if self.is_html:
            try:
                tree = HTMLParser(self.body.decode("utf-8", errors="replace"))
                return tree.text(separator="\n")
            except Exception:
                return ""
        if self.is_pdf:
            try:
                with pdfplumber.open(BytesIO(self.body)) as pdf:
                    return "\n".join((p.extract_text() or "") for p in pdf.pages[:30])
            except Exception:
                return ""
        return ""

    def filename(self) -> str:
        return Path(urlparse(self.url).path).name


@dataclass
class DetectorResult:
    indicator_id: str
    found: bool
    confidence: float = 1.0
    evidence_url: Optional[str] = None
    evidence_snippet: str = ""
    document_date: Optional[str] = None      # ISO date string if available
    notes: str = ""


@dataclass
class CouncilCorpus:
    slug: str
    homepage: str
    docs: List[CachedDoc] = field(default_factory=list)

    @classmethod
    async def load(cls, cache_path: str, slug: str, homepage: str) -> "CouncilCorpus":
        host = urlparse(homepage).netloc
        async with aiosqlite.connect(cache_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT url, status, content_type, body, fetched_at FROM responses WHERE url LIKE ?",
                (f"%{host}%",),
            )
            rows = await cur.fetchall()
        docs = [CachedDoc(url=r["url"], status=r["status"], content_type=r["content_type"] or "",
                          body=r["body"] or b"", fetched_at=r["fetched_at"]) for r in rows]
        return cls(slug=slug, homepage=homepage, docs=docs)

    def html_pages(self) -> Iterator[CachedDoc]:
        return (d for d in self.docs if d.is_html and 200 <= d.status < 400)

    def pdfs(self) -> Iterator[CachedDoc]:
        return (d for d in self.docs if d.is_pdf and 200 <= d.status < 400)

    def homepage_doc(self) -> Optional[CachedDoc]:
        for d in self.docs:
            if d.url.rstrip("/") == self.homepage.rstrip("/"):
                return d
        return None

    def find_pdfs(self, pattern: str | Pattern) -> List[CachedDoc]:
        rx = re.compile(pattern, re.IGNORECASE) if isinstance(pattern, str) else pattern
        return [d for d in self.pdfs() if rx.search(d.url) or rx.search(d.filename())]

    def find_pages_containing(self, pattern: str | Pattern) -> List[CachedDoc]:
        rx = re.compile(pattern, re.IGNORECASE) if isinstance(pattern, str) else pattern
        out = []
        for d in self.html_pages():
            if rx.search(d.text()):
                out.append(d)
        return out


# Date extraction lives in .dates (pure Python, no external deps); re-exported above.
