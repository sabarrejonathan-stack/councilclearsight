"""Unit tests for extractors using fixture HTML.

No network. Runs in <1s. These tests pin extractor behaviour so future changes to
keyword lists or parsing don't silently regress accuracy.
"""
from __future__ import annotations
import os
import unittest
from dataclasses import dataclass
from typing import Optional

from scraper.extractors import accessibility, governance, people
from scraper.fetcher import FetchResult

FIXTURES = os.path.join(os.path.dirname(__file__), "fixtures")


def load(name: str) -> bytes:
    with open(os.path.join(FIXTURES, name), "rb") as f:
        return f.read()


# ── A fake fetcher that serves fixtures from memory ──────────────
class FakeFetcher:
    def __init__(self, pages: dict[str, bytes]):
        self.pages = pages

    def get(self, url: str) -> FetchResult:
        for suffix, body in self.pages.items():
            if url.endswith(suffix):
                return FetchResult(url, 200, url, {}, body, 0.01)
        return FetchResult(url, 404, url, {}, b"", 0.01)

    def head(self, url: str) -> FetchResult:
        return self.get(url)


class AccessibilityTests(unittest.TestCase):
    def test_detects_linked_statement(self):
        fake = FakeFetcher({"/accessibility-statement": load("accessibility_statement.html")})
        r = accessibility.extract(
            "https://example.gov.uk/",
            load("homepage_full.html"),
            fake,
        )
        self.assertTrue(r.found, r.notes)
        self.assertIsNotNone(r.evidence_url)
        self.assertIn("accessibility", r.evidence_url)

    def test_not_found_on_minimal_site(self):
        fake = FakeFetcher({})
        r = accessibility.extract("https://example.gov.uk/", load("homepage_minimal.html"), fake)
        self.assertFalse(r.found)


class GovernanceTests(unittest.TestCase):
    def test_finds_all_four_doc_types(self):
        r = governance.extract_all("https://example.gov.uk/", load("homepage_full.html"))
        self.assertTrue(r["agendas"].found,     r["agendas"].notes)
        self.assertTrue(r["minutes"].found,     r["minutes"].notes)
        self.assertTrue(r["financials"].found,  r["financials"].notes)
        self.assertTrue(r["register"].found,    r["register"].notes)

    def test_finds_nothing_on_minimal_site(self):
        r = governance.extract_all("https://example.gov.uk/", load("homepage_minimal.html"))
        for key in ("agendas", "minutes", "financials", "register"):
            self.assertFalse(r[key].found, f"{key} should not be found")


class PeopleTests(unittest.TestCase):
    def test_finds_chair_and_counts_councillors(self):
        fake = FakeFetcher({"/councillors": load("councillors.html")})
        r = people.extract("https://example.gov.uk/", load("homepage_full.html"), fake)
        self.assertEqual(r.chair_name, "Jane Smith", f"chair was {r.chair_name!r}")
        self.assertGreaterEqual(r.councillors_listed_count, 3)
        self.assertGreaterEqual(r.councillors_email_count, 3)
        self.assertIsNotNone(r.councillor_page_url)

    def test_minimal_site_returns_zero(self):
        fake = FakeFetcher({})
        r = people.extract("https://example.gov.uk/", load("homepage_minimal.html"), fake)
        self.assertEqual(r.councillors_listed_count, 0)
        self.assertEqual(r.councillors_email_count, 0)
        self.assertIsNone(r.chair_name)


if __name__ == "__main__":
    unittest.main()
