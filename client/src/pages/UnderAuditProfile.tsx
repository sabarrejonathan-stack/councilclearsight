/**
 * UnderAuditProfile — page state for councils we haven't yet verified.
 *
 * Council ClearSight tracks all 11,000+ parish/town/community/city councils in
 * England. Of those, ~4,476 have a fully verified score (every claim linked
 * to a public document on the council's own domain). The remaining ~9,000 are
 * "under audit" — known by name (and where we have it, contact info) but not
 * yet re-scanned end-to-end.
 *
 * This component is the per-council page for that under-audit state. It:
 *   - Makes the audit status explicit and proud, not apologetic.
 *   - Drives subscription via three CTAs (Free watchlist, Gold, Platinum priority).
 *   - Lets the clerk fast-track the audit by submitting their website.
 *   - Shows whatever contact data we hold without inventing scores.
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import {
  ArrowLeft, ArrowRight, Mail, Phone, Globe, User, Scale, FileText,
  BadgeCheck, Sparkles, Bell, ClipboardCheck, Hourglass,
} from "lucide-react";
import { PILLAR_META, pillarColorClasses, type CouncilScore } from "@/lib/scoring";

export default function UnderAuditProfile({ council }: { council: CouncilScore }) {
  const c: any = council;
  const hasUrl = c.audit_status === "under_audit_with_url" || Boolean(c.website);
  const reason: string = c.audit_status_reason || (hasUrl
    ? "Website on file but not yet verified by our scanner"
    : "Awaiting initial verification — no website on file");
  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-6xl py-4">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3 h-3" /> Back to the directory
          </Link>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200">
        <div className="container max-w-6xl py-10">
          <div className="flex flex-wrap items-start gap-6 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                <Badge variant="outline" className="capitalize">{(council.type || "parish").replace("_", " ")} council</Badge>
                {c.principal_authority && <span className="text-muted-foreground">{c.principal_authority}</span>}
                {council.region && <><span className="text-muted-foreground/50">·</span><span className="text-muted-foreground">{council.region}</span></>}
                <Badge className="bg-sky-100 text-sky-800 border-sky-300 font-mono">Under Audit</Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{council.name}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">{reason}.</p>
            </div>
            <div className="relative w-[150px] h-[150px] flex items-center justify-center rounded-2xl bg-sky-50 border border-sky-200">
              <div className="text-center px-3">
                <Hourglass className="w-7 h-7 mx-auto text-sky-700 mb-1" />
                <div className="text-[11px] text-sky-900 font-semibold uppercase tracking-wider">Under Audit</div>
                <div className="text-[10px] text-sky-700/80 mt-0.5">VDTI v4.1</div>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-sky-950 leading-relaxed">
                <strong className="block mb-1">Council ClearSight is currently auditing {council.name}.</strong>
                We track every parish, town, city and community council in England — 10,511 in total. {hasUrl
                  ? <>This council's website is on file and queued for full evidence-pack verification.</>
                  : <>We're still locating this council's primary website. If you know where {council.name} publishes its agendas, minutes and AGAR, you can submit it below.</>}{" "}
                When we publish a verified score for this council, every claim will link to a public document on the council's own domain — the same standard used for our 4,476 already-verified councils.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-6xl py-10 grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-8 min-w-0">
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-accent" /> Be first to know when this audit completes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Our scanner audits hundreds of new councils every week and grades them against fourteen statute-anchored transparency indicators. Subscribers receive an email the moment {council.name}'s score is published — including the full evidence pack.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/pricing" className="block">
                <Card className="p-4 hover:border-accent transition-colors cursor-pointer h-full">
                  <div className="text-xs font-mono text-muted-foreground mb-1">FREE</div>
                  <div className="font-semibold text-sm mb-1">Watchlist alert</div>
                  <p className="text-xs text-muted-foreground">Email me when {council.name}'s audit completes.</p>
                </Card>
              </Link>
              <Link href="/pricing" className="block">
                <Card className="p-4 hover:border-accent transition-colors cursor-pointer h-full bg-gradient-to-br from-accent/5 to-transparent">
                  <div className="text-xs font-mono text-accent mb-1">GOLD · £349/yr</div>
                  <div className="font-semibold text-sm mb-1">Quarterly audit bulletin</div>
                  <p className="text-xs text-muted-foreground">Every newly-verified council in your region, plus benchmarks against 10 peers.</p>
                </Card>
              </Link>
              <Link href="/pricing" className="block">
                <Card className="p-4 hover:border-accent transition-colors cursor-pointer h-full bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <div className="text-xs font-mono text-primary mb-1">PLATINUM · £499/yr</div>
                  <div className="font-semibold text-sm mb-1">Priority audit request</div>
                  <p className="text-xs text-muted-foreground">Move this council to the top of the audit queue. Verified score within 30 days.</p>
                </Card>
              </Link>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">What we'll publish once verified</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              When this audit completes, this page becomes a full transparency scorecard — fourteen statute-anchored indicators across four pillars, every score click-through verifiable against a document on {council.name}'s own website.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              {[1,2,3,4].map((p) => {
                const cls = pillarColorClasses(p as 1|2|3|4);
                return (
                  <div key={p} className={`p-3 border ${cls.border} ${cls.bg} rounded-lg`}>
                    <div className={`text-[10px] font-mono ${cls.text} opacity-70 uppercase tracking-wider mb-1`}>Pillar {p}</div>
                    <div className="font-semibold text-sm">{PILLAR_META[p as 1|2|3|4].label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-accent" /> Are you the clerk for {council.name}?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Submit your council's website and we'll fast-track the audit. Free for clerks; verified scores typically published within 14 working days.
            </p>
            <div className="flex gap-2">
              <Link href={`/challenge?slug=${council.slug}&indicator=1.1`}>
                <Button className="bg-accent hover:bg-accent/90 text-white">Submit our website <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
              </Link>
              <Link href="/for-clerks"><Button variant="outline">For clerks</Button></Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="p-5 bg-white">
            <h3 className="text-sm font-semibold mb-3">What we have on file</h3>
            <div className="space-y-2.5 text-sm">
              <ContactRow icon={Globe} label="Website" value={c.website || undefined} href={c.website || undefined} />
              <ContactRow icon={Mail} label="Email" value={c.email || undefined} href={c.email ? `mailto:${c.email}` : undefined} />
              <ContactRow icon={Phone} label="Phone" value={c.phone || undefined} />
              <ContactRow icon={User} label="Clerk" value={c.clerk_name || undefined} subValue={c.clerk_email || undefined} />
              <ContactRow icon={Scale} label="Principal authority" value={c.principal_authority || undefined} />
              {c.ons_code && <ContactRow icon={FileText} label="ONS code" value={c.ons_code} />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              Contact details shown here are from {c.discovered_via || "our database"} and not yet re-verified by our scanner.
            </p>
          </Card>
          <Card className="p-5 bg-primary text-white">
            <Sparkles className="w-5 h-5 mb-3 text-accent" />
            <h3 className="font-semibold mb-2">Auditing every council in England</h3>
            <p className="text-xs text-white/75 leading-relaxed mb-4">
              4,476 councils verified to date. 6,035 remaining. Every audit produces a click-through evidence pack — pinned to public documents, never invented.
            </p>
            <Link href="/methodology"><Button size="sm" className="w-full bg-white text-primary hover:bg-white/90">Read the methodology <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button></Link>
          </Card>
        </aside>
      </div>
    </PublicLayout>
  );
}

function ContactRow({ icon: Icon, label, value, href, subValue }: { icon: any; label: string; value?: string; href?: string; subValue?: string }) {
  if (!value) {
    return <div className="flex items-center gap-2 text-muted-foreground/60 text-xs"><Icon className="w-3.5 h-3.5" /><span>No {label.toLowerCase()} on file yet</span></div>;
  }
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        {href ? (
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined} className="text-foreground hover:text-accent break-words text-sm">{value}</a>
        ) : (
          <div className="text-foreground text-sm break-words">{value}</div>
        )}
        {subValue && <div className="text-xs text-muted-foreground break-words mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
}
