/**
 * SampleReportModal — gated lead capture for sample CC-TI reports.
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
      a.download = `${council.slug}-CC-TI-sample-report.pdf`;
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
                    8 prioritised recommendations, peer benchmarking, demographic context, quarterly updates. £499/yr.
                  </p>
                </div>
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PDF generation — jsPDF + autoTable, fully client-side
// ─────────────────────────────────────────────────────────────────────

const NAVY: [number, number, number] = [15, 41, 66];
const TEAL: [number, number, number] = [42, 157, 143];
const SLATE: [number, number, number] = [100, 116, 139];
const ACCENT: [number, number, number] = [234, 88, 12];
const RED: [number, number, number] = [220, 38, 38];

function generateSamplePdf(c: CouncilScore): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 15;
  let y = 0;

  // ── Page 1 — Cover
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 70, "F");

  doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(255, 255, 255);
  doc.text("COUNCIL CLEARSIGHT", margin, 18);
  doc.setFont("helvetica", "normal").setFontSize(7);
  doc.text("Independent Transparency Assessment · CC-TI v3.0", margin, 23);

  doc.setFont("helvetica", "bold").setFontSize(20);
  doc.text(c.name, margin, 40);
  doc.setFont("helvetica", "normal").setFontSize(9);
  const meta = [c.type.replace("_", " ") + " council", c.county, c.region].filter(Boolean).join(" · ");
  doc.text(meta, margin, 47);
  doc.setFontSize(8);
  doc.text("Sample Report · Refreshed April 2026", margin, 53);

  // Score circle
  doc.setFillColor(255, 255, 255);
  doc.circle(170, 37, 22, "F");
  doc.setFont("helvetica", "bold").setFontSize(28).setTextColor(...NAVY);
  doc.text(formatScore(c.score), 170, 40, { align: "center" });
  doc.setFontSize(7).setTextColor(...SLATE);
  doc.text("/100", 170, 47, { align: "center" });

  y = 85;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NAVY);
  doc.text(`Band: ${c.band}`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...SLATE);
  doc.text(`Rank ${c.rank_national ?? "—"} of 7,031 nationally${c.region ? ` · ${c.rank_region ?? "—"} in ${c.region}` : ""}`, margin, y);
  y += 4;
  doc.text(`Completeness: ${Math.round((c.completeness ?? 0) * 100)}% of indicators assessed`, margin, y);
  y += 12;

  // Pillar bars
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
  doc.text("Four-Pillar Performance Breakdown", margin, y);
  y += 6;
  ([1, 2, 3, 4] as const).forEach((p) => {
    const earned = c.pillar_earned[String(p)] ?? 0;
    const max = c.pillar_max_assessed[String(p)] ?? 0;
    const pct = max > 0 ? earned / max : 0;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...NAVY);
    doc.text(PILLAR_META[p].label, margin, y);
    doc.setFontSize(8).setTextColor(...SLATE);
    doc.text(`${earned} / ${max} (${Math.round(pct * 100)}%)`, pageW - margin, y, { align: "right" });
    doc.setFillColor(220, 220, 220).rect(margin, y + 2, pageW - 2 * margin, 2.5, "F");
    doc.setFillColor(...(pct >= 0.7 ? TEAL : pct >= 0.4 ? [245, 158, 11] : RED));
    doc.rect(margin, y + 2, (pageW - 2 * margin) * pct, 2.5, "F");
    y += 9;
  });

  y += 4;
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
  doc.text("Council Details", margin, y);
  y += 5;

  const websiteUrl = (c.indicators.find((i: any) => i.id === "1.1")?.input_snapshot as any)?.website_url || "Not on file";
  const cEmail = (c.indicators.find((i: any) => i.id === "2.1")?.input_snapshot as any)?.email || "Not on file";
  const clerk = (c.indicators.find((i: any) => i.id === "2.3")?.input_snapshot as any)?.clerk_name || "Not on file";
  autoTable(doc, {
    startY: y,
    head: [["Field", "Value"]],
    body: [
      ["Type", c.type.replace("_", " ")],
      ["County", c.county || "—"],
      ["Region", c.region || "—"],
      ["Website", String(websiteUrl)],
      ["Email", String(cEmail)],
      ["Clerk", String(clerk)],
    ],
    theme: "plain",
    styles: { fontSize: 8 },
    headStyles: { fillColor: NAVY, textColor: 255 },
  });

  // ── Page 2 — Indicator table
  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NAVY);
  doc.text("Transparency Indicators", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...SLATE);
  doc.text("Each row shows whether evidence was observed on the council's website during the assessment.", margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["#", "Indicator", "Status", "Score"]],
    body: c.indicators.map((ind: any) => [
      ind.id,
      ind.label,
      !ind.assessed ? "Not Assessed" : ind.earned > 0 ? "Found" : "Not found",
      `${ind.earned}/${ind.max_points}`,
    ]),
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 28 }, 3: { cellWidth: 18, halign: "right" } },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 2) {
        const v = String(data.cell.raw);
        if (v === "Found") data.cell.styles.textColor = TEAL;
        else if (v === "Not found") data.cell.styles.textColor = RED;
        else data.cell.styles.textColor = SLATE;
      }
    },
  });

  // ── Page 3 — Top recommendation + paywall
  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NAVY);
  doc.text("Top Improvement Opportunity", margin, y);
  y += 6;
  doc.setFontSize(9).setTextColor(...SLATE).setFont("helvetica", "normal");
  doc.text("This is the single highest-impact change available to this council based on the missing indicators.", margin, y);
  y += 8;

  const missing = c.indicators
    .filter((ind: any) => ind.assessed && ind.earned === 0)
    .sort((a: any, b: any) => b.max_points - a.max_points);
  const top = missing[0];

  doc.setDrawColor(...ACCENT).setFillColor(255, 247, 237);
  doc.roundedRect(margin, y, pageW - 2 * margin, 60, 3, 3, "FD");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
  doc.text(top ? `1. ${top.label}` : "1. Maintain current standards", margin + 5, y + 8);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...SLATE);
  doc.text(`Pillar: ${top ? PILLAR_META[top.pillar as 1|2|3|4].label : "—"}    +${top?.max_points ?? 0} pts available`, margin + 5, y + 13);
  doc.setTextColor(...NAVY);
  const recBody = top
    ? `Publish ${top.label.toLowerCase()} on the council's website. This is observable, statutorily required for councils above the £25,000 turnover threshold, and is one of the fastest single-action improvements to your CC-TI score. The Platinum tier provides the exact document templates, recommended URL paths and a draft of the resident-facing announcement.`
    : `This council is performing well across all assessed indicators. Platinum-tier subscribers receive proactive alerts when any indicator slips, plus a quarterly re-scoring cycle to demonstrate ongoing compliance to residents.`;
  const lines = doc.splitTextToSize(recBody, pageW - 2 * margin - 10);
  doc.text(lines, margin + 5, y + 22);

  y += 70;
  doc.setFillColor(248, 250, 252).setDrawColor(200, 200, 200);
  doc.roundedRect(margin, y, pageW - 2 * margin, 70, 3, 3, "FD");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...NAVY);
  doc.text("7 more prioritised recommendations", margin + 5, y + 10);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...SLATE);
  const lockedBody = "Available with a Council ClearSight Gold (£349/yr) or Platinum (£499/yr) subscription. Each recommendation is council-specific, cites a statute, names a target URL, and projects an exact CC-TI score impact.";
  doc.text(doc.splitTextToSize(lockedBody, pageW - 2 * margin - 10), margin + 5, y + 17);
  for (let i = 2; i <= 8; i++) {
    const ly = y + 30 + (i - 2) * 5;
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(margin + 5, ly, pageW - 2 * margin - 10, 3, 1, 1, "F");
  }

  // ── Page 4 — Subscription benefits
  doc.addPage();
  y = margin;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...NAVY);
  doc.text("What a Council ClearSight subscription gives you", margin, y);
  y += 8;
  autoTable(doc, {
    startY: y,
    head: [["Feature", "Gold £349/yr", "Platinum £499/yr"]],
    body: [
      ["Full evidence pack with source URLs", "Included", "Included"],
      ["Improvement roadmap", "Top 5 actions", "Top 12, quarter-sequenced"],
      ["Peer benchmarking", "3 matched peers", "10 peers + county/regional"],
      ["Resident-facing PDF summary", "Annual", "Quarterly + content blocks"],
      ["Score updates", "Annual + manual challenge", "Quarterly + change alerts"],
      ["Clerk improvement prompts", "Monthly tips", "Weekly + priority themes"],
      ["Resident survey templates", "Template library", "+ automated analysis"],
      ["LCAS evidence alignment", "Foundation + Quality", "+ Quality Gold"],
      ["Data export (CSV)", "Own score/evidence", "+ trend history"],
    ],
    theme: "striped",
    styles: { fontSize: 8 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, finalY, pageW - 2 * margin, 28, 3, 3, "F");
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(255, 255, 255);
  doc.text("Subscribing does not change the public score.", margin + 5, finalY + 9);
  doc.setFont("helvetica", "normal").setFontSize(8.5);
  const trustBody = "Every council page, score and evidence URL is publicly visible — forever. Subscription gives the council the tools and templates to identify and evidence improvements, not a privileged score.";
  doc.text(doc.splitTextToSize(trustBody, pageW - 2 * margin - 10), margin + 5, finalY + 16);

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(...SLATE);
    doc.text(`Council ClearSight · councilclearsight.org.uk · Sample Report for ${c.name}`, margin, 290);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, 290, { align: "right" });
  }

  return doc.output("blob");
}
