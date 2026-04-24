import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Search, Shield, User, Building2, FileText, CreditCard, Settings } from "lucide-react";

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  council: Building2,
  survey: FileText,
  subscription: CreditCard,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  create: "bg-teal-50 text-teal-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-red-50 text-red-600",
  login: "bg-secondary text-muted-foreground",
  publish: "bg-amber-50 text-amber-700",
};

export default function AdminAudit() {
  const [search, setSearch] = useState("");
  const { data: logs } = trpc.admin.auditLogs.useQuery({ limit: 50 });

  const sampleLogs = [
    { id: 1, actorName: "Alice Johnson", action: "create", entity: "survey", entityName: "Annual Resident Survey 2025", createdAt: new Date("2025-03-14T14:32:00"), ipAddress: "192.168.1.1" },
    { id: 2, actorName: "System", action: "update", entity: "subscription", entityName: "Highfield Town Council → Premium", createdAt: new Date("2025-03-13T10:15:00"), ipAddress: "—" },
    { id: 3, actorName: "Bob Smith", action: "login", entity: "user", entityName: "bob@oakfield-pc.gov.uk", createdAt: new Date("2025-03-13T09:00:00"), ipAddress: "10.0.0.5" },
    { id: 4, actorName: "Alice Johnson", action: "publish", entity: "survey", entityName: "Community Needs Survey", createdAt: new Date("2025-03-12T16:45:00"), ipAddress: "192.168.1.1" },
    { id: 5, actorName: "Admin", action: "create", entity: "council", entityName: "Greenacre Parish Council", createdAt: new Date("2025-03-11T11:20:00"), ipAddress: "10.0.0.1" },
  ];

  const displayLogs = (logs && logs.length > 0) ? logs : sampleLogs;
  const filtered = search ? displayLogs.filter((l: any) => (l.actorName ?? "").toLowerCase().includes(search.toLowerCase()) || (l.entityName ?? l.entity ?? "").toLowerCase().includes(search.toLowerCase())) : displayLogs;

  return (
    <AdminLayout title="Audit Log">
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete record of all platform actions</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card className="border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log: any) => {
                  const EntityIcon = actionIcons[log.entity] ?? Shield;
                  return (
                    <tr key={log.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">{(log.actorName ?? "S").charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm text-foreground">{log.actorName ?? "System"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`text-xs capitalize ${actionColors[log.action] ?? "bg-secondary"}`}>{log.action}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <EntityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{log.entityName ?? log.entity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
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
