/**
 * Challenge.tsx — public dispute submission form.
 *
 * Residents use this to challenge individual council scores. Accepts URL parameters
 * ?slug=...&indicator=1.1 (both optional).
 *
 * If slug is missing, show a council search first. The form is the most important
 * on the site — residents should be able to challenge any indicator in ~2 minutes.
 *
 * Submission target: trpc.challenges.submit
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, Clock, CheckCircle2, FileText, AlertCircle,
} from "lucide-react";

const INDICATORS = [
  { value: "1.1", label: "1.1 - Active council website" },
  { value: "1.2", label: "1.2 - Website on .gov.uk domain" },
  { value: "1.3", label: "1.3 - Accessibility statement published" },
  { value: "2.1", label: "2.1 - General council email" },
  { value: "2.2", label: "2.2 - Phone number" },
  { value: "2.3", label: "2.3 - Named clerk" },
  { value: "2.4", label: "2.4 - Clerk email" },
  { value: "3.1", label: "3.1 - Meeting agendas published" },
  { value: "3.2", label: "3.2 - Meeting minutes published" },
  { value: "3.3", label: "3.3 - Financial documents (AGAR)" },
  { value: "4.1", label: "4.1 - Chair/Mayor named" },
  { value: "4.2", label: "4.2 - At least three councillors listed" },
  { value: "4.3", label: "4.3 - Councillor contact methods published" },
  { value: "4.4", label: "4.4 - Register of interests published" },
  { value: "overall", label: "Overall score" },
  { value: "missing-council", label: "The council is missing entirely from our index" },
];

export default function Challenge({ params }: { params: { slug?: string } }) {
  const location = useLocation();
  const [councilSlug, setCouncilSlug] = useState(params?.slug || "");
  const [councilSearch, setCouncilSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    indicator: new URL(window?.location?.href || "").searchParams.get("indicator") || "",
    relationship: "",
    evidenceType: "url",
    evidenceUrl: "",
    evidenceText: "",
    email: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useSEO({
    title: councilSlug ? `Challenge a score — ${councilSlug} | Council ClearSight` : "Challenge a score — Council ClearSight",
    description: "Submit evidence to challenge a council's transparency score. We respond within 5 working days.",
    canonicalPath: "/challenge" + (councilSlug ? `/${councilSlug}` : ""),
  });

  // Simulate council search {/* placeholder — connect to trpc.councils.search */}
  const handleCouncilSearch = async (query: string) => {
    setCouncilSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    // {/* placeholder — this would call trpc.councils.search(query) */}
    console.log("Search for councils:", query);
  };

  const handleSelectCouncil = (slug: string) => {
    setCouncilSlug(slug);
    setSearchResults([]);
    setCouncilSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.consent || !formData.indicator) {
      setError("Please fill in all required fields and accept the consent checkbox.");
      return;
    }

    try {
      // {/* placeholder — trpc.challenges.submit call */}
      console.log("Submitting challenge:", {
        council_slug: councilSlug,
        indicator: formData.indicator,
        relationship: formData.relationship,
        evidence_type: formData.evidenceType,
        evidence_url: formData.evidenceUrl,
        evidence_text: formData.evidenceText,
        email: formData.email,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit challenge. Please try again.");
    }
  };

  // If no council selected, show search first
  if (!councilSlug) {
    return (
      <PublicLayout>
        <section className="container max-w-2xl py-16">
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Challenge a score
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Found an inaccuracy in a council's score? Submit evidence and we'll respond within 5 working days.
            </p>
          </div>

          <Card className="p-8 bg-slate-50 border-slate-200 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">First, find your council</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="council-search" className="text-sm font-semibold">
                  Council name or location
                </Label>
                <Input
                  id="council-search"
                  type="text"
                  placeholder="e.g. Kendal Town Council, Oxfordshire"
                  value={councilSearch}
                  onChange={(e) => handleCouncilSearch(e.target.value)}
                  className="text-sm"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  {searchResults.map((council) => (
                    <button
                      key={council.slug}
                      onClick={() => handleSelectCouncil(council.slug)}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-white hover:border-primary/40 transition-colors"
                    >
                      <div className="font-semibold text-foreground text-sm">{council.name}</div>
                      <div className="text-xs text-muted-foreground">{council.type} · {council.region}</div>
                    </button>
                  ))}
                </div>
              )}

              {councilSearch.length > 0 && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No councils found. Try a different search term.
                </p>
              )}
            </div>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Can't find your council?
            </p>
            <Button onClick={() => handleSelectCouncil("missing")} variant="outline">
              Report a missing council <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  // Council selected — show the form
  return (
    <PublicLayout>
      <section className="container max-w-3xl py-16">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Challenge a score
          </h1>
          <p className="text-muted-foreground text-sm">
            {councilSlug === "missing" ? "Report a council missing from our index" : `Challenging score for ${councilSlug}`}
          </p>
        </div>

        {/* SLA card */}
        <Card className="p-6 bg-primary/5 border-primary/20 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">5 working days</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We review every challenge and publish the decision, evidence considered, and any resulting score delta. All disputes are logged to our public <a href="/methodology#disputes" className="text-accent hover:underline">disputes queue</a>.
              </p>
            </div>
          </div>
        </Card>

        {/* Main form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Council (show if pre-filled or allow change) */}
            {councilSlug !== "missing" && (
              <div className="space-y-2">
                <Label htmlFor="council-display" className="text-sm font-semibold">
                  Council
                </Label>
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-sm text-foreground font-medium">
                  {councilSlug}
                </div>
                <button
                  type="button"
                  onClick={() => setCouncilSlug("")}
                  className="text-xs text-accent hover:underline"
                >
                  Change council
                </button>
              </div>
            )}

            {/* Which indicator */}
            <div className="space-y-2">
              <Label htmlFor="indicator" className="text-sm font-semibold">
                Which {councilSlug === "missing" ? "aspect" : "indicator"} are you challenging?
              </Label>
              <Select value={formData.indicator} onValueChange={(v) => setFormData({ ...formData, indicator: v })}>
                <SelectTrigger id="indicator" className="text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {INDICATORS.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Not sure which indicator? <a href="/methodology" className="text-accent hover:underline">Read the methodology</a>.
              </p>
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-sm font-semibold">
                Your relationship to the council
              </Label>
              <Select value={formData.relationship} onValueChange={(v) => setFormData({ ...formData, relationship: v })}>
                <SelectTrigger id="relationship" className="text-sm">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="clerk">Clerk</SelectItem>
                  <SelectItem value="chair">Chair</SelectItem>
                  <SelectItem value="councillor">Councillor</SelectItem>
                  <SelectItem value="officer">Officer of another council</SelectItem>
                  <SelectItem value="journalist">Journalist</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Evidence */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Your evidence (required — at least one)</Label>

              {/* Evidence type selector */}
              <div className="flex gap-3 border-b border-slate-200">
                {[
                  { value: "url", label: "URL" },
                  { value: "file", label: "File/Screenshot" },
                  { value: "text", label: "Description" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, evidenceType: type.value })}
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                      formData.evidenceType === type.value
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {formData.evidenceType === "url" && (
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://council-website.gov.uk/minutes"
                    value={formData.evidenceUrl}
                    onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to the document, web page, or council resource.
                  </p>
                </div>
              )}

              {formData.evidenceType === "file" && (
                <div className="space-y-2 p-4 border-2 border-dashed border-slate-300 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{/* placeholder — file upload component */}</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, PDF (max 10 MB)</p>
                </div>
              )}

              {formData.evidenceType === "text" && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe the evidence, what you found, or why you believe the score is inaccurate."
                    value={formData.evidenceText}
                    onChange={(e) => setFormData({ ...formData, evidenceText: e.target.value })}
                    className="text-sm min-h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as specific as possible — page number, exact quote, or screenshot description.
                  </p>
                </div>
              )}
            </div>

            {/* Contact email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Your email (required)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                We only use this to send you the decision.
              </p>
            </div>

            {/* Consent */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                  I consent to my challenge, the evidence I submit, and the decision being published in our <a href="/methodology#disputes" className="text-accent hover:underline">public disputes queue</a>. My email will not be published.
                </Label>
              </div>
            </div>

            <Button size="lg" className="w-full" disabled={!formData.email || !formData.consent || !formData.indicator}>
              Submit challenge
            </Button>
          </form>
        ) : (
          /* Success state */
          <Card className="p-8 bg-emerald-50 border-emerald-200 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-emerald-950 mb-2">Challenge submitted</h2>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  Thanks for helping us improve the transparency index. We've received your challenge and will respond within 5 working days.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-emerald-200 space-y-4">
              <h3 className="font-semibold text-emerald-950">What happens next</h3>
              <ol className="space-y-3 text-sm text-emerald-900">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-950">1</span>
                  <span>We review your evidence against the indicator rule.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-950">2</span>
                  <span>We publish the decision with justification in the disputes queue.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-semibold text-emerald-950">3</span>
                  <span>If we accept the challenge, the score updates and we publish the audit delta.</span>
                </li>
              </ol>
            </div>

            <div className="pt-6 border-t border-emerald-200 space-y-3">
              <p className="text-xs text-emerald-900">
                <a href="/methodology" className="text-accent hover:underline inline-flex items-center gap-1">
                  <FileText className="w-3 h-3" /> View the full dispute queue
                </a>
              </p>
            </div>
          </Card>
        )}
      </section>
    </PublicLayout>
  );
}
