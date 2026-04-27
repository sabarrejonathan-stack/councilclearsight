/**
 * Directory — searchable list of every council in England (10,511 total).
 *
 * Two states:
 *   - Verified  → ranked, scored, click-through evidence
 *   - Under audit → name + region only, drives subscription CTA
 */
import { useMemo, useState, useDeferredValue } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { useDirectory } from "@/lib/staticData";
import { Search, ArrowUpDown, ExternalLink, Filter, ShieldCheck, Hourglass } from "lucide-react";
import { bandColorClasses, formatScore, formatCompleteness, type BandKey } from "@/lib/scoring";

type DirectoryRow = {
  id: string | number;
  slug: string;
  name: string;
  type: string;
  county: string | null;
  region: string | null;
  principal_authority?: string | null;
  score: number | null;
  band: BandKey;
  completeness: number;
  rank_national: number | null;
  rank_type: number | null;
  rank_region: number | null;
  audit_status?: "verified" | "under_audit" | "under_audit_with_url";
  has_website?: boolean;
};

type SortKey = "rank" | "name" | "score" | "completeness";
const REGIONS = ["All regions", "South West", "South East", "East of England", "London", "West Midlands", "East Midlands", "North West", "North East", "Yorkshire and the Humber"];
const TYPES = [
  { value: "all", label: "All types" },
  { value: "parish", label: "Parish" },
  { value: "town", label: "Town" },
  { value: "city", label: "City" },
  { value: "community", label: "Community" },
  { value: "parish_meeting", label: "Parish meeting" },
];
const BANDS = ["All bands", "Excellent", "Good", "Developing", "Needs Attention", "Under Audit"];
const STATUSES = [
  { value: "all", label: "All councils" },
  { value: "verified", label: "Verified only" },
  { value: "under_audit", label: "Under audit only" },
];

export default function Directory() {
  useSEO({
    title: "Directory — every council in England | Council ClearSight",
    description: "Search 10,511 parish, town, city and community councils in England. 4,174 fully verified to date — every claim links to evidence on the council's own website.",
    canonicalPath: "/directory",
  });

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [region, setRegion] = useState("All regions");
  const [type, setType] = useState("all");
  const [band, setBand] = useState("All bands");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortKey>("rank");

  const { data = [], isLoading } = useDirectory();

  const totals = useMemo(() => {
    const all = (data as DirectoryRow[]);
    return {
      total: all.length,
      verified: all.filter(r => r.audit_status === "verified").length,
      underAudit: all.filter(r => r.audit_status === "under_audit" || r.audit_status === "under_audit_with_url").length,
    };
  }, [data]);

  const rows = useMemo(() => {
    let filtered = (data as DirectoryRow[])
      .filter((r) => (!dq || r.name.toLowerCase().includes(dq.toLowerCase()) || (r.county ?? "").toLowerCase().includes(dq.toLowerCase()) || (r.principal_authority ?? "").toLowerCase().includes(dq.toLowerCase())))
      .filter((r) => region === "All regions" || r.region === region)
      .filter((r) => type === "all" || r.type === type)
      .filter((r) => band === "All bands" || r.band === band)
      .filter((r) => status === "all"
        || (status === "verified" && r.audit_status === "verified")
        || (status === "under_audit" && (r.audit_status === "under_audit" || r.audit_status === "under_audit_with_url")));

    switch (sort) {
      case "name": filtered = filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "score": filtered = filtered.sort((a, b) => (b.score ?? -1) - (a.score ?? -1)); break;
      case "completeness": filtered = filtered.sort((a, b) => b.completeness - a.completeness); break;
      case "rank":
      default:
        filtered = filtered.sort((a, b) => (a.rank_national ?? Number.MAX_SAFE_INTEGER) - (b.rank_national ?? Number.MAX_SAFE_INTEGER));
    }
    return filtered;
  }, [data, dq, region, type, band, status, sort]);

  const visible = rows.slice(0, 200);

  return (
    <PublicLayout>
      <section className="bg-primary py-12">
        <div className="container max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
            <div>
              <Badge className="mb-3 bg-accent/20 text-accent border-accent/30 font-mono">Directory</Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">Every council. One scoreboard.</h1>
              <p className="text-white/70 text-sm mt-2 max-w-2xl">
                {isLoading ? "Loading…" : <>
                  <span className="font-semibold text-white">{totals.total.toLocaleString()}</span> parish, town, city and community councils tracked across England.{" "}
                  <span className="text-emerald-300 font-semibold">{totals.verified.toLocaleString()} verified</span> with click-through evidence,{" "}
                  <span className="text-sky-300 font-semibold">{totals.underAudit.toLocaleString()} under audit</span>.
                </>}
              </p>
            </div>
            <Link href="/methodology"><Button variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">How are scores calculated?</Button></Link>
          </div>

          <Card className="p-4 bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by council, county or principal authority…" className="pl-9" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={band} onValueChange={setBand}>
                <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>{BANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v: SortKey) => setSort(v)}>
                <SelectTrigger className="w-[160px]"><ArrowUpDown className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">By national rank</SelectItem>
                  <SelectItem value="score">By score</SelectItem>
                  <SelectItem value="completeness">By completeness</SelectItem>
                  <SelectItem value="name">A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </section>

      <div className="container max-w-6xl py-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : <>Showing <span className="font-semibold text-foreground">{visible.length.toLocaleString()}</span> of <span className="font-semibold text-foreground">{rows.length.toLocaleString()}</span> matching councils</>}
          </div>
          {rows.length > 200 && <div className="text-xs text-muted-foreground">Showing first 200. Refine filters to narrow.</div>}
        </div>

        <div className="overflow-x-auto border border-border rounded-2xl bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">Council</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Region</th>
                <th className="py-3 px-4 font-semibold text-right">Score</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Completeness</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const isUnder = r.audit_status === "under_audit" || r.audit_status === "under_audit_with_url";
                const cls = isUnder
                  ? { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", dot: "bg-sky-500" }
                  : bandColorClasses(r.band);
                return (
                  <tr key={String(r.id)} className="border-b border-border/50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{r.rank_national ?? "—"}</td>
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/council/${r.slug}`} className="hover:text-accent">{r.name}</Link>
                      {(r.county || r.principal_authority) && <div className="text-xs text-muted-foreground">{r.county || r.principal_authority}</div>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">{r.type.replace("_", " ")}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.region || "—"}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">{isUnder ? <span className="text-muted-foreground">—</span> : formatScore(r.score)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${cls.bg} ${cls.border} ${cls.text} border`}>
                        {isUnder
                          ? <Hourglass className="w-3 h-3" />
                          : <ShieldCheck className="w-3 h-3" />}
                        {isUnder ? "Under audit" : r.band}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-muted-foreground">{isUnder ? "—" : formatCompleteness(r.completeness)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/council/${r.slug}`}><Button size="sm" variant="ghost" className="h-7 text-xs">View <ExternalLink className="w-3 h-3 ml-1" /></Button></Link>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && visible.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">No councils match those filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p><strong className="text-foreground">About audit status.</strong> "Verified" councils have been scanned end-to-end by Council ClearSight; every score links to a public document on the council's own website. "Under audit" councils are tracked but not yet scored — subscribers can <Link href="/pricing" className="text-accent underline">request priority audit</Link> or be notified when a council is verified.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
