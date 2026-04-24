import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileText, Loader2, Shield } from "lucide-react";

interface SampleReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  councilId: number;
  councilSlug: string;
  councilName: string;
  councilScore?: number | null;
}

export default function SampleReportModal({
  open,
  onOpenChange,
  councilId,
  councilSlug,
  councilName,
  councilScore,
}: SampleReportModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestReport = trpc.sampleReport.requestReport.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    requestReport.mutate({
      firstName,
      lastName,
      email,
      councilId,
      councilSlug,
      councilName,
      role: role as any,
      phone: phone || undefined,
      marketingConsent,
      source: "council_profile_gate",
    });
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Your sample report is on its way.</h3>
            <p className="text-slate-400 text-sm mb-4">
              Check your inbox at <strong className="text-white">{email}</strong> within the next 60 seconds.
            </p>
            <p className="text-slate-500 text-xs">
              The report is personalised to {councilName} using real, verifiable data.
              No payment required. One-click unsubscribe at any time.
            </p>
            <Button
              className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-900"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <FileText className="inline h-5 w-5 mr-2 text-amber-400 -mt-0.5" />
            Get your personalised sample report
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            A real report for <strong className="text-white">{councilName}</strong>
            {councilScore != null && (
              <> (current score: <strong className="text-amber-400">{councilScore}/100</strong>)</>
            )}
            . Based on verifiable data. In your inbox in 60 seconds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-slate-300 text-sm">First name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white mt-1"
                placeholder="Sarah"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-slate-300 text-sm">Last name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white mt-1"
                placeholder="Whitcombe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-slate-300 text-sm">Work email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white mt-1"
              placeholder="clerk@council.gov.uk"
            />
          </div>

          <div>
            <Label className="text-slate-300 text-sm">Your role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white mt-1">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="clerk">Clerk / Proper Officer</SelectItem>
                <SelectItem value="rfo">Responsible Financial Officer</SelectItem>
                <SelectItem value="chair">Chair / Vice-Chair</SelectItem>
                <SelectItem value="councillor">Councillor</SelectItem>
                <SelectItem value="officer">Council Officer</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="press">Press / Media</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="phone" className="text-slate-300 text-sm">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white mt-1"
              placeholder="07XXX XXXXXX"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 rounded border-slate-600"
            />
            <span className="text-xs text-slate-400">
              I consent to receiving occasional updates about Council ClearSight services.
              You can unsubscribe at any time. We never share your data with third parties.
            </span>
          </label>

          <Button
            type="submit"
            disabled={requestReport.isPending || !firstName || !lastName || !email || !role}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
          >
            {requestReport.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating your report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Send my sample report
              </>
            )}
          </Button>

          {requestReport.isError && (
            <p className="text-red-400 text-xs text-center">
              Something went wrong. Please try again or contact info@councilclearsight.org.uk.
            </p>
          )}

          <div className="flex items-center gap-2 justify-center pt-1">
            <Shield className="h-3 w-3 text-slate-500" />
            <p className="text-xs text-slate-500">
              Your data is processed in accordance with UK GDPR. ICO registration pending.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
