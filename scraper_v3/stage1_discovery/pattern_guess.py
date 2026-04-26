"""Generate candidate URLs from a council slug using common naming patterns.

Most parish/town councils' websites follow predictable patterns. We enumerate
a curated list and let `validate.py` confirm which one (if any) actually
serves council content.
"""
from __future__ import annotations
from typing import List
import re


def normalise_slug(slug: str) -> str:
    """Normalise a slug for URL pattern guessing."""
    s = slug.lower().strip()
    s = re.sub(r"[^a-z0-9-]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def slug_variants(slug: str) -> List[str]:
    """Return common variants of a slug for URL pattern matching.

    e.g. 'woolsington-parish-council' →
         ['woolsington-parish-council', 'woolsington-pc', 'woolsington']
    """
    s = normalise_slug(slug)
    out = [s]
    # Strip "-parish-council", "-town-council", "-community-council", "-city-council"
    base = s
    for suffix in ("-parish-council", "-town-council", "-community-council", "-city-council"):
        if base.endswith(suffix):
            base = base[: -len(suffix)]
            break
    if base != s:
        out.append(base)
        # Add abbreviated forms
        if s.endswith("-parish-council"):
            out.append(f"{base}-pc")
            out.append(f"{base}parishcouncil")
        elif s.endswith("-town-council"):
            out.append(f"{base}-tc")
            out.append(f"{base}towncouncil")
        elif s.endswith("-community-council"):
            out.append(f"{base}-cc")
        elif s.endswith("-city-council"):
            out.append(f"{base}-cc")
            out.append(f"{base}citycouncil")
    # Compact form (no hyphens)
    out.append(base.replace("-", ""))
    out.append(s.replace("-", ""))
    # Dedupe preserving order
    seen, result = set(), []
    for v in out:
        if v and v not in seen:
            seen.add(v)
            result.append(v)
    return result


def candidates_for_slug(slug: str, patterns: List[str]) -> List[str]:
    """Apply each {slug}-template to each variant, returning candidate URLs."""
    out: List[str] = []
    for variant in slug_variants(slug):
        for tmpl in patterns:
            url = tmpl.replace("{slug}", variant)
            if url not in out:
                out.append(url)
    return out
