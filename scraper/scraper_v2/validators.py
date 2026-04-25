"""Validation utilities for Council ClearSight v2.

The principle here: every claim about a council should be backed by
*observable* evidence.  An email field that contains "info@xyz" but
whose domain doesn't resolve is not the same as a working email — and
the score should reflect that.

We never call out to external paid services.  All validation is local
or relies on standard DNS / TLS.  No assumptions about deliverability:
we only check shape and resolvability, not whether the inbox is read.
"""
from __future__ import annotations
import re
import socket
import ssl
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlparse


# ─────────────────────────────────────────────────────────────────────
# Email
# ─────────────────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(
    r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$"
)

@dataclass
class EmailCheck:
    raw: str
    format_valid: bool
    domain: Optional[str]
    domain_resolves: bool
    is_gov_uk: bool
    is_generic_clerk: bool        # clerk@*, info@*, parishclerk@*
    notes: str = ""


def check_email(addr: str) -> EmailCheck:
    addr = (addr or "").strip().lower()
    if not addr:
        return EmailCheck("", False, None, False, False, False, "empty")
    fmt_ok = bool(_EMAIL_RE.match(addr))
    domain = addr.split("@")[-1] if "@" in addr else None
    is_gov = bool(domain and domain.endswith(".gov.uk"))
    local = addr.split("@", 1)[0] if "@" in addr else addr
    is_generic = local in {"clerk", "info", "parishclerk", "townclerk", "office", "admin", "contact", "enquiries"}
    resolves = False
    if fmt_ok and domain:
        try:
            socket.gethostbyname(domain)
            resolves = True
        except OSError:
            resolves = False
    return EmailCheck(
        raw=addr,
        format_valid=fmt_ok,
        domain=domain,
        domain_resolves=resolves,
        is_gov_uk=is_gov,
        is_generic_clerk=is_generic,
    )


# ─────────────────────────────────────────────────────────────────────
# UK phone numbers
# ─────────────────────────────────────────────────────────────────────

_PHONE_DIGITS_RE = re.compile(r"[^0-9+]")

def normalise_uk_phone(raw: str) -> Optional[str]:
    """Return a tidy E.164-style UK number or None if it doesn't look like one.

    Accepted inputs:
      01234 567890, 01234-567890, +44 1234 567890, 0044 1234 567890,
      01234567890, 07700 900000.
    """
    if not raw:
        return None
    digits = _PHONE_DIGITS_RE.sub("", raw)
    if digits.startswith("0044"):
        digits = "+44" + digits[4:]
    elif digits.startswith("44") and not digits.startswith("+"):
        digits = "+" + digits
    elif digits.startswith("0"):
        digits = "+44" + digits[1:]
    # basic length test for UK numbers (10–11 digits after the +44)
    if not digits.startswith("+44"):
        return None
    body = digits[3:]
    if not (9 <= len(body) <= 11):
        return None
    if not body.isdigit():
        return None
    return digits


@dataclass
class PhoneCheck:
    raw: str
    normalised: Optional[str]
    format_valid: bool
    is_mobile: bool


def check_phone(raw: str) -> PhoneCheck:
    raw = (raw or "").strip()
    norm = normalise_uk_phone(raw)
    valid = norm is not None
    is_mobile = bool(norm and norm.startswith("+447"))
    return PhoneCheck(raw=raw, normalised=norm, format_valid=valid, is_mobile=is_mobile)


# ─────────────────────────────────────────────────────────────────────
# URL / domain quality
# ─────────────────────────────────────────────────────────────────────

@dataclass
class UrlCheck:
    url: str
    parsed_ok: bool
    scheme: Optional[str]
    host: Optional[str]
    is_https: bool
    is_gov_uk: bool
    domain_resolves: bool
    ssl_valid: Optional[bool]      # None if not https
    notes: str = ""


def check_url(url: str, *, do_ssl: bool = True, timeout: float = 5.0) -> UrlCheck:
    """Inspect a URL for shape, scheme, DNS resolution, and (optionally) TLS.

    SSL validation is a useful signal: a council site without a valid
    cert is harder to trust, and many resident-facing journeys fail when
    the browser blocks the page.
    """
    if not url:
        return UrlCheck("", False, None, None, False, False, False, None)
    p = urlparse(url)
    if not p.scheme or not p.netloc:
        return UrlCheck(url, False, None, None, False, False, False, None, "unparseable")
    host = p.netloc.lower()
    is_https = (p.scheme.lower() == "https")
    is_gov = host.endswith(".gov.uk")

    resolves = False
    try:
        socket.gethostbyname(host)
        resolves = True
    except OSError:
        pass

    ssl_ok: Optional[bool] = None
    if is_https and do_ssl and resolves:
        ssl_ok = False
        try:
            ctx = ssl.create_default_context()
            with socket.create_connection((host, 443), timeout=timeout) as sock:
                with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                    ssock.getpeercert()  # raises if cert invalid
                    ssl_ok = True
        except (socket.timeout, ssl.SSLError, OSError):
            ssl_ok = False

    return UrlCheck(
        url=url,
        parsed_ok=True,
        scheme=p.scheme.lower(),
        host=host,
        is_https=is_https,
        is_gov_uk=is_gov,
        domain_resolves=resolves,
        ssl_valid=ssl_ok,
    )
