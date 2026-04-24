import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import { useSEO } from "@/hooks/useSEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  Users,
  BarChart2,
  Shield,
  Eye,
  CheckCircle2,
  School,
  Smartphone,
  Globe,
  TrendingUp,
  MessageCircle,
  Share2,
  Filter,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";

const PLATFORMS = [
  {
    name: "Facebook",
    icon: "f",
    color: "bg-[#1877F2]",
    reach: "~44M UK users",
    source: "Meta advertising data via Herd Digital, 2024",
    ageRange: "25–65+",
    strength: "Highest reach among 35–65 age group — the core council taxpayer demographic. Geo-targeting to parish/ward level. Event promotion and community group integration.",
    targeting: ["Parish boundary geo-targeting", "Age 25–75+", "Homeowners & renters", "Community interest groups", "Local news followers"],
    adFormats: ["Sponsored survey link posts", "Lead generation forms", "Community group posts", "Event promotions"],
  },
  {
    name: "Instagram",
    icon: "ig",
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]",
    reach: "~34.7M UK users",
    source: "Meta advertising data, October 2024 (via Talkwalker)",
    ageRange: "18–45",
    strength: "Reaches younger residents and families who are under-represented in traditional council consultations. Visual storytelling about local issues drives higher engagement rates.",
    targeting: ["Geo-targeting to council area", "Age 18–45", "Parents and families", "Local lifestyle interests", "School-age parent demographics"],
    adFormats: ["Story polls and sliders", "Carousel posts on local issues", "Reels highlighting community topics", "Link-in-bio survey CTAs"],
  },
  {
    name: "Nextdoor",
    icon: "nd",
    color: "bg-[#00B246]",
    reach: "Hyperlocal UK communities",
    source: "Nextdoor UK",
    ageRange: "30–65+",
    strength: "Verified neighbourhood-level targeting — every user is verified to their address. The highest-trust platform for local government engagement. Ideal for parish-specific surveys.",
    targeting: ["Verified address-level targeting", "Specific street or neighbourhood", "Homeowners", "Long-term residents"],
    adFormats: ["Neighbourhood posts", "Public agency posts", "Sponsored local deals", "Community polls"],
  },
  {
    name: "X (Twitter)",
    icon: "x",
    color: "bg-black",
    reach: "~21.1M UK users",
    source: "Ofcom Online Nation 2024",
    ageRange: "25–55",
    strength: "Reaches engaged civic voices, local journalists, and community advocates. Effective for amplifying survey launches and sharing transparency report findings publicly.",
    targeting: ["Interest: local government, civic engagement", "Keyword: council, parish, planning", "Follower lookalikes of council accounts"],
    adFormats: ["Promoted survey tweets", "Conversation ads", "Amplified organic posts"],
  },
  {
    name: "WhatsApp",
    icon: "wa",
    color: "bg-[#25D366]",
    reach: "Most-used messaging app in the UK",
    source: "Ofcom Adults' Media Use and Attitudes 2024",
    ageRange: "All ages",
    strength: "Community WhatsApp groups are the primary communication channel for many parish communities. Council ClearSight provides shareable survey links optimised for WhatsApp forwarding, reaching residents who are not on social media.",
    targeting: ["Community group sharing", "Clerk and councillor networks", "School parent groups", "Village hall and community groups"],
    adFormats: ["Shareable survey links", "QR codes for printed materials", "Click-to-WhatsApp ads from Facebook"],
  },
];

