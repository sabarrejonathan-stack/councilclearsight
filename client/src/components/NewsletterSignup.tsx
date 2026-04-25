import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, CheckCircle2, Sparkles } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "inline" | "banner" | "footer";
  source?: string;
}

const NEWSLETTER_FEATURES = [
  "Monthly VDTI rankings update — see who's moved up (or down)",
  "Case studies: how councils improved their transparency score",
  "School engagement evidence — community connectivity in action",
  "Policy & legislation updates affecting parish councils",
  "Early access to new Council ClearSight features and reports",
];

export default function NewsletterSignup({ variant = "inline", source = "website" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.info("You're already subscribed — we'll keep sending you the good stuff.");
      } else {
        setSubscribed(true);
        toast.success("You're subscribed! Welcome to the Council ClearSight community.");
      }
      setEmail("");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, source });
  };

  if (subscribed) {
    return (
      <div className={`flex items-center gap-3 ${variant === "footer" ? "text-slate-300" : "text-teal-700"}`}>
        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
        <span className="text-sm font-medium">You're subscribed! Check your inbox for a welcome email.</span>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-teal-400"
        />
        <Button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-teal-600 hover:bg-teal-500 text-white flex-shrink-0"
        >
          {subscribe.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }

  if (variant === "banner") {
    return (
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Monthly newsletter — free, always
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Stay ahead of the curve.<br />
                <span className="text-teal-400">The ClearSight Dispatch.</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Every month, we send one email worth reading: ranking updates, council case studies,
                school engagement insights, and the policy changes that matter to your community.
                No fluff. No spam. Unsubscribe any time.
              </p>
              <ul className="space-y-1.5">
                {NEWSLETTER_FEATURES.slice(0, 3).map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-auto md:min-w-[320px]">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">Free</div>
                  <div className="text-xs text-slate-400">monthly insights for council professionals</div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="clerk@yourcouncil.gov.uk"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    disabled={subscribe.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                  >
                    {subscribe.isPending ? "Subscribing…" : "Subscribe to The ClearSight Dispatch"}
                  </Button>
                </form>
                <p className="text-xs text-slate-500 text-center">
                  Monthly. Free. Unsubscribe any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // inline (default)
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">The ClearSight Dispatch</h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Monthly insights on council transparency, ranking updates, and community engagement — delivered free to your inbox.
          </p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {NEWSLETTER_FEATURES.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          ) : "Subscribe"}
        </Button>
      </form>
      <p className="text-xs text-slate-400">Free forever. Unsubscribe any time. No spam, ever.</p>
    </div>
  );
}
