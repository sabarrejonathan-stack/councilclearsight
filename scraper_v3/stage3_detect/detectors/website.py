"""1.1 — Working council website. Statute: LGA 1972 § 96–101."""
from ..corpus import CouncilCorpus, DetectorResult


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    home = corpus.homepage_doc()
    if home and 200 <= home.status < 400:
        return DetectorResult(
            indicator_id="1.1",
            found=True,
            confidence=1.0,
            evidence_url=home.url,
            evidence_snippet=f"HTTP {home.status} — homepage reachable.",
            notes="Working website confirmed via HTTP fetch.",
        )
    return DetectorResult(
        indicator_id="1.1",
        found=False,
        evidence_url=corpus.homepage,
        evidence_snippet="Homepage did not return a successful HTTP response.",
    )
