"""Structured audit logging.

Every fetch, every detection, every decision is logged with enough context to
replay the full run from the log file alone. JSONL format so it can be loaded
into any analytics tool.
"""
from __future__ import annotations
import logging
from pathlib import Path
import structlog


def setup_logging(log_path: str | Path = "data/scraper.jsonl", level: int = logging.INFO):
    Path(log_path).parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        format="%(message)s",
        level=level,
        handlers=[logging.FileHandler(log_path), logging.StreamHandler()],
    )
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
    )


def get_logger(name: str = "scraper_v3"):
    return structlog.get_logger(name)
