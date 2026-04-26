"""SQLite-backed response cache.

Stores HTTP responses keyed by URL. Used to make re-runs cheap: every request
checks the cache first, and conditional-GETs use stored ETag / Last-Modified
headers so the upstream server can return 304 Not Modified.
"""
from __future__ import annotations
import json
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import aiosqlite


SCHEMA = """
CREATE TABLE IF NOT EXISTS responses (
    url             TEXT PRIMARY KEY,
    status          INTEGER,
    headers         TEXT,
    body            BLOB,
    fetched_at      INTEGER,
    etag            TEXT,
    last_modified   TEXT,
    content_type    TEXT,
    size_bytes      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_responses_fetched_at ON responses(fetched_at);
"""


@dataclass
class CachedResponse:
    url: str
    status: int
    headers: dict
    body: bytes
    fetched_at: int
    etag: Optional[str]
    last_modified: Optional[str]
    content_type: str
    size_bytes: int

    def is_html(self) -> bool:
        return "text/html" in (self.content_type or "")

    def is_pdf(self) -> bool:
        return "application/pdf" in (self.content_type or "") or self.url.lower().endswith(".pdf")

    def text(self) -> str:
        try:
            return self.body.decode("utf-8", errors="replace")
        except Exception:
            return ""


class ResponseCache:
    def __init__(self, path: str | Path):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)

    async def init(self):
        async with aiosqlite.connect(self.path) as db:
            await db.executescript(SCHEMA)
            await db.commit()

    async def get(self, url: str) -> Optional[CachedResponse]:
        async with aiosqlite.connect(self.path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT * FROM responses WHERE url = ?", (url,))
            row = await cur.fetchone()
            if not row:
                return None
            return CachedResponse(
                url=row["url"],
                status=row["status"],
                headers=json.loads(row["headers"] or "{}"),
                body=row["body"] or b"",
                fetched_at=row["fetched_at"],
                etag=row["etag"],
                last_modified=row["last_modified"],
                content_type=row["content_type"] or "",
                size_bytes=row["size_bytes"] or 0,
            )

    async def put(self, response: CachedResponse) -> None:
        async with aiosqlite.connect(self.path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO responses
                   (url, status, headers, body, fetched_at, etag, last_modified, content_type, size_bytes)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    response.url,
                    response.status,
                    json.dumps(response.headers, ensure_ascii=False),
                    response.body,
                    response.fetched_at,
                    response.etag,
                    response.last_modified,
                    response.content_type,
                    response.size_bytes,
                ),
            )
            await db.commit()

    async def stats(self) -> dict:
        async with aiosqlite.connect(self.path) as db:
            cur = await db.execute("SELECT COUNT(*), SUM(size_bytes) FROM responses")
            count, total_bytes = await cur.fetchone()
            cur = await db.execute("SELECT COUNT(*) FROM responses WHERE content_type LIKE '%pdf%'")
            (pdfs,) = await cur.fetchone()
            return {"rows": count or 0, "bytes": total_bytes or 0, "pdfs": pdfs or 0}
