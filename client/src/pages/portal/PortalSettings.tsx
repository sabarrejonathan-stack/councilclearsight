/**
 * Portal Settings — account, council, and billing configuration.
 *
 * Tabs:
 *  1. Council: edit contact details (email, phone, chair, clerk)
 *  2. Account: profile, password, 2FA, invite users
 *  3. Billing: tier, invoice history, upgrade/downgrade, cancel
 *  4. Integrations: badge generator, webhooks, API key (Platinum only)
 *  5. Notifications: email preferences, digest toggles
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PortalLayout from "@/components/PortalLayout";
import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import {
  Lock, Mail, Phone, User, Key, Bell, Code, Copy, Check, AlertCircle,
  Eye, EyeOff, Trash2, CreditCard, Download, ArrowRight,
} from "lucide-react";
import {
  type CouncilScore,
} from "@/lib/scoring";

export default function PortalSettings() {
  const { data: council, isLoading } = trpc.portal.dashboard.useQuery();
  const [activeTab, setActiveTab] = useState("council");
  const [showPassword, setShowPassword] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  useSEO({
    title: "Settings — Council ClearSight Portal",
    description: "Manage your council account, billing, and integrations.",
    canonicalPath: "/portal/settings",
  });

  if (isLoading || !council) {
    return (
      <PortalLayout>
        <div className="container max-w-6xl py-12">
          <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </PortalLayout>
    );
  }

  const councilScore = council as CouncilScore;
  const isPro = councilScore.tier === "platinum";

  return (
    <PortalLayout council={councilScore}>
      <div className="container max-w-4xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, council details, and billing.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="council" className="text-xs">Council</TabsTrigger>
            <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
            {isPro && <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>}
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          </TabsList>

          {/* ─── 1. Council tab ─── */}
          <TabsContent value="council" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Council Details</h3>
              <div className="space-y-4">
                <FormField
                  label="Council Name"
                  value={councilScore.name}
                  icon={User}
                  readOnly
                />
                <FormField
                  label="Email"
                  value={councilScore.email || ""}
                  icon={Mail}
                  placeholder="council@example.gov.uk"
                />
                <FormField
                  label="Phone"
                  value={councilScore.phone || ""}
                  icon={Phone}
                  placeholder="+44 1234 567890"
                />
                <FormField
                  label="Chair"
                  value={councilScore.chair_name || ""}
                  icon={User}
                  placeholder="John Doe"
                />
                <FormField
                  label="Clerk"
                  value={councilScore.clerk_name || ""}
                  icon={User}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Audit trail</h4>
                  <p className="text-xs text-blue-800">
                    All changes to council details are logged and visible in the public audit.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ─── 2. Account tab ─── */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Account Profile</h3>
              <div className="space-y-4">
                <FormField
                  label="Email Address"
                  value={councilScore.account_email || ""}
                  icon={Mail}
                  placeholder="clerk@council.gov.uk"
                />
                <FormField
                  label="Name"
                  value={councilScore.account_name || ""}
                  icon={User}
                  placeholder="Your name"
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Password
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Two-factor authentication
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add an extra layer of security to your account with TOTP or SMS.
              </p>
              <Button variant="outline" size="sm">
                Set up 2FA
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Invite another council user</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Unlimited free. They'll receive an email with login instructions.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="newclerk@council.gov.uk"
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button size="sm">Send invite</Button>
              </div>
            </Card>
          </TabsContent>

          {/* ─── 3. Billing tab ─── */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Current Subscription</h3>
              <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Tier</span>
                  <Badge className="capitalize">{councilScore.tier}</Badge>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Billing period</span>
                  <span className="text-sm font-mono text-foreground">{councilScore.billing_period}</span>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <span className="text-sm font-bold text-foreground">{councilScore.tier_price_display}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Next invoice</span>
                  <span className="text-sm font-mono text-foreground">
                    {new Date(councilScore.next_invoice_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {councilScore.tier === "verified" && (
              <Card className="p-6 bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-200">
                <h3 className="text-sm font-semibold text-indigo-900 mb-3">Upgrade to Platinum</h3>
                <p className="text-xs text-indigo-800 mb-4 leading-relaxed">
                  Unlock quarterly re-scoring, custom action plans, peer benchmarking, and more.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Upgrade now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Card>
            )}

            {councilScore.tier === "platinum" && (
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Downgrade to Verified</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  You'll lose access to Platinum features (benchmarking, quarterly re-scoring, custom roadmap).
                </p>
                <Button variant="outline" size="sm">
                  Downgrade plan
                </Button>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Payment Method</h3>
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-sm font-mono text-foreground">•••• •••• •••• {councilScore.card_last_four}</div>
                    <div className="text-xs text-muted-foreground">Expires {councilScore.card_expiry}</div>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update payment method
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Invoice History</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="text-sm font-mono text-foreground">INV-2026-{1003 - i}</div>
                      <div className="text-xs text-muted-foreground">2026-0{4 - i}-01</div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Cancel subscription</h3>
              <p className="text-xs text-red-800 mb-4">
                Your public score is unchanged. We do not hold data hostage. The ✓ Verified badge and premium features will be removed.
              </p>
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            </Card>
          </TabsContent>

          {/* ─── 4. Integrations tab (Platinum only) ─── */}
          {isPro && (
            <TabsContent value="integrations" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Embeddable badge
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Drop this snippet on your council website to show your live VDTI score.
                </p>
                <div className="mb-4 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                  &lt;iframe src="https://councilclearsight.org.uk/embed/{councilScore.slug}"&gt;&lt;/iframe&gt;
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="https://councilclearsight.org.uk/embed/${councilScore.slug}"></iframe>`);
                      setApiKeyCopied(true);
                      setTimeout(() => setApiKeyCopied(false), 2000);
                    }}
                  >
                    {apiKeyCopied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    {apiKeyCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-semibold text-foreground mb-2">Preview:</div>
                  <div className="h-16 bg-white border border-slate-200 rounded flex items-center justify-center text-muted-foreground">
                    [Badge preview: {councilScore.score}/100 {councilScore.band}]
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Slack / Teams webhooks</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Get notifications in your Slack or Teams channel when your score changes.
                </p>
                <Button size="sm" variant="outline">
                  Add Slack webhook
                </Button>
                <Button size="sm" variant="outline" className="ml-2">
                  Add Teams webhook
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Use this to query your council data from your own dashboards.
                </p>
                <div className="mb-4 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                  sk_live_{councilScore.slug}_abcd1234efgh5678
                </div>
                <Button size="sm" variant="outline">
                  Regenerate key
                </Button>
              </Card>
            </TabsContent>
          )}

          {/* ─── 5. Notifications tab ─── */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Email notifications
              </h3>
              <div className="space-y-3">
                <CheckboxField label="Score change" defaultChecked={true} description="When your VDTI score changes (up or down)" />
                <CheckboxField label="Monthly digest" defaultChecked={true} description="A summary of what changed this month" />
                <CheckboxField label="Challenge decision" defaultChecked={true} description="When we respond to a score challenge" />
                <CheckboxField label="Platinum features update" defaultChecked={false} description="New features and improvements (for Platinum subscribers)" />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Digest frequency</h3>
              <div className="space-y-2">
                <RadioField label="Weekly digest" defaultChecked={false} />
                <RadioField label="Monthly digest" defaultChecked={true} />
                <RadioField label="No digest" defaultChecked={false} />
              </div>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
              <Button variant="outline">Reset to defaults</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

// --- components ---------------------------------------------------------

function FormField({
  label,
  value,
  icon: Icon,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  icon: any;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-slate-50 disabled:text-muted-foreground"
        />
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 rounded border-slate-300 text-accent focus:ring-accent"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function RadioField({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <input
        type="radio"
        name="digest"
        defaultChecked={defaultChecked}
        className="rounded-full border-slate-300 text-accent focus:ring-accent"
      />
      <div className="text-sm font-medium text-foreground">{label}</div>
    </div>
  );
}
