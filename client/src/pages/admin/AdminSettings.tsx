import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Settings, Sliders, Globe, Bell } from "lucide-react";

const methodologyWeights = [
  { pillar: "Digital Presence", key: "governance", weight: 25 },
  { pillar: "Contact Transparency", key: "resident_voice", weight: 25 },
  { pillar: "Governance & Compliance", key: "community_engagement", weight: 25 },
  { pillar: "Financial Accountability", key: "delivery", weight: 25 },
];

export default function AdminSettings() {
  return (
    <AdminLayout title="Settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Platform settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure Council ClearSight platform-wide settings</p>
        </div>

        <Tabs defaultValue="methodology">
          <TabsList>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="methodology" className="space-y-4 mt-4">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sliders className="h-4 w-4" />Pillar weightings
                </CardTitle>
                <p className="text-xs text-muted-foreground">Configure how each pillar contributes to the overall Council ClearSight score. Weights must sum to 100.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {methodologyWeights.map((p) => (
                  <div key={p.key} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-sm">{p.pillar}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue={p.weight} min={0} max={100} className="w-20 text-center" />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-sm font-semibold text-foreground">100%</span>
                </div>
                <Button size="sm" onClick={() => toast.info("Methodology settings saved (demo)")}>Save weightings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Platform settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Platform name</Label>
                  <Input defaultValue="Council ClearSight" />
                </div>
                <div className="space-y-1.5">
                  <Label>Support email</Label>
                  <Input defaultValue="info@councilclearsight.org.uk" />
                </div>
                <div className="space-y-1.5">
                  <Label>Default survey response target</Label>
                  <Input type="number" defaultValue={50} />
                </div>
                <Button size="sm" onClick={() => toast.info("Settings saved (demo)")}>Save settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card className="border-border/60">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Notification settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Configure when and how platform notifications are sent to admins and council users.</p>
                {[
                  "New council registration",
                  "Survey launched",
                  "Survey response milestone (50%, 100%)",
                  "New subscription",
                  "Subscription renewal reminder",
                  "Report generated",
                ].map((n) => (
                  <div key={n} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-sm text-foreground">{n}</span>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Notification settings — coming soon")}>Configure</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
