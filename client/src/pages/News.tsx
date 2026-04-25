import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Clock, Newspaper, TrendingUp, Search } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const categories = [
  "All",
  "Transparency & Accountability",
  "Funding & Finance",
  "Community Engagement",
  "Governance & Compliance",
  "Digital & Innovation",
  "Best Practice",
];

export default function News() {
  useSEO({
      "title": "News | Council ClearSight — Parish Council Updates & Insights",
      "description": "Latest news and insights for parish and town councils. Policy updates, funding opportunities, governance best practices, and community engagement strategies.",
      "keywords": "parish council news, town council updates, local government news, council governance insights",
      "canonicalPath": "/news"
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ limit: 50 });


  const displayPosts = posts || [];
  const filtered = displayPosts.filter((p: any) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filtered[0];
  const remainingPosts = filtered.slice(1);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="h-8 w-8 text-accent" />
            <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/20">
              Updated daily
            </Badge>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Parish Council News & Insights
          </h1>
          <p className="text-xl text-white/75 leading-relaxed max-w-2xl">
            Expert analysis, policy updates, and practical guidance for parish and town councils across England. 
            Sourced from NALC, SLCC, LGA, and other authoritative bodies.
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="bg-white border-b border-border py-4 sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
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
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-border/60 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-secondary rounded-lg mb-4" />
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-3 bg-secondary rounded w-full mb-1" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery ? "Try adjusting your search terms." : "New articles are published daily. Check back soon."}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <Link href={`/news/${featuredPost.slug}`}>
                  <Card className="border-border/60 hover:shadow-lg hover:border-accent/30 transition-all cursor-pointer mb-8 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                      {featuredPost.coverImageUrl && (
                        <div className="h-48 md:h-full bg-secondary">
                          <img
                            src={featuredPost.coverImageUrl}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className={`p-8 flex flex-col justify-center ${!featuredPost.coverImageUrl ? "md:col-span-2" : ""}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-accent text-white text-xs">Latest</Badge>
                          {featuredPost.category && (
                            <Badge variant="secondary" className="text-xs">{featuredPost.category}</Badge>
                          )}
                          {featuredPost.readingTimeMinutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />{featuredPost.readingTimeMinutes} min read
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3 leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {featuredPost.publishedAt && new Date(featuredPost.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          <span className="text-sm text-accent font-medium flex items-center gap-1">
                            Read article <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              )}

              {/* Article Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post: any) => (
                  <Link key={post.id} href={`/news/${post.slug}`}>
                    <Card className="border-border/60 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer h-full overflow-hidden">
                      {post.coverImageUrl && (
                        <div className="h-40 bg-secondary">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-3">
                          {post.category && (
                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                          )}
                          {post.readingTimeMinutes && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />{post.readingTimeMinutes} min
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 text-sm leading-tight flex-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-muted-foreground">
                            {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </span>
                          <span className="text-xs text-accent font-medium flex items-center gap-1">
                            Read <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-primary/5 border-y border-border">
        <div className="container max-w-3xl text-center">
          <TrendingUp className="h-8 w-8 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How transparent is your council?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Council ClearSight ranks over 10,000 parish and town councils on transparency and accountability. 
            Check your council's VDTI score and see how it compares to peers across England.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/directory">
              <Button className="bg-accent hover:bg-accent/90 text-white">
                Find your council
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">
                View subscription plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-secondary/30">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Stay informed</h2>
            <p className="text-muted-foreground text-sm">
              Get the latest parish council news, transparency insights, and Council ClearSight updates delivered to your inbox.
            </p>
          </div>
          <NewsletterSignup variant="inline" source="news-page" />
        </div>
      </section>
    </PublicLayout>
  );
}
