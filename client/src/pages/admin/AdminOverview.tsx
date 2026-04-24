import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Building2, Users, CreditCard, ClipboardList, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const signupData = [
  { month: "Sep", councils: 4 }, { month: "Oct", councils: 7 }, { month: "Nov", councils: 5 },
  { month: "Dec", councils: 3 }, { month: "Jan", councils: 9 }, { month: "Feb", councils: 12 },
  { month: "Mar", councils: 8 },
];

export default function AdminOverview() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const metrics = [
    { label: "Total councils", value: stats?.totalCouncils ?? 47, icon: Building2, href: "/admin/councils", change: "+12 this month" },
    { label: "Active subscriptions", value: stats?.activeSubscriptions ?? 31, icon: CreditCard, href: "/admin/subscriptions", change: "+5 this month" },
    { label: "Total users", value: 89, icon: Users, href: "/admin/users", change: "+8 this month" },
    { label: "Surveys launched", value: stats?.totalSurveys ?? 24, icon: ClipboardList, href: "/admin/councils", change: "This year" },
  ];

  const recentActivity = [
    { action: "New council registered", detail: "Thornbury Town Council", time: "2 hours ago", type: "council" },
    { action: "Survey launched", detail: "Oakfield Parish Council — Annual Survey 2025", time: "5 hours ago", type: "survey" },
    { action: "Subscription upgraded", detail: "Highfield Town Council → Premium", time: "1 day ago", type: "subscription" },
    { action: "New user registered", detail: "jane.smith@oakfield.gov.uk", time: "1 day ago", type: "user" },
    { action: "Report generated", detail: "Millbrook Community Council — Executive Summary", time: "2 days ago", type: "report" },
  ];

  return (
    <AdminLayout title="Admin Overview">
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Platform overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Council ClearSight admin dashboard</p>
        </div>

        {/* Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Link key={m.label} href={m.href}>
              <Card className="border-border/60 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <m.icon className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">{m.change}</Badge>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Signup chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Council registrations (last 7 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="councils" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="Councils" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      a.type === "council" ? "bg-primary" :
                      a.type === "survey" ? "bg-accent" :
                      a.type === "subscription" ? "bg-amber-500" :
                      "bg-slate-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{a.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 flex-shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Manage councils", desc: "View, edit, and moderate council profiles", href: "/admin/councils", icon: Building2 },
            { label: "Manage subscriptions", desc: "View and manage council subscriptions", href: "/admin/subscriptions", icon: CreditCard },
            { label: "Blog & resources", desc: "Publish guides, case studies, and news", href: "/admin/blog", icon: Activity },
          ].map((link) => (
            <Link key={link.label} href={link.href}>
              <Card className="border-border/60 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer h-full">
                <CardContent className="p-5">
                  <link.icon className="h-5 w-5 text-primary mb-3" />
                  <p className="font-semibold text-foreground text-sm mb-1">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