const FAIRNESS_MEASURES = [
  {
    icon: Target,
    title: "Representative sampling by design",
    body: "Each survey campaign is designed to match the demographic profile of the council area using ONS Census 2021 data. We set target quotas by age group, tenure (owner-occupier vs renter), and neighbourhood before launching any campaign.",
  },
  {
    icon: Filter,
    title: "Multi-platform reach to reduce platform bias",
    body: "No single platform reaches all residents. By running simultaneous campaigns across Facebook, Instagram, Nextdoor, and WhatsApp, we ensure that residents who use only one platform are not systematically excluded.",
  },
  {
    icon: MapPin,
    title: "Hyperlocal geo-targeting",
    body: "All campaigns are geo-targeted to the council's exact boundary, not a postcode approximation. We use the council's official boundary polygon to define the ad audience, ensuring only residents within the council area are surveyed.",
  },
  {
    icon: School,
    title: "School engagement evidence as a complementary measure",
    body: "Social media cannot reach all residents. Council ClearSight's school engagement assessment uses publicly verifiable evidence from council websites, meeting minutes, and accounts to assess community connectivity — ensuring the assessment reflects documented engagement, not just digital presence.",
  },
  {
    icon: Clock,
    title: "Minimum response thresholds",
    body: "Results are only published when a minimum of 50 responses have been received, or 1% of the adult population (whichever is lower). This prevents small, unrepresentative samples from producing misleading scores.",
  },
  {
    icon: Eye,
    title: "Full transparency of methodology",
    body: "Every published survey result includes the sample size, demographic breakdown, platforms used, campaign dates, and any known limitations. Councils and residents can scrutinise the data collection process in full.",
  },
];

const TRANSPARENCY_COMMITMENTS = [
  "All ad spend and targeting parameters are disclosed to the subscribing council",
  "Survey questions are published in full before the campaign launches",
  "Raw response data is available to the subscribing council on request",
  "Demographic weighting methodology is published and transparent",
  "No personally identifiable information is collected or stored",
  "All data processing complies with UK GDPR and the Data Protection Act 2018",
  "Survey results are never altered or selectively reported",
  "Councils cannot suppress or delay publication of results",
];

