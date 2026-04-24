import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit, Eye, BookOpen, Clock, Globe } from "lucide-react";

const samplePosts = [
  { id: 1, title: "Getting started with engagement programmes", category: "Guides", status: "published", authorName: "Council ClearSight Team", publishedAt: new Date("2025-11-01"), readingTimeMinutes: 8, slug: "getting-started-engagement-programmes" },
  { id: 2, title: "Why fair benchmarking matters for local councils", category: "Methodology", status: "published", authorName: "Council ClearSight Team", publishedAt: new Date("2025-10-15"), readingTimeMinutes: 6, slug: "why-benchmarking-matters" },
  { id: 3, title: "The transparency code explained", category: "Best Practice", status: "draft", authorName: "Council ClearSight Team", publishedAt: null, readingTimeMinutes: 10, slug: "transparency-code-explained" },
];

export default function AdminBlog() {
  const [showEditor, setShowEditor] = useState(false);
  const [post, setPost] = useState({ title: "", excerpt: "", content: "", category: "Guides", status: "draft", authorName: "Council ClearSight Team", readingTimeMinutes: 5 });

  const { data: posts, refetch } = trpc.blog.list.useQuery({ limit: 50 });
  const displayPosts = (posts && posts.length > 0) ? posts : samplePosts;

  const handleSave = (status: "draft" | "published") => {
    if (!post.title) return;
    toast.info("Blog creation via admin panel — coming soon");
    setShowEditor(false);
  };

  return (
    <AdminLayout title="Blog & Resources">
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Blog & Resources</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage guides, case studies, and news articles</p>
          </div>
          <Button size="sm" onClick={() => setShowEditor(!showEditor)}>
            <Plus className="h-4 w-4 mr-1.5" />{showEditor ? "Cancel" : "New post"}
          </Button>
        </div>

        {/* Editor */}
        {showEditor && (
          <Card className="border-accent/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-foreground text-sm">New post</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Title *</Label>
                  <Input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} placeholder="Post title..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={post.category} onValueChange={(v) => setPost({ ...post, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Guides", "Case Studies", "Methodology", "Best Practice", "News"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Reading time (minutes)</Label>
                  <Input type="number" value={post.readingTimeMinutes} onChange={(e) => setPost({ ...post, readingTimeMinutes: parseInt(e.target.value) || 5 })} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Excerpt</Label>
                  <Textarea value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} rows={2} placeholder="Brief description shown in listings..." />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Content (Markdown)</Label>
                  <Textarea value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} rows={10} placeholder="Write your post content in Markdown..." className="font-mono text-xs" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => handleSave("draft")} disabled={!post.title}>Save draft</Button>
                <Button onClick={() => handleSave("published")} disabled={!post.title}>Publish</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts list */}
        <div className="space-y-2">
          {displayPosts.map((p) => (
            <Card key={p.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                        <Badge className={`text-xs ${((p as any).status === "published" || (p as any).isPublished) ? "bg-teal-50 text-teal-700" : "bg-secondary text-muted-foreground"}`}>
                          {(p as any).status ?? ((p as any).isPublished ? "published" : "draft")}
                        </Badge>
                        {p.readingTimeMinutes && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />{p.readingTimeMinutes} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => toast.info("Edit post — coming soon")}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {((p as any).status === "published" || (p as any).isPublished) && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/resources/${p.slug}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
