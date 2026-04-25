"""Document metadata fetcher.

For every evidence URL we propose to record on a council profile, we
ask the server one extra question: "When was this last modified?"

Why this matters
----------------
Right now, the v1 scraper records "yes/no" for each indicator.  A
council that posted its last minutes in 2018 scores the same as one
that posts minutes monthly.  That's not defensible — and the brief
specifically calls for the public score to reflect *current*
transparency, with the paid product surfacing recency to the clerk.

A polite HEAD request gives us:
  - HTTP status   (does the link still resolve?)
  - Last-Modified (when was the document last touched on the server?)
  - Content-Type  (PDF? HTML? something else?)
  - Content-Length

We pair this with a date inferred from the filename or link text in
extractors.py.  When the two agree, we have very strong evidence.
When they disagree, we record both and let the auditor judge.
"""
from __future__ import annotations
import email.utils
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

import requests


@dataclass
class DocMeta:
    url: str
    http_status: Optional[int] = None
    last_modified: Optional[str] = None     # ISO8601 UTC
    content_type: Optional[str] = None
    content_length: Optional[int] = None
    error: Optional[str] = None


def fetch_doc_meta(url: str, session: requests.Session, timeout: float = 8.0) -> DocMeta:
    """HEAD a URL to capture metadata without downloading the body.

    Falls back to a 1-byte GET for servers that don't support HEAD.
    """
    if not url:
        return DocMeta(url="", error="empty_url")
    try:
        r = session.head(url, timeout=timeout, allow_redirects=True)
        # Some councils' web servers return 405 for HEAD; fall back to a
        # ranged GET (1 byte) which is even cheaper than a regular GET.
        if r.status_code == 405:
            r = session.get(url, timeout=timeout, allow_redirects=True,
                            headers={"Range": "bytes=0-0"})
    except requests.RequestException as e:
        return DocMeta(url=url, error=str(e)[:200])

    last_mod_iso: Optional[str] = None
    lm_header = r.headers.get("Last-Modified")
    if lm_header:
        try:
            dt = email.utils.parsedate_to_datetime(lm_header)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            last_mod_iso = dt.astimezone(timezone.utc).isoformat()
        except (TypeError, ValueError):
            pass

    content_length: Optional[int] = None
    cl = r.headers.get("Content-Length")
    if cl and cl.isdigit():
        content_length = int(cl)

    return DocMeta(
        url=url,
        http_status=r.status_code,
        last_modified=last_mod_iso,
        content_type=r.headers.get("Content-Type"),
        content_length=content_length,
    )


def days_since(iso_date: Optional[str], reference: Optional[datetime] = None) -> Optional[int]:
    """Helper: how many days between an ISO date string and 'now'?"""
    if not iso_date:
        return None
    reference = reference or datetime.now(timezone.utc)
    # accept both yyyy-mm-dd and full ISO timestamps
    try:
        if len(iso_date) == 10:
            dt = datetime.fromisoformat(iso_date).replace(tzinfo=timezone.utc)
        else:
            dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        return max(0, (reference - dt).days)
    except ValueError:
        return None
