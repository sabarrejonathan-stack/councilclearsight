import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, CheckCircle2, ArrowRight, BarChart3, FileText, TrendingUp } from "lucide-react";

const STORAGE_KEY = "cc_email_captured";

interface EmailCaptureGateProps {
  councilName: string;
  children: React.ReactNode;
}

/**
 * Wraps content that should only be visible after the visitor provides their email.
 * Once captured, the email is stored in localStorage so the gate doesn't re-appear.
 * The gate is a soft barrier — it captures leads without blocking the core score.
 */
export default function EmailCaptureGate({ councilName, children }: EmailCaptureGateProps) {
  const [email, setEmail] = useState("");
  const [captured, setCaptured] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCaptured(true);
      setShowContent(true);
    }
  }, []);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      localStorage.setItem(STORAGE_KEY, "true");
      setCaptured(true);
      setShowContent(true);
      toast.success("Thank you! Full details are now unlocked.");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, source: `council-profile-gate:${councilName}` });
  };

  if (showContent) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred preview of the content */}
      <div className="pointer-events-none select-none" style={{ filter: "blur(6px)", opacity: 0.4, maxHeight: "300px", overflow: "hidden" }}>
        {children}
      </div>

      {/* Overlay gate */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/60 via-white/90 to-white">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-teal-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Unlock the full breakdown for {councilName}
          </h3>
          <p className="text-sm text-slate-500 mb-5">
            Enter your email to see the detailed indicator analysis, evidence sources, and improvement opportunities. You'll also receive our monthly ClearSight Dispatch newsletter.
          </p>

          {/* What you'll see */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              <span className="text-xs font-medium text-slate-700">Pillar scores</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl">
              <FileText className="h-5 w-5 text-teal-600" />
              <span className="text-xs font-medium text-slate-700">Evidence sources</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <span className="text-xs font-medium text-slate-700">Peer comparison</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={subscribe.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white flex-shrink-0"
            >
              {subscribe.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Unlock
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-400 mt-3">
            Free. No spam. Unsubscribe any time.
          </p>
        </div>
      </div>
    </div>
  );
}
