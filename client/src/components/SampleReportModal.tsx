/**
 * SampleReportModal — gated lead capture for sample VDTI reports.
 *
 * Static-site flow (no server, no tRPC):
 *   1. User clicks "Get sample report" CTA on a council profile.
 *   2. Modal opens with name/email/role form, council pre-filled.
 *   3. On submit: fires-and-forgets a Netlify Forms POST to capture the lead.
 *   4. Generates a 4-page PDF client-side using jsPDF + autoTable.
 *   5. Triggers download + shows confirmation panel with upsell CTAs.
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, BadgeCheck, Sparkles, FileDown, Loader2, CheckCircle2, Shield } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CouncilScore } from "@/lib/scoring";
import { PILLAR_META, formatScore } from "@/lib/scoring";

interface SampleReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  council: CouncilScore;
}

type Stage = "form" | "generating" | "done";

export default function SampleReportModal({ open, onOpenChange, council }: SampleReportModalProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("clerk");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStage("generating");

    // 1. Fire-and-forget the Netlify Forms POST so we capture the lead.
    const formBody = new URLSearchParams({
      "form-name": "sample-report-request",
      name, email, role,
      council_slug: council.slug,
      council_name: council.name,
      council_score: String(council.score ?? "n/a"),
    });
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formBody.toString() })
      .catch(() => { /* swallow — best-effort lead capture */ });

    // 2. Generate the PDF client-side.
    try {
      const blob = generateSamplePdf(council);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${council.slug}-VDTI-sample-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
    setStage("done");
  }

  function reset() {
    setStage("form");
    setName("");
    setEmail("");
    setRole("clerk");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); else onOpenChange(o); }}>
      <DialogContent className="max-w-md">
        {stage === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-accent" />
                Get the sample report for {council.name}
              </DialogTitle>
              <DialogDescription className="pt-2 leading-relaxed">
                A 4-page PDF with the score, pillar breakdown, indicator status and the highest-impact improvement opportunity for this council. Free, no payment, but we ask who you are.
              </DialogDescription>
            </DialogHeader>

            <form
              name="sample-report-request"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
              <input type="hidden" name="form-name" value="sample-report-request" />
              <p className="hidden"><label>Don't fill this: <input name="bot-field" /></label></p>

              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="you@example.gov.uk" />
              </div>

              <div>
                <Label>You are</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clerk">Clerk / Councillor</SelectItem>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="journalist">Journalist / Researcher</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="role" value={role} />
              </div>

              <input type="hidden" name="council_slug" value={council.slug} />
              <input type="hidden" name="council_name" value={council.name} />

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white">
                Send me the report <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="flex items-center gap-2 justify-center pt-1">
                <Shield className="w-3 h-3 text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground text-center">
                  We process your data under UK GDPR, lawful basis "legitimate interest". Unsubscribe any time.
                </p>
              </div>
            </form>
          </>
        )}

        {stage === "generating" && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-accent animate-spin" />
            <p className="text-sm font-medium">Generating your report…</p>
          </div>
        )}

        {stage === "done" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                Report downloaded
              </DialogTitle>
              <DialogDescription className="pt-2 leading-relaxed">
                Your 4-page sample report for <strong>{council.name}</strong> has been saved to your downloads folder. While you're here:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <Link href={`/pricing?claim=${council.slug}`} onClick={reset}>
                <div className="p-4 border-2 border-accent/40 bg-accent/5 rounded-xl cursor-pointer hover:border-accent transition">
                  <div className="flex items-center gap-2 mb-1">
                    <BadgeCheck className="w-4 h-4 text-accent" />
                    <span className="font-bold text-sm">If you're the clerk: claim this page</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Gold (£349/yr) lets you fix the contact data and get email alerts when anything changes.
                  </p>
                </div>
              </Link>

              <Link href="/pricing" onClick={reset}>
                <div className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="font-bold text-sm">Want the full Platinum report?</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    12 prioritised recommendations, peer benchmarking, demographic context, quarterly updates, automated resident engagement tools. £499/yr.
                  </p>
                </div>
              </Link>
            </div>

            <Button variant="outline" className="w-full mt-2" onClick={reset}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
