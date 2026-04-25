/**
 * ClerkSuccess.tsx — post-subscription landing page.
 *
 * Clerks land here after buying a subscription. Warm welcome, next-step checklist,
 * and explanation of what changes with verification.
 *
 * Requires authentication to view (should be gated by middleware).
 */

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  CheckCircle2, Settings, BarChart2, Download, Users, Mail,
  ArrowRight, Zap, Lock, Eye, Share2,
} from "lucide-react";

export default function ClerkSuccess({ params }: { params?: { councilSlug?: string } }) {
  const [checklist, setChecklist] = useState({
    verifyDetails: false,
    reviewIndicators: false,
    downloadScorecard: false,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  useSEO({
    title: "Welcome — your council is verified | Council ClearSight",
    description: "You're now verified. Here's what's next.",
    canonicalPath: "/clerk/success",
  });

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      // {/* placeholder — send invite via trpc.clerk.sendInvite */}
      console.log("Sending invite to:", inviteEmail);
      setInviteSent(true);
      setInviteEmail("");
      setTimeout(() => setInviteSent(false), 3000);
    }
  };

  return (
    <PublicLayout>
      {/* ─── Hero section ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-b border-emerald-200 py-16">
        <div className="container max-w-3xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-950 mb-2">
                Welcome — you're verified.
              </h1>
              <p className="text-lg text-emerald-900 leading-relaxed">
                Your council page is now live and you have access to improvement tools and benchmarking. Here's what to do next.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-3xl py-16 space-y-16">

        {/* ─── Next steps checklist ────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Next steps</h2>
          <div className="space-y-3">
            {[
              {
                key: "verifyDetails",
                icon: Settings,
                title: "Verify your contact details",
                desc: "Make sure your email, phone, and clerk details are current.",
                action: "Go to settings",
              },
              {
                key: "reviewIndicators",
                icon: BarChart2,
                title: "Review each indicator on your page",
                desc: "See how we scored each pillar and what we have on file.",
                action: "View your profile",
              },
              {
                key: "downloadScorecard",
                icon: Download,
                title: "Download your printable scorecard",
                desc: "Share your score with the council, residents, or governing body.",
                action: "Download scorecard",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.key} className="p-5 bg-white hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleCheckboxChange(step.key as any)}
                      className="flex-shrink-0 mt-1"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        checklist[step.key as any]
                          ? "bg-emerald-100 border-emerald-500"
                          : "border-slate-300 hover:border-primary"
                      }`}>
                        {checklist[step.key as any] && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-accent" />
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.desc}</p>
                      <Link href="/dashboard/settings" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                        {step.action} <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ─── Invite colleagues ────────────────────────────────────────────── */}
        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Invite a colleague or councillor</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-2xl leading-relaxed">
            Share your council page and improvements tools with other clerks, chairs, or councillors on your council. Each invited user gets the same access and can make changes.
          </p>
          <Card className="p-6 bg-slate-50 border-slate-200">
            <form onSubmit={handleInvite} className="flex gap-3">
              <Input
                type="email"
                placeholder="colleague@council.gov.uk"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 text-sm"
                required
              />
              <Button size="sm">
                Send invite <Mail className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
            {inviteSent && (
              <p className="text-xs text-emerald-700 mt-3">Invite sent!</p>
            )}
          </Card>
        </section>

        {/* ─── Public vs. subscriber features ───────────────────────────────── */}
        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">What's different now</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-2xl leading-relaxed">
            Your council page is live and public. Here's what residents see vs. what you see as a subscriber:
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Public view */}
            <Card className="p-6 border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-foreground">What the public sees</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Your council's VDTI score and ranking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Every indicator with the exact data we have on file</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Links to contact you or challenge a score</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>A plain-English explanation of how the score is calculated</span>
                </li>
              </ul>
            </Card>

            {/* Subscriber view */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">What you see as a subscriber</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Quarterly rescoring (vs. annual for the public)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Personalised improvement roadmap by indicator</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Benchmarking against similar councils</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Direct verification of documents you think we missed</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Embeddable verified badge for your website</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <Badge className="bg-accent/20 text-accent border-accent/30 font-mono tracking-wide">Important</Badge>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Everyone sees the same score.</span> Subscribers pay for improvement tools and faster rescoring, not a different number. This is our "honesty rule" — transparency all the way down.
              </div>
            </div>
          </div>
        </section>

        {/* ─── Support & account ────────────────────────────────────────────── */}
        <section className="border-t border-border pt-12 space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Support & account management</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <Settings className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-2">Account settings</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Update payment, billing, or invite new users.
              </p>
              <Link href="/dashboard/settings" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                Go to settings <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>

            <Card className="p-5">
              <Share2 className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-2">Share your score</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Copy the shareable link to your public council page.
              </p>
              <button className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                Copy link <ArrowRight className="w-3 h-3" />
              </button>
            </Card>

            <Card className="p-5">
              <Mail className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-2">Need help?</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Email our support team with questions.
              </p>
              <a href="mailto:support@councilclearsight.org.uk" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                Contact support <ArrowRight className="w-3 h-3" />
              </a>
            </Card>

            <Card className="p-5">
              <BarChart2 className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-2">View your profile</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                See your council page as the public sees it.
              </p>
              <Link href="/directory" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                View profile <ArrowRight className="w-3 h-3" />
              </Link>
            </Card>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
        <section className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">FAQs</h2>
          <div className="space-y-4">
            {[
              {
                q: "When is my next rescoring?",
                a: "As a subscriber, your council will be rescored quarterly (every 3 months). The public is rescored annually. The next rescoring date will show in your dashboard.",
              },
              {
                q: "Can I change my contact details?",
                a: "Yes. Go to Account Settings and update your email, phone, or clerk name. Changes are published within 24 hours.",
              },
              {
                q: "What if I think we publish something the scoring algorithm missed?",
                a: "You can request direct verification. Upload the document or URL in your dashboard and we'll review it within 2 working days.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, any time. Visit your account settings and click 'Cancel subscription'. Your access remains active until the end of your billing period.",
              },
              {
                q: "Will my score ever go down after I subscribe?",
                a: "Your score reflects public data, not your subscriber status. If we discover missing data during rescoring, your score may change. This is always published with full explanation.",
              },
            ].map((faq, idx) => (
              <details key={idx} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold text-foreground text-sm transition-colors">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="p-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
