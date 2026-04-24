import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Search, Plus, Building2, Edit, Eye, CheckCircle2, XCircle, Upload } from "lucide-react";

const sampleCouncils = [
  { id: 1, name: "Thornbury Town Council", councilType: "town", county: "South Gloucestershire", region: "South West", isVerified: true, isPublic: true, subscriptionTier: "standard", slug: "thornbury-town-council" },
  { id: 2, name: "Oakfield Parish Council", councilType: "parish", county: "Oxfordshire", region: "South East", isVerified: true, isPublic: true, subscriptionTier: "essentials", slug: "oakfield-parish-council" },
  { id: 3, name: "Millbrook Community Council", councilType: "community", county: "Wiltshire", region: "South West", isVerified: false, isPublic: true, subscriptionTier: "free", slug: "millbrook-community-council" },
  { id: 4, name: "Highfield Town Council", councilType: "town", county: "Cheshire East", region: "North West", isVerified: true, isPublic: true, subscriptionTier: "premium", slug: "highfield-town-council" },
  { id: 5, name: "Greenacre Parish Council", councilType: "parish", county: "Norfolk", region: "East of England", isVerified: false, isPublic: false, subscriptionTier: "free", slug: "greenacre-parish-council" },
];

const tierColors: Record<string, string> = {
  free: "bg-secondary text-muted-foreground",
  essentials: "bg-blue-50 text-blue-700",
  standard: "bg-teal-50 text-teal-700",
  premium: "bg-amber-50 text-amber-700",
};

export default function AdminCouncils() {
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCouncil, setNewCouncil] = useState({ name: "", councilType: "parish", county: "", region: "", websiteUrl: "" });

  const { data: councils, refetch } = trpc.admin.councils.useQuery();
  const displayCouncils = (councils && councils.length > 0) ? councils : sampleCouncils;

  const createCouncil = trpc.admin.upsertCouncil.useMutation({
    onSuccess: () => { toast.success("Council created"); setShowAddDialog(false); refetch(); },
    onError: () => toast.error("Failed to create council"),
  });

  const handleCreate = () => {
    if (!newCouncil.name) return;
    const slug = newCouncil.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    createCouncil.mutate({ ...newCouncil, slug, councilType: newCouncil.councilType as any });
  };

  return (
    <AdminLayout title="Councils">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Councils</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage council profiles and public listings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("CSV import — coming soon")}>
              <Upload className="h-4 w-4 mr-1.5" />Import CSV
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add council</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add new council</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5">
                    <Label>Council name *</Label>
                    <Input value={newCouncil.name} onChange={(e) => setNewCouncil({ ...newCouncil, name: e.target.value })} placeholder="Thornbury Town Council" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Select value={newCouncil.councilType} onValueChange={(v) => setNewCouncil({ ...newCouncil, councilType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parish">Parish</SelectItem>
                          <SelectItem value="town">Town</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="neighbourhood">Neighbourhood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>County</Label>
                      <Input value={newCouncil.county} onChange={(e) => setNewCouncil({ ...newCouncil, county: e.target.value })} placeholder="South Gloucestershire" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Region</Label>
                    <Input value={newCouncil.region} onChange={(e) => setNewCouncil({ ...newCouncil, region: e.target.value })} placeholder="South West" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Website URL</Label>
                    <Input value={newCouncil.websiteUrl} onChange={(e) => setNewCouncil({ ...newCouncil, websiteUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <Button className="w-full" onClick={handleCreate} disabled={createCouncil.isPending || !newCouncil.name}>
                    {createCouncil.isPending ? "Creating..." : "Create council"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search councils..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card className="border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Council</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">County</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayCouncils.map((council) => (
                  <tr key={council.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                        <span className="font-medium text-foreground">{council.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs capitalize">{council.councilType}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{council.county}</td>
                    <td className="py-3 px-4">
                      <Badge className={`text-xs capitalize ${tierColors[(council as any).subscriptionTier ?? "free"] ?? "bg-secondary"}`}>
                        {(council as any).subscriptionTier ?? "free"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {(council as any).isVerified ? (
                          <span className="flex items-center gap-1 text-xs text-teal-600"><CheckCircle2 className="h-3.5 w-3.5" />Verified</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="h-3.5 w-3.5" />Unverified</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/council/${council.slug}`}><Eye className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Edit council — coming soon")}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
