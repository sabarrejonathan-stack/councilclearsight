import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Directory", href: "/directory" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Methodology", href: "/methodology" },
  { label: "Evidence", href: "/evidence" },
  { label: "For Clerks", href: "/for-clerks" },
  { label: "News", href: "/news" },
  { label: "Pricing", href: "/pricing" },
  { label: "Spotlight", href: "/spotlight" },
  { label: "Scores", href: "/scores" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur-sm" role="banner">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">CC</span>
          </div>
          <span className="font-semibold text-[17px] text-foreground tracking-tight">
            Council<span className="text-accent">ClearSight</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-2">
          <Button size="sm" asChild className="bg-[#2a9d8f] hover:bg-[#238b7e] text-white">
            <Link href="/directory">View Scores</Link>
          </Button>
          <Button size="sm" asChild className="bg-[#0f2942] hover:bg-[#1a3a5c] text-white">
            <Link href="/pricing">Subscribe</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="sm" className="px-2" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">CC</span>
              </div>
              <span className="font-semibold text-base">Council ClearSight</span>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild className="bg-[#2a9d8f] hover:bg-[#238b7e] text-white">
                <Link href="/directory" onClick={() => setOpen(false)}>View Scores</Link>
              </Button>
              <Button asChild className="bg-[#0f2942] hover:bg-[#1a3a5c] text-white">
                <Link href="/pricing" onClick={() => setOpen(false)}>Subscribe</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
