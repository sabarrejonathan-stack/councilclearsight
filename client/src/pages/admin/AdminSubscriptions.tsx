import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";
import { Search, CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";

const sampleSubs = [
  { id: 1, councilName: "Thornbury Town Council", tier: "standard", status: "active", amount: 595, renewsAt: new Date("2026-03-01"), startedAt: new Date("2025-03-01") },
  { id: 2, councilName: "Oakfield Parish Council", tier: "essentials", status: "active", amount: 295, renewsAt: new Date("2026-01-15"), startedAt: new Date("2025-01-15") },
  { id: 3, councilName: "Highfield Town Council", tier: "premium", status: "active", amount: 995, renewsAt: new Date("2026-02-01"), startedAt: new Date("2025-02-01") },
  { id: 4, councilName: "Millbrook Community Council", tier: "free", status: "trial", amount: 0, renewsAt: null, startedAt: new Date("2025-03-10") },
  { id: 5, councilName: "Greenacre Parish Council", tier: "essentials", status: "cancelled", amount: 295, renewsAt: null, startedAt: new Date("2024-09-01") },
];

const tierColors: Record<string, string> = {
  free: "bg-secondary text-muted-foreground",
  essentials: "bg-blue-50 text-blue-700",
  standard: "bg-teal-50 text-teal-700",
  premium: "bg-amber-50 text-amber-700",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  active: CheckCircle2,
  trial: Clock,
  cancelled: XCircle,
  expired: XCircle,
};

export default function AdminSubscriptions() {
  const [search, setSearch] = useState("");
  const filtered = search ? sampleSubs.filter((s) => s.councilName.toLowerCase().includes(search.toLowerCase())) : sampleSubs;

  const totalMRR = sampleSubs.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0);
  const activeCount = sampleSubs.filter((s) => s.status === "active").length;

  return (
    <AdminLayout title="Subscriptions">
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage council subscriptions and billing</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active subscriptions", value: activeCount },
            { label: "Annual recurring revenue", value: `£${totalMRR.toLocaleString()}` },
            { label: "Trial accounts", value: sampleSubs.filter((s) => s.status === "trial").length },
          ].map((m) => (
            <Card key={m.label} className="border-border/60">
              <div className="p-4">
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Card className="border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Council</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Renews</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const StatusIcon = statusIcons[sub.status] ?? CreditCard;
                  return (
                    <tr key={sub.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground/60" />
                          <span className="font-medium text-foreground">{sub.councilName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`text-xs capitalize ${tierColors[sub.tier] ?? "bg-secondary"}`}>{sub.tier}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1 text-xs ${
                          sub.status === "active" ? "text-teal-600" :
                          sub.status === "trial" ? "text-amber-600" : "text-muted-foreground"
                        }`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {sub.amount > 0 ? `£${sub.amount}/yr` : "Free"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {sub.renewsAt ? new Date(sub.renewsAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast.info("Subscription management — coming soon")}>
                          Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