export default function SocialEngagement() {
  useSEO({
      "title": "Social Engagement | Council ClearSight — Financial Accountability",
      "description": "How parish and town councils connect with their communities. Social media presence, school engagement, and partnership working assessed by Council ClearSight.",
      "keywords": "council social engagement, parish council social media, community connectivity, council community outreach",
      "canonicalPath": "/social-engagement"
  });
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container max-w-4xl">
          <Badge className="mb-5 bg-accent/20 text-accent border-accent/30">Resident Engagement</Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Reaching every resident — not just the ones who attend meetings
          </h1>
          <p className="text-lg text-white/75 max-w-2xl leading-relaxed mb-8">
            Council ClearSight uses targeted social media advertising to reach a representative sample of your community — including younger residents, renters, and families who rarely engage with traditional council consultations. Every campaign is transparent, independently verified, and designed to produce results that can withstand public scrutiny.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">Representative sampling</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">UK GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/80">Fully transparent</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">

        {/* Why social media */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Why social media advertising?</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-3xl">
            Traditional council consultations — public meetings, paper surveys, and email newsletters — systematically under-represent younger residents, renters, and working families. Research by the Local Government Association (2022) found that the average attendee at a parish council meeting is 58 years old, white, and a homeowner. This is not a representative picture of most communities.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Users, title: "Reach the under-represented", body: "Targeted social media campaigns reach residents aged 18–45, renters, and non-English speakers who are systematically absent from traditional consultations." },
              { icon: TrendingUp, title: "Higher response rates", body: "Mobile-optimised surveys delivered through social media achieve 3–5× higher response rates than email or paper surveys for the same population." },
              { icon: BarChart2, title: "Demographically weighted results", body: "Responses are weighted to match the ONS Census 2021 demographic profile of the council area, ensuring no age group or tenure type distorts the results." },
            ].map((p) => (
              <div key={p.title} className="p-5 bg-secondary/40 border border-border rounded-xl">
                <p.icon className="w-5 h-5 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2 text-sm">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform breakdown */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Our platform strategy</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-3xl">
            No single platform reaches all residents. Council ClearSight runs simultaneous campaigns across multiple platforms to ensure broad, representative coverage. Each platform is used for its specific demographic strengths.
          </p>
          <div className="space-y-4">
            {PLATFORMS.map((platform) => (
              <div key={platform.name} className="bg-background border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-5 border-b border-border">
                  <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xs">{platform.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-foreground">{platform.name}</h3>
                      <Badge variant="outline" className="text-xs">{platform.reach}</Badge>
                      <Badge variant="secondary" className="text-xs">Age {platform.ageRange}</Badge>
                    </div>
                    {platform.source && (
                      <p className="text-xs text-muted-foreground mt-1">Source: {platform.source}</p>
                    )}
                  </div>
                </div>
                <div className="p-5 grid md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why we use it</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{platform.strength}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Targeting parameters</p>
                    <ul className="space-y-1">
                      {platform.targeting.map((t) => (
                        <li key={t} className="flex items-start gap-1.5 text-xs text-foreground">
                          <Target className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ad formats used</p>
                    <ul className="space-y-1">
                      {platform.adFormats.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
                          <Share2 className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fairness measures */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">How we ensure fair representation</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-3xl">
            Reaching residents is only the first step. Council ClearSight applies six fairness measures to every survey campaign to ensure that the results are representative, honest, and publicly defensible.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {FAIRNESS_MEASURES.map((m) => (
              <div key={m.title} className="p-5 bg-background border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <m.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5 text-sm">{m.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* School partnerships integration */}
        <section className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <School className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">School engagement evidence: assessing community connections beyond social media</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Social media advertising cannot reach all residents, and online engagement alone does not capture the full picture of a council's community connections. Council ClearSight's school engagement assessment provides a complementary, evidence-based measure.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Using the Department for Education's GIAS register, we identify schools in each council area and then search for publicly verifiable evidence of engagement across three sources: the council's website, published meeting minutes, and published accounts (including the AGAR).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This evidence-based approach rewards councils that have documented their engagement with local schools — not just those that happen to be near schools. Where no evidence is found, this is noted transparently on the council's profile page.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency commitments */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">Our transparency commitments</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-3xl">
            Council ClearSight is committed to the highest standards of transparency in how we collect, process, and report resident data. The following commitments are non-negotiable and apply to every survey campaign.
          </p>
          <div className="p-6 bg-background border border-border rounded-xl">
            <ul className="grid sm:grid-cols-2 gap-3">
              {TRANSPARENCY_COMMITMENTS.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Important:</strong> Council ClearSight operates as an independent data processor under UK GDPR. We are not a data controller on behalf of the council. Survey respondents are informed of this distinction in the survey introduction. No council can instruct Council ClearSight to alter, suppress, or delay the publication of survey results.
              </p>
            </div>
          </div>
        </section>

        {/* How it works in practice */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">How a survey campaign works</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {[
                { step: "01", icon: MessageCircle, title: "Survey design", body: "Council ClearSight works with the council to design a survey covering the four Council ClearSight pillars. Questions are standardised to enable benchmarking, with up to 5 council-specific questions added. The final survey is published in full before launch." },
                { step: "02", icon: Target, title: "Audience targeting", body: "We define the geo-targeting boundary using the council's official boundary polygon. We set demographic quotas based on ONS Census 2021 data for the area. Targeting parameters are shared with the council before the campaign launches." },
                { step: "03", icon: Smartphone, title: "Multi-platform campaign", body: "The survey is promoted simultaneously across Facebook, Instagram, Nextdoor, and WhatsApp over a 2–4 week period. The campaign budget is allocated across platforms based on the demographic profile of the council area." },
                { step: "04", icon: School, title: "School engagement evidence review", body: "For Gold subscribers, Council ClearSight conducts a detailed review of the council's engagement with local schools, assessing publicly available evidence from the council website, meeting minutes, and published accounts. This assessment is independent of the social media campaign." },
                { step: "05", icon: Filter, title: "Demographic weighting", body: "Once the minimum response threshold is reached, responses are weighted to match the ONS Census 2021 demographic profile of the council area. The weighting methodology is published alongside the results." },
                { step: "06", icon: BarChart2, title: "Report publication", body: "Results are compiled into the Council ClearSight report and published to the subscriber portal. The full dataset, including demographic breakdown and weighting factors, is available to the council on request." },
              ].map((s) => (
                <div key={s.step} className="relative flex gap-6 pl-12">
                  <div className="absolute left-0 w-10 h-10 rounded-full bg-background border-2 border-accent flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground">{s.step}</span>
                      <h3 className="font-semibold text-foreground text-sm">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center">
          <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-3">Ready to hear from your whole community?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
            Request a sample report to see how Council ClearSight's social media engagement strategy would work for your council area — including a demographic breakdown of your community and an estimate of expected response rates.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact">
              <Button>Request a sample report <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">View pricing</Button>
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
