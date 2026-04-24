import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Star,
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  MapPin,
  TrendingUp,
  MessageSquare,
  Lock,
} from "lucide-react";

interface PremiumGateProps {
  featureName: string;
  featureDescription?: string;
}

const clarityPlusFeatures = [
  { icon: FileText, label: "Unlimited updated assessments (delivered within 4 weeks)" },
  { icon: MessageSquare, label: "LCAS evidence pack for accreditation" },
  { icon: MapPin, label: "Ward & parish-level insight" },
  { icon: GraduationCap, label: "School engagement evidence review" },
  { icon: TrendingUp, label: "Improvement roadmap with prioritised actions" },
];

export default function PremiumGate({ featureName, featureDescription }: PremiumGateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-xl w-full text-center">
        {/* Lock icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 hover:bg-accent/10">
          <Star className="h-3 w-3 mr-1" />
          Gold feature
        </Badge>

        <h2 className="text-2xl font-bold text-foreground mb-3">
          {featureName} is available on Gold
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-8">
          {featureDescription ||
            "This feature is included in the Gold subscription. Upgrade to access unlimited updated assessments, school engagement evidence review, improvement roadmap, and LCAS evidence pack — everything you need to stay ahead of change in your community."}
        </p>

        {/* What you get */}
        <Card className="border-border/60 text-left mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">Gold</h3>
                <p className="text-sm text-muted-foreground">Everything in Gold, plus:</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">£690</div>
                <div className="text-xs text-muted-foreground">per year + VAT</div>
              </div>
            </div>
            <div className="space-y-2.5">
              {clarityPlusFeatures.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact">
            <Button className="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto">
              Upgrade to Gold
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="w-full sm:w-auto">
              Compare plans
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Upgrading is instant. Your next report will reflect your new tier.
        </p>
      </div>
    </div>
  );
}
