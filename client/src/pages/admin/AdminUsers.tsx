import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Search, Users, Shield, User } from "lucide-react";

const sampleUsers = [
  { id: 1, name: "Alice Johnson", email: "alice@thornbury-tc.gov.uk", role: "admin", councilName: "Thornbury Town Council", createdAt: new Date("2025-01-15"), lastSignedIn: new Date("2025-03-14") },
  { id: 2, name: "Bob Smith", email: "bob@oakfield-pc.gov.uk", role: "user", councilName: "Oakfield Parish Council", createdAt: new Date("2025-02-01"), lastSignedIn: new Date("2025-03-10") },
  { id: 3, name: "Carol Davies", email: "carol@millbrook-cc.gov.uk", role: "user", councilName: "Millbrook Community Council", createdAt: new Date("2025-02-20"), lastSignedIn: new Date("2025-03-05") },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const displayUsers = sampleUsers;
  const filtered = search ? displayUsers.filter((u: any) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) : displayUsers;

  return (
    <AdminLayout title="Users">
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All registered Council ClearSight users</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card className="border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Council</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last sign in</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{u.name?.charAt(0)?.toUpperCase() ?? "U"}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">
                        {u.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{(u as any).councilName ?? "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info("User management — coming soon")}>
                        Manage
                      </Button>
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
