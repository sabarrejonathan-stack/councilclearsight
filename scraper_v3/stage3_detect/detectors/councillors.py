"""4.2 — At least one councillor identified. Statute: LGA 1972 § 15."""
import re
from ..corpus import CouncilCorpus, DetectorResult

COUNCILLOR_PAGE_RE = re.compile(r"councillor|members|your.+council", re.IGNORECASE)
COUNCILLOR_NAME_RE = re.compile(
    r"\b(?:Cllr|Councillor)\.?\s+([A-Z][A-Za-z'\-]+\s+[A-Z][A-Za-z'\-]+)",
)


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    # Look for a councillors page first
    councillor_pages = [d for d in corpus.html_pages() if COUNCILLOR_PAGE_RE.search(d.url) or "councillors" in d.text().lower()[:5000]]
    target = councillor_pages or list(corpus.html_pages())

    for d in target:
        text = d.text()
        names = COUNCILLOR_NAME_RE.findall(text)
        if names:
            unique = sorted(set(names))[:3]
            return DetectorResult(
                indicator_id="4.2", found=True, confidence=1.0,
                evidence_url=d.url, evidence_snippet="; ".join(unique),
                notes=f"Found {len(set(names))} distinct 'Cllr/Councillor + Name' patterns.",
            )
    return DetectorResult(indicator_id="4.2", found=False,
                          evidence_snippet="No 'Cllr/Councillor + Name' pattern found on any crawled page.")
