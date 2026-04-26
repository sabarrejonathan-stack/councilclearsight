"""Unit tests for slug variant generation."""
from scraper_v3.stage1_discovery.pattern_guess import slug_variants, candidates_for_slug


def test_slug_variants_strips_parish_council():
    v = slug_variants("woolsington-parish-council")
    assert "woolsington-parish-council" in v
    assert "woolsington" in v
    assert "woolsington-pc" in v
    assert "woolsingtonparishcouncil" in v


def test_slug_variants_strips_town_council():
    v = slug_variants("congleton-town-council")
    assert "congleton" in v
    assert "congleton-tc" in v


def test_slug_variants_compact():
    v = slug_variants("alnwick-parish-council")
    assert "alnwickparishcouncil" in v


def test_candidates_for_slug_uses_patterns():
    patterns = ["https://{slug}-pc.gov.uk", "https://{slug}.gov.uk"]
    cs = candidates_for_slug("woolsington-parish-council", patterns)
    assert "https://woolsington-pc.gov.uk" in cs
    assert "https://woolsington.gov.uk" in cs


def test_no_duplicate_candidates():
    patterns = ["https://{slug}.gov.uk", "https://www.{slug}.gov.uk"]
    cs = candidates_for_slug("foo", patterns)
    assert len(cs) == len(set(cs))
