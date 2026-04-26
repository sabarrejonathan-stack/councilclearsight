"""Unit tests for stage 4 — assembling the per-slug JSON from detections."""
from scraper_v3.stage4_publish.runner import assemble_council_json, band_for, WEIGHTS


def test_band_for_thresholds():
    assert band_for(100) == "Excellent"
    assert band_for(80) == "Excellent"
    assert band_for(79) == "Good"
    assert band_for(65) == "Good"
    assert band_for(50) == "Developing"
    assert band_for(49) == "Needs Attention"
    assert band_for(0) == "Needs Attention"


def test_assemble_score_sums_to_100_when_all_found():
    council = {"id": 1, "slug": "test-pc", "council_name": "Test PC", "type": "parish",
               "county": "X", "region": "Y"}
    detections = {
        "homepage": "https://test.gov.uk",
        "indicators": {ind: {"found": True, "confidence": 0.95,
                             "evidence_url": f"https://test.gov.uk/{ind}",
                             "evidence_snippet": ind, "document_date": None}
                       for ind in WEIGHTS},
    }
    body = assemble_council_json(council, detections)
    assert body["score"] == 100
    assert sum(body["pillar_earned"].values()) == 100


def test_assemble_score_zero_when_nothing_found():
    council = {"id": 2, "slug": "empty-pc", "council_name": "Empty PC", "type": "parish"}
    detections = {"homepage": "https://empty.gov.uk", "indicators": {}}
    body = assemble_council_json(council, detections)
    assert body["score"] == 0
    assert all(v == 0 for v in body["pillar_earned"].values())


def test_low_confidence_does_not_award_points():
    council = {"id": 3, "slug": "low-pc", "council_name": "Low Confidence PC", "type": "parish"}
    detections = {
        "homepage": "https://low.gov.uk",
        "indicators": {"1.1": {"found": True, "confidence": 0.5,
                                "evidence_url": "https://low.gov.uk/", "evidence_snippet": ""}},
    }
    body = assemble_council_json(council, detections)
    assert body["score"] == 0
