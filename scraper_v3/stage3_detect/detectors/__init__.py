"""Detectors — one function per VDTI v4.0 indicator.

Every detector signature is identical:
    async def detect(corpus: CouncilCorpus) -> DetectorResult

Each returns a single DetectorResult with `evidence_url` and a snippet so the
council profile page can show exactly what we found.
"""
from .website import detect as detect_1_1
from .email import detect as detect_1_2
from .phone import detect as detect_1_3
from .clerk import detect as detect_1_4
from .agendas import detect as detect_2_1
from .minutes import detect as detect_2_2
from .agar import detect as detect_3_1
from .clerk_email import detect as detect_3_2
from .chair import detect as detect_4_1
from .councillors import detect as detect_4_2
from .accessibility import detect as detect_4_3
from .https import detect as detect_4_4

ALL_DETECTORS = {
    "1.1": detect_1_1,
    "1.2": detect_1_2,
    "1.3": detect_1_3,
    "1.4": detect_1_4,
    "2.1": detect_2_1,
    "2.2": detect_2_2,
    "3.1": detect_3_1,
    "3.2": detect_3_2,
    "4.1": detect_4_1,
    "4.2": detect_4_2,
    "4.3": detect_4_3,
    "4.4": detect_4_4,
}
