"""2.1 — Meeting agendas published (recency: <90 days). Statute: LGA 1972 § 100B."""
from datetime import date, timedelta
from ..corpus import CouncilCorpus, DetectorResult, extract_date


async def detect(corpus: CouncilCorpus) -> DetectorResult:
    candidates = corpus.find_pdfs(r"agenda")
    if not candidates:
        # Fall back to HTML pages with "agenda" in URL
        candidates = [d for d in corpus.html_pages() if "agenda" in d.url.lower()]

    if not candidates:
        return DetectorResult(indicator_id="2.1", found=False,
                              evidence_snippet="No agenda documents found in crawled corpus.")

    # Find most recent
    today = date.today()
    threshold = today - timedelta(days=90)
    most_recent: tuple[date | None, str, str] = (None, "", "")
    for d in candidates:
        # Extract date from filename first, then text
        dt = extract_date(d.filename()) or extract_date(d.text()[:5000])
        if dt and (most_recent[0] is None or dt > most_recent[0]):
            most_recent = (dt, d.url, d.filename())

    if most_recent[0] is None:
        # Has agenda but no parseable date — assume current
        d = candidates[0]
        return DetectorResult(
            indicator_id="2.1", found=True, confidence=0.7,
            evidence_url=d.url, evidence_snippet=d.filename(),
            notes="Agenda PDF found but date could not be parsed; counts at reduced confidence.",
        )

    if most_recent[0] >= threshold:
        return DetectorResult(
            indicator_id="2.1", found=True, confidence=1.0,
            evidence_url=most_recent[1], evidence_snippet=most_recent[2],
            document_date=most_recent[0].isoformat(),
            notes=f"Most recent agenda dated {most_recent[0].isoformat()} (within last 90 days).",
        )
    return DetectorResult(
        indicator_id="2.1", found=False,
        evidence_url=most_recent[1], evidence_snippet=most_recent[2],
        document_date=most_recent[0].isoformat(),
        notes=f"Most recent agenda dated {most_recent[0].isoformat()} — older than 90 days.",
    )
