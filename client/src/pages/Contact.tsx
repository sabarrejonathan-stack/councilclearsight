/**
 * Contact page — general enquiries + Evidence Review form (April 2026 brief).
 *
 * Two forms:
 *   1. General enquiry (name, email, organisation, message, topic)
 *   2. Evidence review (name, email, phone, postcode, council, reviewer-type,
 *      feedback, evidence upload) — per April 2026 brief
 *
 * Both submit through Netlify Forms — hidden static form definitions in
 * client/index.html allow Netlify to detect them at build time.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowRight, Mail, FileText, Users, Clock, CheckCircle2, Upload, ShieldCheck,
} from "lucide-react";

type Tab = "general" | "evidence-review";

function encodeForNetlify(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key] || ""))
    .join("&");
}

export default function Contact() {
  useSEO({
    title: "Contact us — get in touch with Council ClearSight",
    description: "Submit a general enquiry, request a peer review of the methodology, or upload evidence to challenge a score. We aim to acknowledge enquiries within two working days.",
    canonicalPath: "/contact",
  });

  const [location] = useLocation();
  const [tab, setTab] = useState<Tab>("general");

  // Switch tab based on ?topic= query parameter
  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const topic = params.get("topic");
    if (topic === "peer-review" || topic === "evidence" || topic === "evidence-review") {
      setTab("evidence-review");
    }
  }, [location]);

  return (
    <PublicLayout>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 font-mono">Contact us</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.1]">Get in touch</h1>
          <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
            We review enquiries and score challenges through our standard process. We aim to acknowledge submissions within two working days.
          </p>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-4xl py-5">
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> info@councilclearsight.org.uk</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Two working days to acknowledge</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Submissions handled per UK GDPR</span>
          </div>
        </div>
      </section>

      {/* ── Tab switcher ───────────────────────────── */}
      <section className="container max-w-4xl py-10">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setTab("general")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${tab === "general" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Mail className="w-4 h-4 inline mr-2" /> General enquiry
          </button>
          <button
            onClick={() => setTab("evidence-review")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${tab === "evidence-review" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="w-4 h-4 inline mr-2" /> Evidence review
          </button>
        </div>

        {tab === "general" && <GeneralEnquiryForm />}
        {tab === "evidence-review" && <EvidenceReviewForm />}
      </section>
    </PublicLayout>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */
/* General Enquiry Form                                                      */
/* ───────────────────────────────────────────────────────────────────────── */

function GeneralEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForNetlify({
          "form-name": "general-enquiry",
          name,
          email,
          organisation,
          topic,
          message,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      setError("We couldn't submit your enquiry. Please email info@councilclearsight.org.uk directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-emerald-950 mb-2">Enquiry received</h2>
        <p className="text-sm text-emerald-900 max-w-md mx-auto">
          Thank you. We aim to acknowledge enquiries within two working days. If your message is urgent, please email info@councilclearsight.org.uk.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-7 bg-white border-slate-200">
      <h2 className="text-2xl font-bold mb-2">General enquiry</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Use this form for general questions, press enquiries, or to raise topics that are not specifically about a council's score.
      </p>

      <form
        name="general-enquiry"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input type="hidden" name="form-name" value="general-enquiry" />
        <p className="hidden"><label>Don't fill this: <input name="bot-field" /></label></p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ge-name">Your name *</Label>
            <Input id="ge-name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="ge-email">Email *</Label>
            <Input id="ge-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div>
          <Label htmlFor="ge-org">Organisation (optional)</Label>
          <Input id="ge-org" name="organisation" value={organisation} onChange={(e) => setOrganisation(e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label>Topic *</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General question</SelectItem>
              <SelectItem value="pricing">Pricing or subscription</SelectItem>
              <SelectItem value="bulk">Bulk arrangement (CALC, group of councils)</SelectItem>
              <SelectItem value="methodology">Methodology question</SelectItem>
              <SelectItem value="press">Press or partnership</SelectItem>
              <SelectItem value="data-correction">Data correction (non-score)</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="topic" value={topic} />
        </div>

        <div>
          <Label htmlFor="ge-message">Message *</Label>
          <Textarea id="ge-message" name="message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send enquiry"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          We'll acknowledge within two working days. Submissions are processed under UK GDPR.
        </p>
      </form>
    </Card>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */
/* Evidence Review Form (per April 2026 brief)                                */
/* Fields: name, email, phone, postcode, council, peer/external reviewer,    */
/*         feedback, evidence upload                                          */
/* ───────────────────────────────────────────────────────────────────────── */

function EvidenceReviewForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [councilName, setCouncilName] = useState("");
  const [reviewerType, setReviewerType] = useState("peer-reviewer");
  const [feedback, setFeedback] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form);
      // Netlify needs form-name in the body
      fd.append("form-name", "evidence-review");
      // Use multipart for file
      await fetch("/", { method: "POST", body: fd });
      setSubmitted(true);
    } catch (err) {
      setError("We couldn't submit your review. Please email info@councilclearsight.org.uk directly.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 text-center bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-emerald-950 mb-2">Review submitted</h2>
        <p className="text-sm text-emerald-900 max-w-md mx-auto">
          Thank you for your submission. Our methodology team will review your evidence and respond within two working days. Where evidence supports a change, the score may be updated through the standard review process and the decision logged publicly.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-7 bg-white border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="w-5 h-5 text-accent" />
        <h2 className="text-2xl font-bold">Evidence review</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Submit evidence to support a score correction, or register interest in peer-reviewing the methodology. Where public evidence supports a change, the score is updated through the standard review process and the decision is logged publicly.
      </p>

      <form
        name="evidence-review"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input type="hidden" name="form-name" value="evidence-review" />
        <p className="hidden"><label>Don't fill this: <input name="bot-field" /></label></p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="er-name">Your name *</Label>
            <Input id="er-name" name="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="er-email">Email address *</Label>
            <Input id="er-email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="er-phone">Telephone number</Label>
            <Input id="er-phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" placeholder="07xxx xxxxxx" />
          </div>
          <div>
            <Label htmlFor="er-postcode">Postcode</Label>
            <Input id="er-postcode" name="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="mt-1" placeholder="NE5 4AX" />
          </div>
        </div>

        <div>
          <Label htmlFor="er-council">Council you would like to review *</Label>
          <Input id="er-council" name="council_name" required value={councilName} onChange={(e) => setCouncilName(e.target.value)} className="mt-1" placeholder="e.g. Woolsington Parish Council" />
          <p className="text-[11px] text-muted-foreground mt-1">If you're not sure of the exact name, write it as you know it — we'll match it to the directory.</p>
        </div>

        <div>
          <Label className="mb-2 block">I am submitting as *</Label>
          <RadioGroup value={reviewerType} onValueChange={setReviewerType} name="reviewer_type" className="grid sm:grid-cols-2 gap-3">
            <Label htmlFor="er-peer" className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-accent transition">
              <RadioGroupItem id="er-peer" value="peer-reviewer" className="mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Peer reviewer</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Connected to the council (clerk, councillor, regular volunteer) and providing supporting evidence.</p>
              </div>
            </Label>
            <Label htmlFor="er-external" className="flex items-start gap-2.5 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-accent transition">
              <RadioGroupItem id="er-external" value="external-reviewer" className="mt-0.5" />
              <div>
                <div className="text-sm font-semibold">External reviewer</div>
                <p className="text-xs text-muted-foreground leading-relaxed">Resident, journalist, researcher or sector professional submitting independent evidence.</p>
              </div>
            </Label>
          </RadioGroup>
          <input type="hidden" name="reviewer_type" value={reviewerType} />
        </div>

        <div>
          <Label htmlFor="er-feedback">Your feedback / what you would like reviewed *</Label>
          <Textarea
            id="er-feedback"
            name="feedback"
            required
            rows={6}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-1"
            placeholder="Describe what indicator or score you would like us to review and why. The more specific you are about indicator number, evidence URL and date, the faster we can resolve."
          />
        </div>

        <div>
          <Label htmlFor="er-evidence">Upload supporting evidence (optional)</Label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id="er-evidence"
              type="file"
              name="evidence"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              onChange={(e) => setEvidenceFileName(e.target.files?.[0]?.name || "")}
              className="hidden"
            />
            <label htmlFor="er-evidence" className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-accent transition text-sm">
              <Upload className="w-4 h-4" />
              {evidenceFileName || "Choose file (PDF, DOCX, PNG, JPG)"}
            </label>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Maximum file size 10 MB. URLs to publicly published evidence work just as well — paste them in the feedback box above.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Submissions are processed under UK GDPR (lawful basis: legitimate interest). We aim to acknowledge within two working days.
        </p>
      </form>
    </Card>
  );
}
