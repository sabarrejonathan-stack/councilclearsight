/**
 * Contact page — three routes for different stakeholder types.
 *
 * 1. Challenge a score (residents, journalists, clerks)
 * 2. Methodology & peer review (academics, auditors)
 * 3. Press & partnerships (NALC, CALC, journalists)
 *
 * Each route has its own form; contact details and SLAs are displayed.
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, Flag, Mail, FileText, Users, MapPin, Clock, CheckCircle2,
} from "lucide-react";

export default function Contact() {
  const [activeRoute, setActiveRoute] = useState<"challenge" | "methodology" | "press">("challenge");

  useSEO({
    title: "Contact us — Council ClearSight",
    description: "Report a dispute, ask methodology questions, or reach our press and partnerships team.",
    canonicalPath: "/contact",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-3xl relative">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Get in touch
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Whether you're challenging a score, asking about our methodology, or exploring partnerships — we're here to respond.
          </p>
        </div>
      </section>

      <div className="container max-w-4xl py-16 space-y-16">

        {/* ─── Route selector ───────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { id: "challenge", icon: Flag, label: "Challenge a score", desc: "Report an inaccuracy" },
            { id: "methodology", icon: FileText, label: "Methodology & review", desc: "Academics, auditors" },
            { id: "press", icon: Users, label: "Press & partnerships", desc: "Media, NALC, CALC" },
          ].map((route) => {
            const Icon = route.icon;
            const isActive = activeRoute === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setActiveRoute(route.id as any)}
                className={`p-4 rounded-xl border-2 transition-colors text-left ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white hover:border-primary/40"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <div className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                  {route.label}
                </div>
                <div className="text-xs text-muted-foreground">{route.desc}</div>
              </button>
            );
          })}
        </div>

        {/* ─── Challenge route ──────────────────────────────────────── */}
        {activeRoute === "challenge" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Challenge a score</h2>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                If you believe a council's score is incorrect — for example, if your council publishes documents we've not yet recorded — submit a challenge. We'll review your evidence and respond within 5 working days. All decisions are published in our public disputes queue.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <Card className="p-5">
                <Clock className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-1">SLA</h3>
                <p className="text-xs text-muted-foreground">We decide every challenge within 5 working days.</p>
              </Card>
              <Card className="p-5">
                <CheckCircle2 className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-1">Published</h3>
                <p className="text-xs text-muted-foreground">All decisions appear in the public disputes queue.</p>
              </Card>
              <Card className="p-5">
                <Mail className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-1">Private reply</h3>
                <p className="text-xs text-muted-foreground">We only use your email to respond — never published.</p>
              </Card>
            </div>

            <Card className="p-8 bg-slate-50 border-slate-200">
              <h3 className="text-lg font-semibold text-foreground mb-6">Submit a challenge</h3>
              <ChallengeForm />
            </Card>

            <p className="text-xs text-muted-foreground text-center">
              Read more about how challenges are reviewed on the <Link href="/methodology" className="text-accent hover:underline">methodology page</Link>.
            </p>
          </section>
        )}

        {/* ─── Methodology & peer review route ──────────────────────── */}
        {activeRoute === "methodology" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Methodology & peer review</h2>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                For academics, auditors, and statisticians with questions about our approach, statistical soundness, or data methodology. We welcome peer review and are committed to making our framework auditable.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <Card className="p-5 border-primary/30 bg-primary/5">
                <Mail className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-2">Email the editorial team</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Methodology critiques, peer-review offers, academic questions — straight to the editorial team.
                </p>
                <a href="mailto:review@councilclearsight.org.uk" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  review@councilclearsight.org.uk
                </a>
              </Card>
              <Card className="p-5">
                <FileText className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-sm text-foreground mb-2">Or send us a proposal</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  We reply within 2 working days. Accepted proposals sit in public comment for 7 days before taking effect.
                </p>
                <Link href="/methodology/changelog" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                  See past proposals <ArrowRight className="w-3 h-3" />
                </Link>
              </Card>
            </div>

            <Card className="p-8 bg-slate-50 border-slate-200">
              <h3 className="text-lg font-semibold text-foreground mb-6">Send us your question</h3>
              <MethodologyForm />
            </Card>
          </section>
        )}

        {/* ─── Press & partnerships route ───────────────────────────── */}
        {activeRoute === "press" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Press & partnerships</h2>
              <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                For journalists, NALC, CALC, and other strategic partners looking to collaborate, run joint research, or discuss integration.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <Card className="p-5">
                <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">Press</Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Story ideas, interviews, or fact-checking queries — we're available for comment.
                </p>
              </Card>
              <Card className="p-5">
                <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">Integration</Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Embedding scores, API access, or data partnerships with other civic tech projects.
                </p>
              </Card>
              <Card className="p-5">
                <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">Strategy</Badge>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Council sector insights, research collaboration, or market intelligence.
                </p>
              </Card>
            </div>

            <Card className="p-8 bg-slate-50 border-slate-200">
              <h3 className="text-lg font-semibold text-foreground mb-6">Get in touch with our partnerships team</h3>
              <PressForm />
            </Card>
          </section>
        )}

        {/* ─── Contact details ──────────────────────────────────────── */}
        <section className="border-t border-border pt-16">
          <h2 className="text-2xl font-bold text-foreground mb-8">Our contact details</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Postal address
              </h3>
              <address className="text-sm text-muted-foreground not-italic leading-relaxed space-y-1">
                <div>{/* placeholder — user to supply council name and address */}</div>
                <div>{/* placeholder — user to supply postcode */}</div>
              </address>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Response times
              </h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <span className="font-medium text-foreground">General inquiries:</span> 2 working days
                </div>
                <div>
                  <span className="font-medium text-foreground">Challenges:</span> 5 working days
                </div>
                <div>
                  <span className="font-medium text-foreground">Methodology review:</span> 2 working days
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
