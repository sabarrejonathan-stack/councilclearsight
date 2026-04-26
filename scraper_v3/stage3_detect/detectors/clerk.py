"""1.4 — Named clerk identified. Statute: LGA 1972 § 112."""
import re
from ..corpus import CouncilCorpus, DetectorResult

# Match patterns like "Clerk: Jane Smith" or "Town Clerk - Mrs J Smith"
CLERK_PATTERNS = [
    re.compile(r"\b(?:parish|town|community|city)\s+clerk\s*[:\-—–]\s*((?:Mr|Mrs|Ms|Miss|Dr|Cllr)?\.?\s*[A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)", re.IGNORECASE),
    re.compile(r"\bclerk\s*(?:to\s+the\s+council)?\s*[:\-—–]\s*((?:Mr|Mrs|Ms|Miss|Dr|Cllr)?\.?\s*[A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)", re.IGNORECASE),
    re.compile(r"\b((?:Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)\s*[,—–\-]\s*(?:Parish|Town|Community|City)?\s*Clerk", re.IGNORECASE),
]


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    for d in corpus.html_pages():
        text = d.text()
        for rx in CLERK_PATTERNS:
            m = rx.search(text)
            if m:
                name = m.group(1).strip()
                # Trim very short matches (false positives)
                if len(name) < 4:
                    continue
                return DetectorResult(
                    indicator_id="1.4", found=True, confidence=0.95,
                    evidence_url=d.url, evidence_snippet=f"Clerk: {name}",
                    notes="Named clerk pattern matched on website.",
                )
    return DetectorResult(indicator_id="1.4", found=False,
                          evidence_snippet="No named clerk pattern matched on the crawled corpus.")
