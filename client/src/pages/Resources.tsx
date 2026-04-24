import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Clock } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const categories = ["All", "Guides", "Case Studies", "Methodology", "Best Practice", "News"];

const samplePosts = [
  {
    id: 1, slug: "getting-started-engagement-programmes", title: "Getting started with resident engagement programmes: a guide for parish clerks",
    excerpt: "A practical guide to building a structured resident engagement programme for your parish or town council.",
    category: "Guides", authorName: "Council ClearSight Team", readingTimeMinutes: 8, publishedAt: new Date("2025-11-01"),
  },
  {
    id: 2, slug: "why-benchmarking-matters", title: "Why fair benchmarking matters for local councils",
    excerpt: "Understanding how peer comparison can help councils identify strengths, prioritise improvements, and communicate their value.",
    category: "Methodology", authorName: "Council ClearSight Team", readingTimeMinutes: 6, publishedAt: new Date("2025-10-15"),
  },
  {
    id: 3, slug: "transparency-code-explained", title: "The transparency code explained: what parish councils need to publish",
    excerpt: "A plain-English overview of the Local Government Transparency Code and what it means for parish and town councils.",
    category: "Best Practice", authorName: "Council ClearSight Team", readingTimeMinutes: 10, publishedAt: new Date("2025-10-01"),
  },
  {
    id: 4, slug: "improving-resident-engagement", title: "Five practical ways to improve resident engagement",
    excerpt: "Evidence-based strategies for reaching more residents, strengthening community engagement, and building public trust.",
    category: "Best Practice", authorName: "Council ClearSight Team", readingTimeMinutes: 7, publishedAt: new Date("2025-09-15"),
  },
  {
    id: 5, slug: "annual-report-guide", title: "How to produce an annual report that residents will actually read",
    excerpt: "Tips for creating a clear, engaging annual report that communicates your council's work and builds public confidence.",
    category: "Guides", authorName: "Council ClearSight Team", readingTimeMinutes: 9, publishedAt: new Date("2025-09-01"),
  },
  {
    id: 6, slug: "case-study-thornbury", title: "Case study: how Thornbury Town Council improved its Council ClearSight score",
    excerpt: "A look at how one town council used Council ClearSight to identify priorities, act on feedback, and demonstrate improvement.",
    category: "Case Studies", authorName: "Council ClearSight Team", readingTimeMinutes: 5, publishedAt: new Date("2025-08-15"),
  },
];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: posts } = trpc.blog.list.useQuery({ limit: 20 });
  const displayPosts = (posts && posts.length > 0) ? posts : samplePosts;

  const filtered = activeCategory === "All"
    ? displayPosts
    : displayPosts.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      <section className="bg-primary py-20 lg:py-28">
        <div className="container max-w-3xl">
          <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 hover:bg-accent/20">Resources & insights</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Guides, insights, and best practice for local councils
          </h1>
          <p className="text-xl text-white/75 leading-relaxed">
            Practical resources to help parish and town councils listen better, communicate more effectively, and demonstrate their value.
          </p>
        </div>
      </section>

      <section className="bg-white border-b border-border py-4 sticky top-16 z-40">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link key={post.id} href={`/resources/${post.slug}`}>
                <Card className="border-border/60 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      {post.readingTimeMinutes && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{post.readingTimeMinutes} min read
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm leading-tight flex-1">{post.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-muted-foreground">{post.authorName}</span>
                      <span className="text-xs text-accent font-medium flex items-center gap-1">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-secondary/30">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Never miss an insight</h2>
            <p className="text-muted-foreground text-sm">Get the latest council transparency research, ranking updates, and case studies delivered to your inbox.</p>
          </div>
          <NewsletterSignup variant="inline" source="resources-page" />
        </div>
      </section>
    </PublicLayout>
  );
}


