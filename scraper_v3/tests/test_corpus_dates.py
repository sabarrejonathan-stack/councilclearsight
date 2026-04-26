"""Unit tests for date extraction."""
from datetime import date
from scraper_v3.stage3_detect.corpus import extract_date


def test_extract_uk_date_dot():
    assert extract_date("WPC Agenda 11.03.2026.pdf") == date(2026, 3, 11)


def test_extract_uk_date_slash():
    assert extract_date("Agenda 11/03/2026") == date(2026, 3, 11)


def test_extract_long_form():
    assert extract_date("Meeting on 11 March 2026") == date(2026, 3, 11)


def test_extract_long_form_with_suffix():
    assert extract_date("Held on 11th March 2026") == date(2026, 3, 11)


def test_extract_month_year_only():
    assert extract_date("Minutes — March 2026") == date(2026, 3, 1)


def test_extract_no_date():
    assert extract_date("No date here") is None


def test_extract_implausible_rejected():
    # Impossible day
    assert extract_date("32.13.2026") is None
