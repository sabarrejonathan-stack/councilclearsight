"""2.2 — Meeting minutes published (recency: <90 days). Statute: LGA 1972 § 100C."""
from datetime import date, timedelta
from ..corpus import CouncilCorpus, DetectorResult, extract_date


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    candidates = corpus.find_pdfs(r"minute")
    if not candidates:
        candidates = [d for d in corpus.html_pages() if "minute" in d.url.lower()]

    if not candidates:
        return DetectorResult(indicator_id="2.2", found=False,
                              evidence_snippet="No minutes documents found in crawled corpus.")

    today = date.today()
    threshold = today - timedelta(days=90)
    most_recent: tuple[date | None, str, str] = (None, "", "")
    for d in candidates:
        dt = extract_date(d.filename()) or extract_date(d.text()[:5000])
        if dt and (most_recent[0] is None or dt > most_recent[0]):
            most_recent = (dt, d.url, d.filename())

    if most_recent[0] is None:
        d = candidates[0]
        return DetectorResult(
            indicator_id="2.2", found=True, confidence=0.7,
            evidence_url=d.url, evidence_snippet=d.filename(),
            notes="Minutes PDF found but date could not be parsed.",
        )

    if most_recent[0] >= threshold:
        return DetectorResult(
            indicator_id="2.2", found=True, confidence=1.0,
            evidence_url=most_recent[1], evidence_snippet=most_recent[2],
            document_date=most_recent[0].isoformat(),
            notes=f"Most recent minutes dated {most_recent[0].isoformat()} (within last 90 days).",
        )
    return DetectorResult(
        indicator_id="2.2", found=False,
        evidence_url=most_recent[1], evidence_snippet=most_recent[2],
        document_date=most_recent[0].isoformat(),
        notes=f"Most recent minutes dated {most_recent[0].isoformat()} — older than 90 days.",
    )
