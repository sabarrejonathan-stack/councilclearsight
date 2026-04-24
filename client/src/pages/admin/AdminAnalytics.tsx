import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Sep", surveys: 3, responses: 142, reports: 5 },
  { month: "Oct", surveys: 5, responses: 287, reports: 8 },
  { month: "Nov", surveys: 4, responses: 198, reports: 6 },
  { month: "Dec", surveys: 2, responses: 89, reports: 3 },
  { month: "Jan", surveys: 7, responses: 412, reports: 11 },
  { month: "Feb", surveys: 9, responses: 534, reports: 14 },
  { month: "Mar", surveys: 6, responses: 321, reports: 9 },
];

const councilTypeData = [
  { name: "Parish", value: 28, color: "#1e3a5f" },
  { name: "Town", value: 14, color: "#4a9b8e" },
  { name: "Community", value: 5, color: "#7fb5ae" },
];

const regionData = [
  { region: "South West", count: 11 },
  { region: "South East", count: 9 },
  { region: "East of England", count: 7 },
  { region: "North West", count: 6 },
  { region: "East Midlands", count: 5 },
  { region: "West Midlands", count: 5 },
  { region: "Yorkshire", count: 4 },
];

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Analytics">
      <div className="max-w-6xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform usage and engagement metrics</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly activity */}
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Monthly activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="surveys" fill="#1e3a5f" radius={[3, 3, 0, 0]} name="Surveys" />
                  <Bar dataKey="reports" fill="#4a9b8e" radius={[3, 3, 0, 0]} name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Council type breakdown */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Council types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={councilTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {councilTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {councilTypeData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Survey responses trend */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Survey responses over time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="responses" stroke="#4a9b8e" strokeWidth={2} dot={{ fill: "#4a9b8e", r: 3 }} name="Responses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional breakdown */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Councils by region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#1e3a5f" radius={[0, 4, 4, 0]} name="Councils" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
