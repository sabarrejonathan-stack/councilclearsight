/**
 * News page — curated transparency-sector article links.
 * Static-only (no backend) — seeded with credible sources per April 2026 brief.
 *
 * The articles array can be appended manually or via a daily content workflow.
 * Each post: source, title, excerpt, url, image (thumbnail), category, date.
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, Newspaper, ExternalLink, Search } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

interface NewsItem {
  source: string;
  title: string;
  excerpt: string;
  url: string;
  image: string;
  category: string;
  date: string;
}

// Curated seed articles (April 2026). Replace/append daily.
// Thumbnails use Unsplash + source-supplied images where available.
const ARTICLES: NewsItem[] = [
  {
    source: "GOV.UK",
    title: "Local Government Transparency Code 2015",
    excerpt: "The statutory transparency requirements every parish, town and city council in England must meet — including spending, contracts, governance and senior salaries.",
    url: "https://www.gov.uk/government/publications/local-government-transparency-code-2015",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    category: "Financial Accountability",
    date: "2026-04-20",
  },
  {
    source: "NALC",
    title: "Local Council Award Scheme — Foundation, Quality and Quality Gold",
    excerpt: "The National Association of Local Councils' three-tier accreditation scheme. Council ClearSight maps evidence to LCAS Foundation and Quality criteria — but does not award accreditation itself.",
    url: "https://www.nalc.gov.uk/our-work/improvement-and-development/local-council-award-scheme",
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&q=80",
    category: "Best Practice",
    date: "2026-04-18",
  },
  {
    source: "Local Government Association",
    title: "Resident Satisfaction Polling — Round 40",
    excerpt: "LGA's quarterly resident satisfaction tracker. Key finding: 49% of residents feel poorly informed about their council's work, and 53% believe their council acts on local concerns — both metrics that improved transparency directly addresses.",
    url: "https://www.local.gov.uk/our-support/research-and-publications",
    category: "Community Engagement",
    image: "https://images.unsplash.com/photo-1540908969701-acc5edc73efb?w=600&q=80",
    date: "2026-04-15",
  },
  {
    source: "ICO",
    title: "Updated guidance on the Freedom of Information Act for parish councils",
    excerpt: "The Information Commissioner's Office published updated practical guidance on FOI compliance for smaller authorities. Includes worked examples for publishing routine information proactively.",
    url: "https://ico.org.uk/for-organisations/foi/freedom-of-information-and-environmental-information-regulations/local-government-and-the-foi-eir/",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    category: "Transparency & Accountability",
    date: "2026-04-12",
  },
  {
    source: "DLUHC",
    title: "English Devolution and Community Empowerment Bill",
    excerpt: "The 2025-26 bill expanding council powers, with explicit reference to community engagement as a criterion for devolved responsibilities. Why structured engagement programmes are now a strategic asset for parish councils.",
    url: "https://www.gov.uk/government/publications/english-devolution-white-paper",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&q=80",
    category: "Funding & Finance",
    date: "2026-04-10",
  },
  {
    source: "SLCC",
    title: "Society of Local Council Clerks — clerk training and CPD update",
    excerpt: "The latest professional development requirements for parish and town clerks, including the CiLCA qualification and continuing professional development hours expected for accredited councils.",
    url: "https://www.slcc.co.uk/",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    category: "Best Practice",
    date: "2026-04-08",
  },
  {
    source: "Local Government Chronicle",
    title: "Why parish council precepts continue to rise faster than inflation",
    excerpt: "Analysis of NALC data showing parish precepts have risen by £654m over five years, with implications for resident scrutiny and the rising importance of independent transparency assessment.",
    url: "https://www.lgcplus.com/",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    category: "Funding & Finance",
    date: "2026-04-05",
  },
  {
    source: "Public Sector Executive",
    title: "Web accessibility regulations — what local councils still get wrong",
    excerpt: "Practical analysis of where the 2018 Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations bite hardest for parish council websites, and the specific fixes that move the needle.",
    url: "https://www.publicsectorexecutive.com/",
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    category: "Digital & Innovation",
    date: "2026-04-02",
  },
];

const categories = [
  "All",
  "Transparency & Accountability",
  "Funding & Finance",
  "Community Engagement",
  "Financial Accountability",
  "Digital & Innovation",
  "Best Practice",
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function News() {
  useSEO({
    title: "News & Insights | Council ClearSight — parish council transparency news",
    description: "Curated news and analysis for parish and town councils across England. Policy updates, funding announcements, governance best practice and resident-engagement insight.",
    keywords: "parish council news, town council updates, local government transparency news, NALC, SLCC, LGA",
    canonicalPath: "/news",
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter((a) => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = !search || (a.title + a.excerpt + a.source).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PublicLayout>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-5">
            <Newspaper className="w-7 h-7 text-accent" />
            <Badge className="bg-accent/20 text-accent border-accent/30">Updated regularly</Badge>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-[1.1]">News &amp; Insights</h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
            Curated news, policy updates and analysis for parish and town councils — from NALC, SLCC, LGA, GOV.UK and other authoritative sources.
          </p>
        </div>
      </section>

      {/* ── Search + categories ───────────────────── */}
      <section className="bg-white border-b border-slate-200 py-4 sticky top-16 z-40">
        <div className="container max-w-6xl flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-full border transition ${activeCategory === cat ? "bg-accent text-white border-accent" : "bg-white border-slate-200 text-muted-foreground hover:border-accent/40"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Article grid ─────────────────────────── */}
      <section className="container max-w-6xl py-12">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No articles match that filter. Try clearing the search or selecting "All".</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden bg-white border-slate-200 hover:shadow-lg hover:border-accent/40 transition h-full flex flex-col">
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <img
                    src={a.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to a stock placeholder if the image fails
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1481026469463-66327c86e544?w=600&q=80";
                    }}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2 text-[11px]">
                    <Badge variant="outline" className="font-mono">{a.source}</Badge>
                    <span className="text-muted-foreground">{formatDate(a.date)}</span>
                  </div>
                  <h3 className="font-bold text-base mb-2 leading-snug group-hover:text-accent transition">
                    {a.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{a.excerpt}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-muted-foreground">{a.category}</span>
                    <span className="text-xs text-accent font-semibold inline-flex items-center gap-1">
                      Read on {a.source} <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* ── Source note ───────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container max-w-4xl py-12">
          <div className="text-center mb-6">
            <Badge variant="outline" className="font-mono text-[10px] mb-3">About this page</Badge>
            <h2 className="text-2xl font-bold mb-3">Curated, not generated</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm">
              Every article links to its original source. We summarise what's relevant for parish and town councils — we do not republish full articles. Use this page as a daily five-minute briefing on what matters in the sector.
            </p>
          </div>
          <NewsletterSignup variant="inline" source="news-page" />
        </div>
      </section>
    </PublicLayout>
  );
}
