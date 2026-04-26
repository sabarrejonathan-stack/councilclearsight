"""3.2 — Clerk email — correspondence channel for audit. Statute: Accounts and Audit Regs 2015."""
import re
from ..corpus import CouncilCorpus, DetectorResult

CLERK_EMAIL_RE = re.compile(
    r"\b(clerk|town\s*clerk|parish\s*clerk|clerktothe[a-z]+)[a-z0-9._%+\-]*@[A-Z0-9.\-]+\.[A-Z]{2,}",
    re.IGNORECASE,
)
ALSO_NEAR_CLERK_RE = re.compile(
    r"clerk[^\n]{0,80}([A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,})",
    re.IGNORECASE,
)


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    for d in corpus.html_pages():
        text = d.text()
        m = CLERK_EMAIL_RE.search(text)
        if m:
            return DetectorResult(
                indicator_id="3.2", found=True, confidence=1.0,
                evidence_url=d.url, evidence_snippet=m.group(0),
                notes="Email starting with 'clerk' detected.",
            )
        m = ALSO_NEAR_CLERK_RE.search(text)
        if m:
            return DetectorResult(
                indicator_id="3.2", found=True, confidence=0.85,
                evidence_url=d.url, evidence_snippet=m.group(1),
                notes="Email address found in proximity to the word 'clerk'.",
            )
    return DetectorResult(indicator_id="3.2", found=False,
                          evidence_snippet="No clerk-attributed email detected.")
