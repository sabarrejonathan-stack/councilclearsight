"""4.4 — Secure HTTPS connection. Statute: UK GDPR Art. 32; NCSC guidance."""
from ..corpus import CouncilCorpus, DetectorResult


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    home = corpus.homepage_doc()
    if home and home.url.lower().startswith("https://"):
        return DetectorResult(
            indicator_id="4.4", found=True, confidence=1.0,
            evidence_url=home.url, evidence_snippet="HTTPS — TLS-encrypted connection",
            notes="Homepage served over HTTPS.",
        )
    return DetectorResult(
        indicator_id="4.4", found=False,
        evidence_url=corpus.homepage,
        evidence_snippet="Homepage not served over HTTPS.",
        notes="Plain HTTP exposes resident data to interception. NCSC and the GOV.UK service standard both require HTTPS.",
    )
