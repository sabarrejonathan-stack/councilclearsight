/**
 * NotFound page (404) — friendly copy with helpful next steps.
 *
 * Guides users to the directory, regional browse, methodology, or
 * a "report missing council" challenge.
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import {
  ArrowLeft, Search, MapPin, FileText, Flag, Home,
} from "lucide-react";

export default function NotFound() {
  useSEO({
    title: "Page not found (404) — Council ClearSight",
    description: "This page isn't in our index. Try searching the directory or browsing by region.",
    canonicalPath: "/404",
  });

  return (
    <PublicLayout>
      <section className="container max-w-3xl py-20 text-center">
        {/* Hero */}
        <div className="mb-12">
          <div className="text-6xl font-bold text-muted-foreground/30 mb-4">404</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            This page isn't in our index.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            The page you're looking for doesn't exist, or it may have moved. But there are several ways we can help you find what you need.
          </p>
        </div>

        {/* Next steps */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Link href="/">
            <Card className="p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <Home className="w-6 h-6 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Back home</h3>
              <p className="text-xs text-muted-foreground">Start from the homepage.</p>
            </Card>
          </Link>

          <Link href="/directory">
            <Card className="p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <Search className="w-6 h-6 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Search the directory</h3>
              <p className="text-xs text-muted-foreground">Find a council by name or location.</p>
            </Card>
          </Link>

          <Link href="/directory?sort=region">
            <Card className="p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <MapPin className="w-6 h-6 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Browse by region</h3>
              <p className="text-xs text-muted-foreground">See all councils in your area.</p>
            </Card>
          </Link>

          <Link href="/methodology">
            <Card className="p-6 hover:border-primary/40 transition-colors cursor-pointer">
              <FileText className="w-6 h-6 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Learn how we score</h3>
              <p className="text-xs text-muted-foreground">Understand our methodology.</p>
            </Card>
          </Link>
        </div>

        {/* Missing council CTA */}
        <Card className="p-8 bg-primary/5 border-primary/20 mb-12">
          <Flag className="w-6 h-6 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-3">
            Is your council missing?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
            If a council isn't in our directory, you can help us find it. Submit a report and we'll investigate.
          </p>
          <Link href="/challenge?indicator=missing-council">
            <Button size="lg" className="mx-auto">
              Report a missing council
            </Button>
          </Link>
        </Card>

        {/* Support link */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-3">Still lost?</p>
          <Link href="/contact" className="text-accent hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3" /> Get in touch with us
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
