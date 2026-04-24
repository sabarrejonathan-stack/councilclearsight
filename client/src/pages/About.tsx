/**
 * About page — Council ClearSight (CC-TI v3)
 *
 * Who we are, why we exist, what we believe, and how to reach us.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, Eye, Lightbulb, Users, Target, Heart, Mail,
  ExternalLink, Globe, ShieldCheck, Sun,
} from "lucide-react";

export default function About() {
  useSEO({
    title: "About Council ClearSight — who we are and why we exist",
    description: "Council ClearSight built an independent transparency index for English parish, town and city councils because 10,000+ councils, £1bn+ precepts, and no independent observability layer left residents in the dark.",
    keywords: "Council ClearSight, team, mission, transparency, local government accountability",
    canonicalPath: "/about",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl relative">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.1]">
            Built by someone who spent too long searching for parish minutes.
          </h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            England has 10,000+ parish, town, city and community councils. They collectively hold more than £1bn in annual precept. Council ClearSight exists because the law already requires them to publish what we measure — we just make it visible, in one place, pinned to evidence.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl py-16 space-y-20">

        {/* ─── Why Council ClearSight exists ─────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-10">Why Council ClearSight exists</h2>
          <div className="space-y-6">
            {[
              {
                title: "10,000+ councils, no independent observability",
                body: "England has more than 10,000 parish, town, city and community councils. Residents have no single place to see which ones publish their minutes, which are reachable, which are transparent. Councils themselves have little idea how they compare to peers. As of April 2026 we've scored 7,031 of them; the remainder are being onboarded.",
              },
              {
                title: "£1 billion in precept, unscrutinised",
                body: "Parish and town councils collectively raise more than £1bn in annual precept. Yet the tools for residents, journalists and auditors to scrutinise that spend are fragmented, time-consuming, and often unreliable. Councils are already legally required to publish accounts — we just aggregate what's required into one searchable place.",
              },
              {
                title: "Clerks deserve better support",
                body: "Parish clerks are doing a hard job with little support. Many have no formal training and inherit decades of practice from their predecessors. They need independent feedback on what's working and what isn't, delivered without judgement and with the specific documents to publish next.",
              },
              {
                title: "Methodology has been a black box",
                body: "When a council receives a low transparency score elsewhere, there is rarely anywhere to go. Is it fair? How was it calculated? What would improve it? We publish every rule, every weight, every input snapshot, and the evidence URL for every score — on every council's page. No black box. No arbitrary judgements.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-3" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What we believe ──────────────────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">What we believe</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: Eye,
                title: "Public data is for the public",
                body: "Councils publish minutes, agendas and contact details as a matter of law. Those artefacts belong to the public. We believe in making them visible and queryable.",
              },
              {
                icon: ShieldCheck,
                title: "Methodology is a public artefact",
                body: "How a council is scored matters as much as the score itself. We publish every rule in plain English, every weight, and the exact evidence behind every score on every council's page. No black-box methodology — no score a resident or clerk can't trace back to something observable.",
              },
              {
                icon: Target,
                title: "Clerks are doing a hard job with little support",
                body: "Most parish clerks have no formal training and inherit decades of inherited practice. They deserve independent, fair feedback and tools to act on it — not judgement.",
              },
              {
                icon: Sun,
                title: "Sunlight compounds",
                body: "We have seen transparency initiatives work elsewhere (Charity Commission, UK Parliament, Companies House). Publishing what councils do, consistently and openly, changes behaviour better than any mandate.",
              },
              {
                icon: Heart,
                title: "We charge for help, not for truth",
                body: "Every council gets a public score, methodology, and challenge route for free. Subscribers pay for personalised improvement tools, verification support, and quarterly re-scoring — never for a different number.",
              },
              {
                icon: Globe,
                title: "This shouldn't be a business",
                body: "Ideally, UK government or the LGA would run the transparency index. Until then, a small independent team runs it cleanly, openly, and affordably so that councils and residents have no excuse to mistrust it.",
              },
            ].map((item, i) => (
              <Card key={i} className="p-6 border-slate-200 bg-white">
                <item.icon className="w-5 h-5 text-accent mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── The team ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">The team</h2>
          <Card className="p-8 border-slate-200 bg-gradient-to-br from-white to-slate-50">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 bg-accent/20 rounded-2xl flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">Jonathan Sabarre</h3>
                  <Badge variant="outline" className="text-xs">Founder & editorial lead</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Jonathan built the first transparency index after spending three hours searching for a single parish council's meeting minutes. He spent a decade in local government research and community activism. {/* [placeholder — clerk to edit: Prior roles, qualifications, publications] */}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  He commits to transparent methodology, fair attribution, and building something the sector actually needs rather than something profitable. {/* [placeholder — clerk to edit: add personal note about why this matters to Jonathan] */}
                </p>
              </div>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground mt-6 text-center">
            We're a small, independent team. More details about hiring and collaborators coming soon.
          </p>
        </section>

      </div>
    </PublicLayout>
  );
}
