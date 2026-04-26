"""scraper_v3 core utilities — HTTP client, robots.txt, cache, audit log."""
from .config import load_config, Config
from .http import PoliteClient
from .robots import RobotsChecker
from .cache import ResponseCache
from .audit import get_logger
