/**
 * Evidence page — Council ClearSight (VDTI v3)
 *
 * The statutory and academic basis for the 13 indicators.
 * Three sections: Statutory basis, Sector literature, Peer review.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, ExternalLink, Scale, BookOpen, Users,
} from "lucide-react";

export default function Evidence() {
  useSEO({
    title: "Evidence base — Council ClearSight Transparency Index",
    description: "The statutory and academic foundations for every indicator in VDTI v3. Transparency Code, Accounts & Audit Regs, LGA 1972, and sector guidance.",
    keywords: "evidence base, statutory framework, transparency code, local government law",
    canonicalPath: "/evidence",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.1]">
            The evidence base
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Every indicator is grounded in statute, regulation, or sector-recognised guidance. Nothing is arbitrary.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-16 space-y-20">

        {/* ─── Statutory basis ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <Scale className="w-6 h-6 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">Statutory basis</h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border">
                  <th className="text-left p-4 font-semibold">Pillar & Indicator</th>
                  <th className="text-left p-4 font-semibold">Statute or Regulation</th>
                  <th className="text-left p-4 font-semibold">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    pillar: "Pillar 1: Digital Presence (25 max)",
                    indicators: [
                      { name: "1.1 — Active council website (15)", statute: "LGA 1972 § 96–101 (duty to provide proper notice of business)", link: "https://www.legislation.gov.uk/ukpga/1972/70/contents" },
                      { name: "1.2 — Council email address published (5)", statute: "Transparency Code 2015 § 2.2 (contact point)", link: "https://www.gov.uk/government/publications/local-council-transparency-code-2015" },
                      { name: "1.3 — Phone number published (5)", statute: "Transparency Code 2015 § 2.2 (contact point)", link: "https://www.gov.uk/government/publications/local-council-transparency-code-2015" },
                    ]
                  },
                  {
                    pillar: "Pillar 2: Governance (25 max)",
                    indicators: [
                      { name: "2.1 — Named clerk identified (10)", statute: "LGA 1972 § 112 (clerk as proper officer)", link: "https://www.legislation.gov.uk/ukpga/1972/70/contents" },
                      { name: "2.2 — Clerk email published (5)", statute: "Transparency Code 2015 § 2.2 (clerk contact)", link: "https://www.gov.uk/government/publications/local-council-transparency-code-2015" },
                      { name: "2.3 — Chair / Mayor named (5)", statute: "LGA 1972 § 15 (chair election & record)", link: "https://www.legislation.gov.uk/ukpga/1972/70/contents" },
                      { name: "2.4 — Governance documents published (5)", statute: "LGA 1972 § 100–102 (agendas & minutes); Accounts & Audit Regs 2015 § 10 (AGAR)", link: "https://www.legislation.gov.uk/ukpga/1972/70/contents" },
                    ]
                  },
                  {
                    pillar: "Pillar 3: Community (25 max)",
                    indicators: [
                      { name: "3.1 — Schools mapped within council area (10)", statute: "DfE GIAS register (Get Information about Schools)", link: "https://get-information-schools.service.gov.uk/" },
                      { name: "3.2 — School density (5)", statute: "Derived from DfE GIAS + ONS parish boundaries", link: "https://www.ons.gov.uk/methodology/geography/ukgeographies/administrativegeography" },
                      { name: "3.3 — Engagement evidence published (10)", statute: "LGA 1972 § 100 (right to inspect); NALC Good Councillor Guide § 4 (Community Engagement)", link: "https://www.nalc.gov.uk/" },
                    ]
                  },
                  {
                    pillar: "Pillar 4: Accessibility (25 max)",
                    indicators: [
                      { name: "4.1 — Multiple contact methods provided (10)", statute: "Public Sector Bodies (Websites & Mobile Apps) Accessibility Regs 2018; Equality Act 2010 § 20 (reasonable adjustments)", link: "https://www.legislation.gov.uk/statutory-instruments/2018/852" },
                      { name: "4.2 — Named contact identified (10)", statute: "LGA 1972 § 112 (clerk as proper officer); Transparency Code 2015 § 2.2", link: "https://www.gov.uk/government/publications/local-council-transparency-code-2015" },
                      { name: "4.3 — Geographic and ward information (5)", statute: "ONS administrative geography; LGA 1972 § 1 (geographic scope of councils)", link: "https://www.ons.gov.uk/methodology/geography/ukgeographies/administrativegeography" },
                    ]
                  },
                ].map((group, i) => (
                  <tbody key={i}>
                    <tr className="bg-secondary/10">
                      <td colSpan={3} className="px-4 py-3 font-semibold text-foreground text-sm">{group.pillar}</td>
                    </tr>
                    {group.indicators.map((ind, j) => (
                      <tr key={j}>
                        <td className="p-4 text-xs">{ind.name}</td>
                        <td className="p-4 text-xs">{ind.statute}</td>
                        <td className="p-4">
                          <a href={ind.link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              Open <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
            <p className="text-foreground font-semibold mb-2">Key legislative instruments cited:</p>
            <ul className="space-y-1 text-muted-foreground text-xs list-disc ml-5">
              <li><strong>Local Government Act 1972</strong> — the foundational statute for parish, town and community council powers and duties.</li>
              <li><strong>Transparency Code 2015</strong> — statutory guidance on publication of council contact, financial, and governance information.</li>
              <li><strong>Accounts & Audit Regulations 2015</strong> — requirement to publish Annual Governance & Accountability Return (AGAR).</li>
              <li><strong>Localism Act 2011</strong> — member conduct, interests, and register publication.</li>
              <li><strong>Public Sector Bodies (Websites & Mobile Applications) Accessibility Regulations 2018</strong> — WCAG 2.1 AA compliance and accessibility statement requirement.</li>
            </ul>
          </div>
        </section>

        {/* ─── Sector literature ──────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">Sector literature and guidance we've drawn on</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "NALC Good Councillor Guide (2022)",
                body: "Recognised as the sector standard for local council good practice. Informed our interpretation of what 'transparency' means in a parish context.",
                link: "https://www.nalc.gov.uk/",
              },
              {
                title: "SLCC Practitioners' Guidance",
                body: "Sector-leading publications on clerk roles, governance, and transparency from the Society of Local Council Clerks.",
                link: "https://www.slcc.co.uk/",
              },
              {
                title: "JPAG Practitioners' Guide",
                body: "The Joint Panel on Accountability and Governance guidance for smaller authorities on audit and financial management.",
                link: "https://www.jpag.org.uk/",
              },
              {
                title: "ICO Model Publication Scheme",
                body: "The Information Commissioner's Office model scheme for local public authority information disclosure and FOIA compliance.",
                link: "https://ico.org.uk/for-organisations/information-rights-and-data-protection/",
              },
            ].map((item, i) => (
              <Card key={i} className="p-5 border-slate-200 bg-white">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.body}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="text-xs">
                    Learn more <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Peer review ────────────────────────────────────── */}
        <section className="p-10 bg-accent/5 border border-accent/20 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-3">Peer review and external scrutiny</h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Council ClearSight v3's methodology has been audited for consistency and defensibility, but we're open to external critique. If you are an academic researcher, sector professional, or government analyst working in local government transparency, we invite you to review the methodology and submit feedback.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Published reviewers will be credited on the methodology page and invited to the annual methodology review board. This is how we keep the index honest.
              </p>
              <Link href="/contact?topic=peer-review">
                <Button size="sm">
                  Express interest in peer review <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Next steps ───────────────────────────────────────── */}
        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Next steps</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-semibold text-foreground mb-2">See the full methodology</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Read the complete VDTI v3 framework, all 14 indicator definitions, scoring formula, dispute process, and change control procedures.
              </p>
              <Link href="/methodology">
                <Button size="sm" variant="outline" className="w-full">
                  Read methodology <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="font-semibold text-foreground mb-2">Check your council</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Find your council in the directory and see the complete evidence dossier: which documents we found, which we didn't, and why your score is what it is.
              </p>
              <Link href="/directory">
                <Button size="sm" variant="outline" className="w-full">
                  Find your council <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
