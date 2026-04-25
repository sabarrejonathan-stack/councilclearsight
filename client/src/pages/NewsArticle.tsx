import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/PublicLayout";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Clock, Calendar, User, ExternalLink, ArrowRight, TrendingUp } from "lucide-react";
import { Streamdown } from "streamdown";

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = trpc.blog.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Related articles
  const { data: relatedPosts } = trpc.blog.list.useQuery(
    { limit: 4, category: post?.category || undefined },
    { enabled: !!post?.category }
  );

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Council ClearSight News`;
      // Set meta description
      const existingDesc = document.querySelector('meta[name="description"]');
      if (existingDesc) existingDesc.remove();
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = (post as any).metaDescription || post.excerpt || post.title;
      document.head.appendChild(meta);
      // Set meta keywords
      const existingKw = document.querySelector('meta[name="keywords"]');
      if (existingKw) existingKw.remove();
      const keywords = document.createElement("meta");
      keywords.name = "keywords";
      keywords.content = (post as any).metaKeywords || "parish council, transparency, local government";
      document.head.appendChild(keywords);
      // OG tags
      const ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      ogTitle.content = post.title;
      document.head.appendChild(ogTitle);
      const ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      ogDesc.content = post.excerpt || post.title;
      document.head.appendChild(ogDesc);
      if (post.coverImageUrl) {
        const ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        ogImage.content = post.coverImageUrl;
        document.head.appendChild(ogImage);
      }
      return () => {
        document.querySelectorAll('meta[property^="og:"]').forEach(el => el.remove());
        document.querySelector('meta[name="description"]')?.remove();
        document.querySelector('meta[name="keywords"]')?.remove();
      };
    }
  }, [post]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="py-20">
          <div className="container max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-secondary rounded w-1/4" />
              <div className="h-10 bg-secondary rounded w-3/4" />
              <div className="h-64 bg-secondary rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded" />
                <div className="h-4 bg-secondary rounded w-5/6" />
                <div className="h-4 bg-secondary rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="py-20 text-center">
          <div className="container max-w-lg">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
            <p className="text-muted-foreground mb-6">This article may have been moved or removed.</p>
            <Link href="/news">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to news
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const related = relatedPosts?.filter((p: any) => p.slug !== slug).slice(0, 3) || [];
  const ctaText = (post as any).ctaText || "See how your council compares \u2014 check your free VDTI score on Council ClearSight.";

  return (
    <PublicLayout>
      {/* Article Header */}
      <article>
        <header className="bg-primary py-12 lg:py-16">
          <div className="container max-w-3xl">
            <Link href="/news">
              <button className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to news
              </button>
            </Link>
            <div className="flex items-center gap-2 mb-4">
              {post.category && (
                <Badge className="bg-accent/20 text-accent border-accent/30">{post.category}</Badge>
              )}
              {post.readingTimeMinutes && (
                <span className="flex items-center gap-1 text-sm text-white/60">
                  <Clock className="h-3.5 w-3.5" />{post.readingTimeMinutes} min read
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-white/75 leading-relaxed">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-4 mt-6 text-sm text-white/50">
              {post.authorName && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {post.authorName}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {(post as any).sourceName && (
                <span className="flex items-center gap-1">
                  Source: {(post as any).sourceName}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="bg-secondary -mt-2">
            <div className="container max-w-4xl">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-64 lg:h-96 object-cover rounded-b-lg shadow-lg"
              />
            </div>
          </div>
        )}

        {/* Article Body */}
        <div className="py-12">
          <div className="container max-w-3xl">
            <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground prose-li:text-muted-foreground">
              <Streamdown>{post.body}</Streamdown>
            </div>

            {/* CTA Box */}
            <Card className="mt-10 border-accent/30 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground font-medium mb-3">{ctaText}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/directory">
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                          Find your council <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                      <Link href="/pricing">
                        <Button size="sm" variant="outline">
                          View plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Attribution */}
            {(post as any).sourceUrl && (
              <div className="mt-6 text-xs text-muted-foreground">
                <a href={(post as any).sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent transition-colors">
                  <ExternalLink className="h-3 w-3" /> Original source: {(post as any).sourceName || "External"}
                </a>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="py-12 bg-secondary/30 border-t border-border">
          <div className="container">
            <h2 className="text-xl font-bold text-foreground mb-6">Related articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p: any) => (
                <Link key={p.id} href={`/news/${p.slug}`}>
                  <Card className="border-border/60 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer h-full">
                    {p.coverImageUrl && (
                      <div className="h-32 bg-secondary">
                        <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground text-sm mb-2 leading-tight">{p.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-12 bg-primary/5 border-t border-border">
        <div className="container max-w-2xl text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Never miss an update</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Get parish council news and Council ClearSight insights delivered to your inbox.
          </p>
          <Link href="/news">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> View all articles
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
