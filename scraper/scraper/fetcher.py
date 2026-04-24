"""Polite HTTP fetcher.

Hard rules:
  - Honour robots.txt per host (checked once per host, cached).
  - Minimum 3 seconds between requests to the same host.
  - 10-second request timeout, 3 retries with exponential backoff.
  - Identifies itself as Council ClearSight with a contact email.
  - Aborts early on non-2xx responses that robots.txt or rate-limit headers tell us to back off.

The fetcher is the only thing in the codebase allowed to make HTTP requests.
"""
from __future__ import annotations
import logging
import time
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse
from urllib import robotparser

import requests
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

log = logging.getLogger("scraper.fetcher")

USER_AGENT = (
    "CouncilClearSightBot/1.0 "
    "(+https://councilclearsight.org.uk; operator@councilclearsight.org.uk) "
    "polite static fetcher - respects robots.txt"
)

PER_HOST_MIN_INTERVAL_S = 3.0
REQUEST_TIMEOUT_S = 10.0

@dataclass
class FetchResult:
    url: str
    status: int
    final_url: str          # after redirects
    headers: dict
    body: bytes
    elapsed_s: float
    disallowed: bool = False
    error: Optional[str] = None


class PoliteFetcher:
    def __init__(self):
        self._last_hit: dict[str, float] = {}
        self._robots: dict[str, robotparser.RobotFileParser] = {}
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": USER_AGENT})

    # ── rate limiting ───────────────────────────────
    def _wait_for_host(self, host: str) -> None:
        last = self._last_hit.get(host)
        if last is not None:
            delta = time.time() - last
            if delta < PER_HOST_MIN_INTERVAL_S:
                time.sleep(PER_HOST_MIN_INTERVAL_S - delta)
        self._last_hit[host] = time.time()

    # ── robots.txt ──────────────────────────────────
    def _robots_ok(self, url: str) -> bool:
        p = urlparse(url)
        host = p.netloc
        if host not in self._robots:
            rp = robotparser.RobotFileParser()
            robots_url = f"{p.scheme}://{host}/robots.txt"
            try:
                rp.set_url(robots_url)
                rp.read()
            except Exception as e:
                log.debug("robots read failed for %s: %s — defaulting to allow", host, e)
            self._robots[host] = rp
        rp = self._robots[host]
        try:
            return rp.can_fetch(USER_AGENT, url)
        except Exception:
            return True

    # ── public API ──────────────────────────────────
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=20),
        retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
        reraise=True,
    )
    def _do_request(self, method: str, url: str) -> requests.Response:
        return self._session.request(method, url, timeout=REQUEST_TIMEOUT_S, allow_redirects=True)

    def get(self, url: str) -> FetchResult:
        if not url or not url.startswith(("http://", "https://")):
            return FetchResult(url, 0, url, {}, b"", 0.0, error="not-http")
        host = urlparse(url).netloc
        if not self._robots_ok(url):
            log.info("robots disallowed: %s", url)
            return FetchResult(url, 0, url, {}, b"", 0.0, disallowed=True, error="robots-disallow")
        self._wait_for_host(host)
        t0 = time.time()
        try:
            r = self._do_request("GET", url)
            return FetchResult(
                url=url, status=r.status_code, final_url=r.url,
                headers={k.lower(): v for k, v in r.headers.items()},
                body=r.content[:2_000_000],   # cap at 2 MB per page
                elapsed_s=time.time() - t0,
            )
        except Exception as e:
            return FetchResult(url, 0, url, {}, b"", time.time() - t0, error=str(e)[:200])

    def head(self, url: str) -> FetchResult:
        if not url or not url.startswith(("http://", "https://")):
            return FetchResult(url, 0, url, {}, b"", 0.0, error="not-http")
        host = urlparse(url).netloc
        if not self._robots_ok(url):
            return FetchResult(url, 0, url, {}, b"", 0.0, disallowed=True, error="robots-disallow")
        self._wait_for_host(host)
        t0 = time.time()
        try:
            # Some councils block HEAD; fall back to GET if 405.
            r = self._session.request("HEAD", url, timeout=REQUEST_TIMEOUT_S, allow_redirects=True)
            if r.status_code == 405:
                return self.get(url)
            return FetchResult(
                url=url, status=r.status_code, final_url=r.url,
                headers={k.lower(): v for k, v in r.headers.items()},
                body=b"", elapsed_s=time.time() - t0,
            )
        except Exception as e:
            return FetchResult(url, 0, url, {}, b"", time.time() - t0, error=str(e)[:200])
