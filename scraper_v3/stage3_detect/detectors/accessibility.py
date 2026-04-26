"""4.3 — Accessibility statement published. Statute: Accessibility Regs 2018."""
import re
from ..corpus import CouncilCorpus, DetectorResult

ACCESSIBILITY_KEYWORDS = (
    "accessibility statement",
    "wcag 2.1",
    "wcag 2.2",
    "web content accessibility guidelines",
    "this website is run by",
)


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    # First: find a page whose URL mentions "accessibility"
    for d in corpus.html_pages():
        if "accessibility" in d.url.lower():
            text = d.text().lower()
            if any(kw in text for kw in ACCESSIBILITY_KEYWORDS):
                return DetectorResult(
                    indicator_id="4.3", found=True, confidence=1.0,
                    evidence_url=d.url, evidence_snippet="Accessibility statement page",
                    notes="Page URL contains 'accessibility' and content mentions WCAG / accessibility statement.",
                )
            return DetectorResult(
                indicator_id="4.3", found=True, confidence=0.7,
                evidence_url=d.url, evidence_snippet="Accessibility-related page",
                notes="URL mentions 'accessibility' but page content is thin — counts at reduced confidence.",
            )

    # Second: any page mentioning the keywords
    for d in corpus.html_pages():
        text = d.text().lower()
        hits = [kw for kw in ACCESSIBILITY_KEYWORDS if kw in text]
        if hits and "accessibility statement" in hits:
            return DetectorResult(
                indicator_id="4.3", found=True, confidence=0.85,
                evidence_url=d.url, evidence_snippet="; ".join(hits[:3]),
                notes="Accessibility statement keywords found in page body.",
            )
    return DetectorResult(indicator_id="4.3", found=False,
                          evidence_snippet="No accessibility statement detected on any crawled page.")
