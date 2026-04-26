"""3.1 — AGAR / annual financial statement published. Statute: Accounts and Audit Regulations 2015 § 10."""
from ..corpus import CouncilCorpus, DetectorResult, extract_date

AGAR_KEYWORDS = ("annual governance and accountability return", "agar", "annual return")
AGAR_FILENAME_RE = r"agar|annual.governance|annual.return"


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    # First pass: filename match
    candidates = corpus.find_pdfs(AGAR_FILENAME_RE)

    # Second pass: PDF body contains AGAR keywords
    if not candidates:
        for d in corpus.pdfs():
            text_lower = d.text().lower()
            if any(kw in text_lower for kw in AGAR_KEYWORDS):
                candidates.append(d)
                if len(candidates) >= 5:
                    break

    if not candidates:
        return DetectorResult(indicator_id="3.1", found=False,
                              evidence_snippet="No AGAR documents found in crawled corpus.")

    # Prefer most recent
    most_recent = (None, candidates[0].url, candidates[0].filename())
    for d in candidates:
        dt = extract_date(d.filename()) or extract_date(d.text()[:8000])
        if dt and (most_recent[0] is None or dt > most_recent[0]):
            most_recent = (dt, d.url, d.filename())

    return DetectorResult(
        indicator_id="3.1", found=True, confidence=0.95,
        evidence_url=most_recent[1], evidence_snippet=most_recent[2],
        document_date=most_recent[0].isoformat() if most_recent[0] else None,
        notes="AGAR / annual return document detected.",
    )
