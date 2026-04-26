"""1.2 — Council email address published. Statute: Transparency Code 2015 § 2.2."""
import re
from ..corpus import CouncilCorpus, DetectorResult

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
GENERIC_DOMAINS = ("gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "yahoo.co.uk", "btinternet.com", "live.co.uk", "icloud.com")


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    """Look for any plausible council email — mailto: or text. Prefer council-domain emails."""
    candidates = []
    for d in corpus.html_pages():
        text = d.text()
        for m in EMAIL_RE.finditer(text):
            email = m.group(0)
            # Exclude obvious noise
            if email.lower().startswith(("info@example", "test@", "noreply")):
                continue
            candidates.append((email, d.url))
    if not candidates:
        return DetectorResult(indicator_id="1.2", found=False,
                              evidence_snippet="No email address found on any crawled page.")

    # Prefer non-generic-domain emails (clerk@somecouncil.gov.uk over council@gmail.com)
    council_domain = next((e for e, u in candidates if not any(g in e.lower() for g in GENERIC_DOMAINS)), None)
    if council_domain:
        url = next(u for e, u in candidates if e == council_domain)
        return DetectorResult(
            indicator_id="1.2", found=True, confidence=1.0,
            evidence_url=url, evidence_snippet=council_domain,
            notes="Council-domain email address found on the website.",
        )
    # Generic email — still counts but lower confidence
    email, url = candidates[0]
    return DetectorResult(
        indicator_id="1.2", found=True, confidence=0.6,
        evidence_url=url, evidence_snippet=email,
        notes="Email found, but on a generic domain (e.g. gmail/outlook). Counts but flagged.",
    )
