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
        <p className="text-sm text-emerald-900 leading-relaxed">
          Thank you. We will review your evidence within 5 working days and respond to the email you provided.
        </p>
      </Card>
    );
  }
  return null;
}
