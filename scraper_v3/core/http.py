"""Polite async HTTP client.

- Per-host concurrency = 1 (never two simultaneous requests to same host).
- Per-host delay = 3 seconds minimum between requests.
- Global concurrency cap (50 hosts in flight at once).
- Conditional GET via stored ETag / Last-Modified for cache freshness.
- Exponential backoff on 429/503.
- Robots.txt enforcement before every request.
"""
from __future__ import annotations
import asyncio
import time
from typing import Optional
from urllib.parse import urlparse

import httpx
import structlog

from .cache import ResponseCache, CachedResponse
from .robots import RobotsChecker
from .config import HttpConfig


log = structlog.get_logger()


class PoliteClient:
    def __init__(self, cfg: HttpConfig, cache: ResponseCache, robots: RobotsChecker):
        self.cfg = cfg
        self.cache = cache
        self.robots = robots
        self._global_sem = asyncio.Semaphore(cfg.global_concurrency)
        # Per-host serialisation: each host has a lock + last-fetched timestamp.
        self._host_locks: dict[str, asyncio.Lock] = {}
        self._host_last: dict[str, float] = {}

    def _host_lock(self, host: str) -> asyncio.Lock:
        if host not in self._host_locks:
            self._host_locks[host] = asyncio.Lock()
        return self._host_locks[host]

    async def _wait_for_host(self, host: str):
        """Enforce per-host minimum delay between requests."""
        last = self._host_last.get(host, 0.0)
        gap = time.time() - last
        # Use the larger of our config delay and any robots-suggested crawl-delay
        required = max(self.cfg.per_host_delay_seconds, self.robots.crawl_delay_for(host))
        if gap < required:
            await asyncio.sleep(required - gap)
        self._host_last[host] = time.time()

    async def fetch(self, url: str, *, force_refresh: bool = False) -> Optional[CachedResponse]:
        """Fetch a URL, using cache when fresh, with full politeness."""
        # 1. Robots check
        if not await self.robots.is_allowed(url):
            log.debug("robots.disallowed", url=url)
            return None

        host = urlparse(url).netloc

        # 2. Check cache for conditional-GET hint
        cached = await self.cache.get(url) if not force_refresh else None
        conditional_headers = {}
        if cached and cached.etag:
            conditional_headers["If-None-Match"] = cached.etag
        if cached and cached.last_modified:
            conditional_headers["If-Modified-Since"] = cached.last_modified

        # 3. Acquire global + host concurrency
        async with self._global_sem:
            async with self._host_lock(host):
                await self._wait_for_host(host)
                response = await self._do_request(url, conditional_headers)

        if response is None:
            # Network error or persistent failure → return cached if we have one
            return cached
        return response

    async def _do_request(self, url: str, conditional_headers: dict) -> Optional[CachedResponse]:
        headers = {"User-Agent": self.cfg.user_agent, **conditional_headers}
        attempt = 0
        while attempt < self.cfg.max_retries:
            try:
                async with httpx.AsyncClient(
                    timeout=self.cfg.timeout_seconds,
                    follow_redirects=True,
                    headers=headers,
                    http2=True,
                ) as client:
                    r = await client.get(url)
                if r.status_code == 304:
                    # Not Modified → return cached
                    cached = await self.cache.get(url)
                    if cached:
                        log.debug("cache.304_revalidated", url=url)
                        return cached
                if r.status_code in self.cfg.retry_on_codes and attempt < self.cfg.max_retries - 1:
                    backoff = self.cfg.backoff_seconds[min(attempt, len(self.cfg.backoff_seconds) - 1)]
                    log.warning("http.backoff", url=url, status=r.status_code, sleep=backoff)
                    await asyncio.sleep(backoff)
                    attempt += 1
                    continue
                # Build cached response and store
                response = CachedResponse(
                    url=url,
                    status=r.status_code,
                    headers=dict(r.headers),
                    body=bytes(r.content),
                    fetched_at=int(time.time()),
                    etag=r.headers.get("etag"),
                    last_modified=r.headers.get("last-modified"),
                    content_type=r.headers.get("content-type", ""),
                    size_bytes=len(r.content),
                )
                if 200 <= r.status_code < 400:
                    await self.cache.put(response)
                log.info("http.fetched", url=url, status=r.status_code, size=response.size_bytes)
                return response
            except httpx.TimeoutException as e:
                log.warning("http.timeout", url=url, attempt=attempt)
            except Exception as e:
                log.error("http.error", url=url, error=str(e), attempt=attempt)
            attempt += 1
            await asyncio.sleep(2 ** attempt)
        return None
