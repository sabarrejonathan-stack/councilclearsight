/**
 * Legal page — privacy policy, terms of use, accessibility, and cookie policy.
 *
 * Uses tabbed interface for clarity. All content structured for plain English
 * readability while maintaining UK GDPR compliance.
 *
 * Placeholders for organisation-specific details (company registration,
 * ICO reference, registered address) to be supplied by the user.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ExternalLink, Shield, FileText, Accessibility, Cookie } from "lucide-react";

export default function Legal() {
  useSEO({
    title: "Legal — Council ClearSight",
    description: "Privacy policy, terms of use, accessibility statement, and cookie notice.",
    canonicalPath: "/legal",
  });

  return (
    <PublicLayout>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="container max-w-4xl py-12">
          <h1 className="text-3xl font-bold text-foreground mb-3">Legal</h1>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Transparency in how we handle your data, our terms of service, and our commitment to accessibility.
          </p>
        </div>
      </section>

      <div className="container max-w-4xl py-12">
        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs sm:text-sm">
              <Accessibility className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Accessibility</span>
            </TabsTrigger>
            <TabsTrigger value="cookies" className="text-xs sm:text-sm">
              <Cookie className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cookies</span>
            </TabsTrigger>
          </TabsList>

          {/* ─── Privacy Policy ───────────────────────────────────────── */}
          <TabsContent value="privacy" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Privacy policy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Last updated: {/* placeholder — user to supply date */}
              </p>

              <div className="prose prose-sm max-w-none space-y-6 text-foreground">
                {/* Who we are */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Who we are</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {/* placeholder — user to supply legal entity name, company registration number, and address */}
                    Council ClearSight (registered company number {/* number here */}) operates the website councilclearsight.org.uk and the Council ClearSight Transparency Index (VDTI).
                  </p>
                </div>

                {/* What data we process */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">What data we collect and process</h3>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Public register data</h4>
                      <p className="leading-relaxed">
                        We collect and publish publicly available information about English parish, town, community, and city councils: names, contact details (email, phone), website URLs, and governance artefacts (published meeting minutes, financial statements, register of interests). These data are sourced from council websites, the Public Register of Charities, and public APIs. We do not request any of this data directly from councils.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Subscriber information</h4>
                      <p className="leading-relaxed">
                        If you purchase a subscription (a verified council page), we process:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                        <li>Your name and email address (required to create your account)</li>
                        <li>Your council's official details (to verify your identity as a representative of that council)</li>
                        <li>Payment information (processed by our payment provider; we never store your full card details)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Contact and challenge submissions</h4>
                      <p className="leading-relaxed">
                        When you complete a contact form or submit a challenge, we process the information you provide (name, email, organisation, message). We use this to respond to you and, in the case of challenges, to publish the decision and evidence reviewed — but we never publish your email address without your explicit consent.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Analytics (optional)</h4>
                      <p className="leading-relaxed">
                        We use Plausible Analytics (a privacy-respecting analytics service) to track page views, referrers, and user flow. Plausible does not use cookies or fingerprinting and does not track individuals. You can opt out on our cookie banner.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lawful basis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Our lawful basis under UK GDPR</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">Public interest (Article 6(1)(e)):</span> The processing of public register data is necessary to fulfil our public task of publishing a transparent, auditable score of council transparency. This is in the public interest and meets a legal obligation of public authorities under the Local Government Act 1972 and the Localism Act 2011.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Contract (Article 6(1)(b)):</span> Processing of subscriber information (name, email, payment) is necessary to perform the subscription contract.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Consent (Article 6(1)(a)):</span> Processing of contact form and challenge data relies on your consent as submitted.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Legitimate interest (Article 6(1)(f)):</span> We use analytics (Plausible) to understand how users interact with our site and improve service. This is in our legitimate interest and does not involve tracking individuals.
                    </div>
                  </div>
                </div>

                {/* Retention */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">How long we keep your data</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><span className="font-semibold text-foreground">Public register data:</span> Retained indefinitely and shown on each council's public page. The data itself is not personal data (it is information about councils, not individuals), but published email addresses and names may be identifiable. Residents and councils can request removal or correction via our challenge process.</li>
                    <li><span className="font-semibold text-foreground">Subscriber information:</span> Retained for as long as your subscription is active, plus 12 months after cancellation for financial record-keeping. You can request deletion via your account settings or by contacting us.</li>
                    <li><span className="font-semibold text-foreground">Contact and challenge submissions:</span> Retained for 24 months to defend against disputes. After that, we delete personal information but retain anonymised decision records (challenge outcome, indicator, evidence category) for public transparency.</li>
                    <li><span className="font-semibold text-foreground">Analytics data:</span> Aggregated and retained for 90 days. No individual user data is retained.</li>
                  </ul>
                </div>

                {/* Your rights */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your rights under UK GDPR</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong className="text-foreground">Correction:</strong> Ask us to correct inaccurate data.</li>
                    <li><strong className="text-foreground">Deletion:</strong> Request deletion ("right to be forgotten") in certain circumstances.</li>
                    <li><strong className="text-foreground">Restrict processing:</strong> Ask us to limit how we use your data.</li>
                    <li><strong className="text-foreground">Portability:</strong> Receive your data in a structured, portable format.</li>
                    <li><strong className="text-foreground">Withdraw consent:</strong> If we rely on consent, you can withdraw it at any time.</li>
                    <li><strong className="text-foreground">Lodge a complaint:</strong> Contact the Information Commissioner's Office (ICO) if you believe we've violated your rights.</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    To exercise any of these rights, contact us at {/* placeholder — user to supply privacy contact email */}.
                  </p>
                </div>

                {/* International transfers */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Data transfers outside the UK</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use third-party services (e.g., payment processing, analytics) which may process data outside the UK. All such transfers are either to countries with adequacy decisions (EU, etc.) or are protected by standard contractual clauses (SCCs) under UK GDPR Article 46.
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* ─── Terms of Use ───────────────────────────────────────── */}
          <TabsContent value="terms" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Terms of use</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Last updated: {/* placeholder — user to supply date */}
              </p>

              <div className="space-y-6 text-foreground">

                {/* Agreement */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">By using this site, you agree to these terms</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your access to and use of Council ClearSight is conditional on your acceptance of these terms. If you do not agree with any part, please do not use the site.
                  </p>
                </div>

                {/* Acceptable use */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptable use</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    You agree not to:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                    <li>Use the site for any illegal purpose or in violation of any laws.</li>
                    <li>Attempt to disrupt, impair, or overload the site's infrastructure.</li>
                    <li>Scrape or bulk-download data without permission. For legitimate research requests, contact us directly.</li>
                    <li>Impersonate a council representative or submit false information to gain verification.</li>
                    <li>Post threatening, abusive, or defamatory content.</li>
                  </ul>
                </div>

                {/* Subscription terms */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Subscription terms</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">Pricing:</span> Current subscription fees are displayed at checkout and in your account settings. We may update pricing with 30 days' written notice.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Billing:</span> Subscriptions renew automatically on the anniversary of your purchase. You will be notified of renewal at least 7 days before charging.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Cancellation:</span> You may cancel your subscription at any time via your account settings. Cancellation is effective at the end of your current billing period. No refund is issued for partial periods of an annual subscription.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">No score guarantee:</span> Subscribing to Council ClearSight does not change the public scoring rules and does not buy a higher score. The score reflects publicly observable evidence and is calculated identically for every council. Subscriptions are non-refundable on the basis of subsequent score movement.
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Service suspension:</span> We may suspend your subscription if payment fails or if you breach these terms. We will notify you before suspension.
                    </div>
                  </div>
                </div>

                {/* Intellectual property */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Intellectual property</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The Council ClearSight Transparency Index methodology is published on our website and is free to read, reference and quote for non-commercial purposes including journalism, academic research, and individual council use. Direct reproduction, adaptation for commercial purposes, or use in competing products requires written permission.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    The design and branding of the website are our copyright. You may not reproduce or distribute them without permission.
                  </p>
                </div>

                {/* Methodology changes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Changes to the methodology</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The VDTI methodology is versioned and published at <Link href="/methodology" className="text-accent hover:underline">/methodology</Link>. Updates are made through a transparent change-control process and announced at least 7 days in advance. Your score may change as a result of a methodology update; this is not grounds for a refund but we will explain the delta in a published blog post.
                  </p>
                </div>

                {/* Liability */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Limitation of liability</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To the fullest extent permitted by law, Council ClearSight and its contributors are not liable for:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-2 text-sm text-muted-foreground">
                    <li>Any indirect, incidental, or consequential damages (including lost profits or reputational harm).</li>
                    <li>Errors or omissions in the data or scores.</li>
                    <li>Interruptions or unavailability of the site.</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    Our total liability is limited to the amount you paid for your subscription in the past 12 months, if any.
                  </p>
                </div>

                {/* Indemnity */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Indemnity</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You agree to indemnify us against any claims arising from your misuse of the site or breach of these terms.
                  </p>
                </div>

                {/* Dispute resolution */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dispute resolution</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These terms are governed by the laws of England and Wales. Any disputes will be resolved in the courts of England and Wales.
                  </p>
                </div>

              </div>
            </section>
          </TabsContent>

          {/* ─── Accessibility ───────────────────────────────────────── */}
          <TabsContent value="accessibility" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Accessibility statement</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Last updated: {/* placeholder — user to supply date */}
              </p>

              <div className="space-y-6 text-foreground">

                <div>
                  <h3 className="text-lg font-semibold mb-3">Our commitment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Council ClearSight is committed to ensuring digital accessibility for people with disabilities. We aim to meet or exceed the Web Content Accessibility Guidelines (WCAG) version 2.2 at Level AA.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">What we've tested</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We regularly audit the site using:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                    <li>Automated tools (Axe DevTools, Lighthouse).</li>
                    <li>Manual testing with keyboard navigation and screen readers (NVDA, JAWS).</li>
                    <li>User testing with people who have disabilities.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Known issues and workarounds</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {/* placeholder — user to document any known accessibility gaps */}
                    We are not aware of any outstanding accessibility barriers that prevent users from accessing the core functionality of the site. If you encounter a problem, please let us know.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Reporting accessibility issues</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    If you encounter an accessibility barrier, please contact us:
                  </p>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
                    <div><span className="font-semibold text-foreground">Email:</span> {/* placeholder — accessibility contact email */}</div>
                    <div><span className="font-semibold text-foreground">Response time:</span> We aim to respond within 2 working days.</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Accessibility features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside ml-2">
                    <li>High-contrast text and focus indicators for keyboard users.</li>
                    <li>Semantic HTML and proper heading hierarchy.</li>
                    <li>Form labels and error messages clearly associated with inputs.</li>
                    <li>Data tables with proper headers and markup.</li>
                    <li>Alt text on all images and icons.</li>
                    <li>No content that flashes more than three times per second.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Third-party tools</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use third-party services (e.g., payment processing, analytics) which we have chosen based on their own accessibility practices. We are not responsible for the accessibility of external websites or services you may link to.
                  </p>
                </div>

              </div>
            </section>
          </TabsContent>

          {/* ─── Cookie Policy ────────────────────────────────────────── */}
          <TabsContent value="cookies" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookie notice</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Last updated: {/* placeholder — user to supply date */}
              </p>

              <div className="space-y-6 text-foreground">

                <div>
                  <h3 className="text-lg font-semibold mb-3">What are cookies?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cookies are small text files stored on your device by your browser. We use them to remember your preferences and authenticate your session.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Necessary cookies (always enabled)</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-semibold text-foreground mb-1">Session cookie (cc_session)</div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Stores your session ID so we can keep you logged in. Expires when you close your browser.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-semibold text-foreground mb-1">CSRF token (cc_csrf)</div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Protects against cross-site request forgery attacks. Required for form submission. Expires after 30 days.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    These cookies are necessary for the site to function and cannot be disabled.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Optional analytics cookies</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-semibold text-foreground mb-1">Plausible Analytics (plausible_session)</div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        We use Plausible Analytics to count page views and understand user journeys. Plausible does not use cookies to track individuals. It does not store any personally identifiable information. You can opt out on the cookie banner when you first visit.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">How to manage cookies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Most browsers allow you to control cookies through their settings. You can delete cookies at any time. Please note that disabling necessary cookies may affect the functionality of the site.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For more information about cookies, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">aboutcookies.org <ExternalLink className="w-3 h-3" /></a>.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Consent</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you first visit, we show a cookie banner asking for your consent to analytics cookies. Your choice is stored and respected for 12 months. You can change your preference at any time via your account settings or by contacting us.
                  </p>
                </div>

              </div>
            </section>
          </TabsContent>

        </Tabs>

        {/* ─── Support section ──────────────────────────────────────────── */}
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Questions or concerns?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            If you have questions about any of these policies or your data, please contact us:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-foreground mb-1">Privacy enquiries</div>
              <a href="mailto:privacy@councilclearsight.org.uk" className="text-accent hover:underline">privacy@councilclearsight.org.uk</a>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-1">General support</div>
              <a href="mailto:hello@councilclearsight.org.uk" className="text-accent hover:underline">hello@councilclearsight.org.uk</a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-6">
            {/* placeholder — user to supply ICO registration number and link */}
            We are registered with the Information Commissioner's Office (ICO) under registration number {/* I