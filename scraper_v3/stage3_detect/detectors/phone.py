"""1.3 — Phone number published. Statute: Transparency Code 2015 § 2.2."""
import re
from ..corpus import CouncilCorpus, DetectorResult

# UK phone number patterns: landline 01/02 (10/11 digits), mobile 07 (11 digits)
UK_PHONE_RE = re.compile(
    r"(?:\+?44\s?|\b0)(?:1\d{1,3}|2\d{1,2}|3\d{2}|7\d{3}|8\d{2})[ \-]?\d{3,4}[ \-]?\d{3,4}\b"
)


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    for d in corpus.html_pages():
        m = UK_PHONE_RE.search(d.text())
        if m:
            phone = m.group(0).strip()
            return DetectorResult(
                indicator_id="1.3", found=True, confidence=1.0,
                evidence_url=d.url, evidence_snippet=phone,
                notes="UK-format phone number found on the website.",
            )
    return DetectorResult(indicator_id="1.3", found=False,
                          evidence_snippet="No UK-format phone number detected on any crawled page.")
