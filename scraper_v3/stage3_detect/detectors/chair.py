"""4.1 — Chair / Mayor named. Statute: LGA 1972 § 15."""
import re
from ..corpus import CouncilCorpus, DetectorResult

CHAIR_PATTERNS = [
    re.compile(r"\b(?:chair(?:man|woman|person)?|mayor)\s*[:\-—–]\s*((?:Cllr|Councillor|Mr|Mrs|Ms|Miss|Dr)?\.?\s*[A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)", re.IGNORECASE),
    re.compile(r"\b((?:Cllr|Councillor|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)\s*(?:,|—|–|-)\s*(?:Chair(?:man|woman|person)?|Mayor)", re.IGNORECASE),
]


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    for d in corpus.html_pages():
        text = d.text()
        for rx in CHAIR_PATTERNS:
            m = rx.search(text)
            if m:
                name = m.group(1).strip()
                if len(name) < 4 or ";" in name:
                    continue
                return DetectorResult(
                    indicator_id="4.1", found=True, confidence=0.95,
                    evidence_url=d.url, evidence_snippet=f"Chair: {name}",
                    notes="Chair/Mayor pattern matched on website.",
                )
    return DetectorResult(indicator_id="4.1", found=False,
                          evidence_snippet="No chair / mayor name pattern matched on the corpus.")
