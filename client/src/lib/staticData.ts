/**
 * Static data hooks — replace tRPC calls with fetches against the static JSON
 * files shipped in /data/. Same return shape as useQuery so the pages using
 * these hooks don't need structural changes.
 */
import { useQuery } from "@tanstack/react-query";
import type { CouncilScore } from "@/lib/scoring";

export type DirectoryRow = {
  id: string | number;
  slug: string;
  name: string;
  type: string;
  county: string;
  region: string;
  score: number | null;
  band: string;
  completeness: number;
  rank_national: number | null;
  rank_type: number | null;
  rank_region: number | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

/**
 * Fetch the slim directory (every council, just enough for search + listing).
 * Cached aggressively; 2 MB file hits the network once per session.
 */
export function useDirectory(options?: { enabled?: boolean }) {
  return useQuery<DirectoryRow[]>({
    queryKey: ["directory"],
    queryFn: () => fetchJson<DirectoryRow[]>("/data/directory.json"),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 60, // 1h — matches Netlify cache header
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Fetch one council's full detail (with indicators and evidence snapshots).
 * Each slug is a separate ~3KB file — loads fast even over a slow connection.
 */
export function useCouncilBySlug(slug: string | undefined) {
  return useQuery<CouncilScore>({
    queryKey: ["council", slug],
    queryFn: () => {
      const safe = (slug ?? "").replace(/[^a-zA-Z0-9_-]/g, "_");
      return fetchJson<CouncilScore>(`/data/councils/${safe}.json`);
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
