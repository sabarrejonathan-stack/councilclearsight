import { Link } from "wouter";
import NewsletterSignup from "./NewsletterSignup";

const footerLinks = {
  Platform: [
    { label: "Council Directory", href: "/directory" },
    { label: "Council Scores", href: "/scores" },
    { label: "Methodology", href: "/methodology" },
    { label: "Pricing", href: "/pricing" },
    { label: "News & Insights", href: "/news" },
  ],
  "For Councils": [
    { label: "For Clerks", href: "/for-clerks" },
    { label: "Challenge a Score", href: "/challenge" },
    { label: "Register Interest", href: "/register-interest" },
    { label: "Features", href: "/features" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "About Council ClearSight", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo" aria-label="Site footer">
      {/* Newsletter strip */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-primary-foreground text-lg">The ClearSight Dispatch</h3>
              <p className="text-sm text-primary-foreground/60 max-w-sm">
                One email a month. Top movers, methodology updates, and the transparency practices separating Exemplary councils from the rest. Unsubscribe any time.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <NewsletterSignup variant="footer" source="footer" />
              <p className="text-xs text-primary-foreground/40 mt-2">
                Monthly insights for council professionals and engaged residents.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-semibold text-lg">Council ClearSight</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-4">
              An independent score for every parish, town, city and community council in England — the public proof councils are meeting their legal transparency duties.
            </p>
            <div className="space-y-1.5 text-xs text-primary-foreground/50 mb-5">
              <p>Council ClearSight Ltd</p>
              <p>Registered in England & Wales</p>
              <p>ICO registration in progress</p>
              <p>info@councilclearsight.org.uk</p>
            </div>
            <Link href="/directory">
              <span className="inline-block bg-[#2a9d8f] hover:bg-[#238b7e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer">
                View Scores →
              </span>
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold mb-4 text-primary-foreground/90">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/40 mb-6">
            <span>7,031 councils scored</span>
            <span className="hidden sm:inline">·</span>
            <span>4 pillars · 12 indicators · 100 points</span>
            <span className="hidden sm:inline">·</span>
            <span>VDTI v4.0</span>
            <span className="hidden sm:inline">·</span>
            <span>Refreshed April 2026</span>
            <span className="hidden sm:inline">·</span>
            <span>Every claim pinned to an evidence URL</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/50">
            &copy; {new Date().getFullYear()} Council ClearSight Ltd. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/50">
            Data processed in accordance with UK GDPR. Not affiliated with any local authority or government body.
          </p>
        </div>
      </div>
    </footer>
  );
}
