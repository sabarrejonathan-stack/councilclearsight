"""robots.txt fetcher and checker.

We respect Disallow rules for our user-agent. Councils whose robots.txt
disallows our agent are recorded with status `robots-disallowed` and their
Pillar 2/3 indicators are marked Not-Assessed.
"""
from __future__ import annotations
import time
from typing import Dict, Tuple
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx


class RobotsChecker:
    def __init__(self, user_agent: str, ttl_hours: int = 24):
        self.user_agent = user_agent
        self.ttl_seconds = ttl_hours * 3600
        # cache: host -> (RobotFileParser, fetched_at, allowed_for_us)
        self._cache: Dict[str, Tuple[RobotFileParser, float, bool]] = {}

    async def _fetch_and_parse(self, host: str) -> Tuple[RobotFileParser, bool]:
        url = f"https://{host}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(url)
        try:
            async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": self.user_agent}) as client:
                r = await client.get(url, follow_redirects=True)
                if r.status_code == 200:
                    rp.parse(r.text.splitlines())
                else:
                    # Treat 404/etc as "no robots.txt" → allow all
                    rp.parse([])
        except Exception:
            # Network error → conservative: don't block, treat as no robots.txt
            rp.parse([])
        # Check our specific UA (use full UA string and short token)
        allowed_full = rp.can_fetch(self.user_agent, f"https://{host}/")
        allowed_short = rp.can_fetch("CouncilClearSight", f"https://{host}/")
        return rp, allowed_full and allowed_short

    async def is_allowed(self, url: str) -> bool:
        """Check whether our user-agent may fetch a given URL."""
        host = urlparse(url).netloc
        now = time.time()
        if host in self._cache:
            rp, fetched_at, allowed = self._cache[host]
            if now - fetched_at < self.ttl_seconds:
                if not allowed:
                    return False
                return rp.can_fetch(self.user_agent, url) and rp.can_fetch("CouncilClearSight", url)
        rp, allowed = await self._fetch_and_parse(host)
        self._cache[host] = (rp, now, allowed)
        if not allowed:
            return False
        return rp.can_fetch(self.user_agent, url) and rp.can_fetch("CouncilClearSight", url)

    async def host_allowed(self, host: str) -> bool:
        """Check whether a host's robots.txt allows our user-agent at all."""
        now = time.time()
        if host in self._cache:
            rp, fetched_at, allowed = self._cache[host]
            if now - fetched_at < self.ttl_seconds:
                return allowed
        _, allowed = await self._fetch_and_parse(host)
        self._cache[host] = (self._cache.get(host, (None, 0, False))[0] or RobotFileParser(), now, allowed)
        return allowed

    def crawl_delay_for(self, host: str) -> float:
        if host not in self._cache:
            return 0.0
        rp = self._cache[host][0]
        try:
            d = rp.crawl_delay(self.user_agent) or rp.crawl_delay("CouncilClearSight")
            return float(d) if d else 0.0
        except Exception:
            return 0.0
