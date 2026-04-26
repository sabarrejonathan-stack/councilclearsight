"""HTTP HEAD validation of candidate URLs.

Returns a structured result with the resolved URL (after redirects), status,
and a confidence score based on whether the response looks like a council
website (HTML 200, content type, page contains "council" / "parish").
"""
from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse

import httpx


@dataclass
class ValidationResult:
    candidate_url: str
    resolved_url: Optional[str]
    status: int
    is_html: bool
    content_signal: float       # 0.0–1.0 from content keyword check
    confidence: float            # combined confidence
    error: Optional[str] = None


COUNCIL_KEYWORDS = (
    "parish council",
    "town council",
    "city council",
    "community council",
    "council meeting",
    "agenda",
    "minutes",
    "clerk",
    "councillor",
)


async def validate_url(
    url: str,
    council_name: str,
    user_agent: str,
    *,
    timeout: float = 15.0,
) -> ValidationResult:
    """HEAD then GET (small body) to score candidacy."""
    headers = {"User-Agent": user_agent}
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
            # NOTE: We previously did a HEAD probe first, but many parish council
            # CMSes (Hugo Fox, 2commune, Joomla, Vision ICT) return 405 Method
            # Not Allowed on HEAD even when GET works fine. We skip HEAD entirely
            # and go straight to a small Range-GET — slightly more bandwidth, but
            # a much higher real-world hit rate.

            # GET first ~50KB to look at title and body. If the server rejects
            # the Range header (416 Range Not Satisfiable) or returns an error,
            # retry with a plain GET — some hosting providers don't support
            # partial requests but happily serve the full page.
            r = await client.get(url, headers={**headers, "Range": "bytes=0-51200"})
            if r.status_code == 416 or r.status_code in (501, 505):
                r = await client.get(url, headers=headers)
            resolved = str(r.url)
            content_type = r.headers.get("content-type", "").lower()
            is_html = "text/html" in content_type
            body = r.text[:50_000].lower() if is_html else ""

            # Score: keyword presence + slug match + valid status
            content_signal = 0.0
            if is_html:
                hits = sum(1 for kw in COUNCIL_KEYWORDS if kw in body)
                content_signal = min(1.0, hits / 3.0)
                # Bonus: council name appears in title or page
                name_lower = council_name.lower()
                core_name = name_lower.replace("parish council", "").replace("town council", "").replace("council", "").strip()
                if core_name and core_name in body:
                    content_signal = min(1.0, content_signal + 0.3)

            status_signal = 1.0 if 200 <= r.status_code < 300 else 0.5 if 300 <= r.status_code < 400 else 0.0
            domain_signal = 0.6
            if ".gov.uk" in resolved:
                domain_signal = 1.0
            elif ".org.uk" in resolved:
                domain_signal = 0.8

            confidence = round(0.4 * status_signal + 0.4 * content_signal + 0.2 * domain_signal, 3)
            return ValidationResult(url, resolved, r.status_code, is_html, content_signal, confidence)

    except Exception as e:
        # Log the actual exception type and message — silent failure was a real
        # debugging trap (e.g. non-ASCII characters in the user-agent header).
        import structlog
        structlog.get_logger().warning(
            "validate.exception", url=url, error_type=type(e).__name__, error=str(e)[:200]
        )
        return ValidationResult(url, None, 0, False, 0.0, 0.0, error=f"{type(e).__name__}: {e}")
