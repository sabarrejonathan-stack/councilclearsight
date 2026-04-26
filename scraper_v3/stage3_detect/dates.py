"""Pure-Python date extraction — no external dependencies.

Used by detectors that need to find publication dates of agendas, minutes, AGAR.
Best-effort: returns None if no plausible date can be parsed.
"""
from __future__ import annotations
import re
from datetime import date
from typing import Optional


DATE_PATTERNS = [
    # 11.03.2026 / 11/03/2026 / 11-03-2026 (day.month.year)
    re.compile(r"\b(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})\b"),
    # 11 March 2026 / 11th March 2026
    re.compile(
        r"\b(\d{1,2})(?:st|nd|rd|th)?\s+"
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+"
        r"(\d{4})\b",
        re.IGNORECASE,
    ),
    # March 2026
    re.compile(
        r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b",
        re.IGNORECASE,
    ),
]
MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
}


def extract_date(text: str) -> Optional[date]:
    """Best-effort date extraction from text or a filename. Returns None if no plausible date."""
    for rx in DATE_PATTERNS:
        m = rx.search(text)
        if not m:
            continue
        groups = m.groups()
        try:
            if len(groups) == 3 and groups[0].isdigit() and groups[1].isdigit() and groups[2].isdigit():
                d, mth, y = int(groups[0]), int(groups[1]), int(groups[2])
                if y < 100:
                    y += 2000
                if 1 <= mth <= 12 and 1 <= d <= 31 and 1900 <= y <= 2100:
                    return date(y, mth, d)
            elif len(groups) == 3:
                d, mth_name, y = int(groups[0]), groups[1], int(groups[2])
                mth = MONTHS.get(mth_name.lower())
                if mth and 1 <= d <= 31:
                    return date(y, mth, d)
            elif len(groups) == 2:
                mth = MONTHS.get(groups[0].lower())
                y = int(groups[1])
                if mth and 1900 <= y <= 2100:
                    return date(y, mth, 1)
        except (ValueError, KeyError):
            continue
    return None
