import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Eagerly load Home (landing page) for instant first paint
import Home from "./pages/Home";

// Lazy-load all other pages for code splitting
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Methodology = lazy(() => import("./pages/Methodology"));
const Features = lazy(() => import("./pages/Features"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Directory = lazy(() => import("./pages/Directory"));
const CouncilProfile = lazy(() => import("./pages/CouncilProfile"));
const Resources = lazy(() => import("./pages/Resources"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const SocialEngagement = lazy(() => import("./pages/SocialEngagement"));
const RegisterInterest = lazy(() => import("./pages/RegisterInterest"));
const RegionalDirectory = lazy(() => import("./pages/RegionalDirectory"));
const Snapshot = lazy(() => import("./pages/Snapshot"));
const Spotlight = lazy(() => import("./pages/Spotlight"));
const ForClerks = lazy(() => import("./pages/ForClerks"));
const ClerkSuccess = lazy(() => import("./pages/ClerkSuccess"));
const PublicScorecard = lazy(() => import("./pages/PublicScorecard"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const Evidence = lazy(() => import("./pages/Evidence"));
const Challenge = lazy(() => import("./pages/Challenge"));
const MethodologyChangelog = lazy(() => import("./pages/MethodologyChangelog"));
const DisputesQueue = lazy(() => import("./pages/DisputesQueue"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Portal pages
const Dashboard = lazy(() => import("./pages/portal/Dashboard"));
const Surveys = lazy(() => import("./pages/portal/Surveys"));
const Benchmarking = lazy(() => import("./pages/portal/Benchmarking"));
const Recommendations = lazy(() => import("./pages/portal/Recommendations"));
const Reports = lazy(() => import("./pages/portal/Reports"));
const PortalSettings = lazy(() => import("./pages/portal/PortalSettings"));

// Admin pages
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminCouncils = lazy(() => import("./pages/admin/AdminCouncils"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

/** Minimal loading skeleton — appears only during chunk downloads */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public marketing */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/methodology" component={Methodology} />
        <Route path="/methodology/changelog" component={MethodologyChangelog} />
        <Route path="/methodology/disputes" component={DisputesQueue} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/directory" component={Directory} />
        <Route path="/council/:slug" component={CouncilProfile} />
        <Route path="/councils/:slug" component={CouncilProfile} />
        <Route path="/social-engagement" component={SocialEngagement} />
        <Route path="/news" component={News} />
        <Route path="/news/:slug" component={NewsArticle} />
        <Route path="/evidence" component={Evidence} />
        <Route path="/challenge" component={Challenge} />
        <Route path="/resources" component={Resources} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/register-interest" component={RegisterInterest} />
        <Route path="/directory/:region" component={RegionalDirectory} />
        <Route path="/snapshot" component={Snapshot} />
        <Route path="/spotlight" component={Spotlight} />
        <Route path="/for-clerks" component={ForClerks} />
        <Route path="/clerk-success" component={ClerkSuccess} />
        <Route path="/scores" component={PublicScorecard} />
        <Route path="/scores/:slug" component={PublicScorecard} />
        <Route path="/privacy" component={Legal} />
        <Route path="/terms" component={Legal} />
        <Route path="/accessibility" component={Legal} />
        <Route path="/cookies" component={Legal} />

        {/* Subscriber portal */}
        <Route path="/portal" component={Dashboard} />
        <Route path="/portal/surveys" component={Surveys} />
        <Route path="/portal/benchmarking" component={Benchmarking} />
        <Route path="/portal/recommendations" component={Recommendations} />
        <Route path="/portal/reports" component={Reports} />
        <Route path="/portal/settings" component={PortalSettings} />

        {/* Admin panel */}
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/councils" component={AdminCouncils} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/subscriptions" component={AdminSubscriptions} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/audit" component={AdminAudit} />
        <Route path="/admin/settings" component={AdminSettings} />

        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
