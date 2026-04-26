"""Configuration loader — reads config.yaml into a typed dataclass."""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import List
import yaml


@dataclass
class HttpConfig:
    user_agent: str
    timeout_seconds: int = 20
    per_host_delay_seconds: float = 3.0
    global_concurrency: int = 50
    retry_on_codes: List[int] = field(default_factory=lambda: [429, 502, 503, 504])
    backoff_seconds: List[int] = field(default_factory=lambda: [10, 30, 90])
    max_retries: int = 3


@dataclass
class CrawlConfig:
    max_depth: int = 3
    max_pages_per_host: int = 60
    max_pdf_size_mb: int = 30
    follow_external: bool = False
    allowed_extensions: List[str] = field(default_factory=lambda: [".html", ".htm", ".pdf", ""])


@dataclass
class RobotsConfig:
    cache_ttl_hours: int = 24


@dataclass
class CacheConfig:
    path: str = "data/cache.sqlite"
    ttl_hours_html: int = 24
    ttl_hours_pdf: int = 168


@dataclass
class DetectionConfig:
    recency_days_agenda: int = 90
    recency_days_minutes: int = 90


@dataclass
class DiscoveryConfig:
    pattern_candidates: List[str] = field(default_factory=list)
    search_engine: str = "duckduckgo"
    search_results_to_score: int = 5
    min_confidence_to_accept: float = 0.6
    # parishcouncils.uk directory lookup — only invoked when database/pattern
    # don't produce an above-threshold URL.
    use_directory: bool = True


@dataclass
class Config:
    http: HttpConfig
    crawl: CrawlConfig
    robots: RobotsConfig
    cache: CacheConfig
    detection: DetectionConfig
    discovery: DiscoveryConfig


def load_config(path: str | Path = "scraper_v3/config.yaml") -> Config:
    with open(path, "r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return Config(
        http=HttpConfig(**raw.get("http", {})),
        crawl=CrawlConfig(**raw.get("crawl", {})),
        robots=RobotsConfig(**raw.get("robots", {})),
        cache=CacheConfig(**raw.get("cache", {})),
        detection=DetectionConfig(**raw.get("detection", {})),
        discovery=DiscoveryConfig(**raw.get("discovery", {})),
    )
