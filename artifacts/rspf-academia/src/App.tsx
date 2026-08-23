import { ClerkProvider } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import BrandBackground from "@/components/BrandBackground";
import Home from "@/pages/Home";
import ParticipantPortal from "@/pages/ParticipantPortal";
import CoordinatorPortal from "@/pages/CoordinatorPortal";
import SpecialRequests from "@/pages/SpecialRequests";
import KnowledgeCenter from "@/pages/KnowledgeCenter";
import KnowledgeArticle from "@/pages/KnowledgeArticle";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSubmissions from "@/pages/AdminSubmissions";
import ResearchDetail from "@/pages/ResearchDetail";
import OwnerLogin from "@/pages/OwnerLogin";
import OwnerSignIn from "@/pages/OwnerSignIn";
import OwnerSignUp from "@/pages/OwnerSignUp";
import NotFound from "@/pages/not-found";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { PageSeo } from "@/lib/seo";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: { logoPlacement: "inside" as const, logoLinkUrl: basePath || "/" },
  variables: {
    colorPrimary: "#117b59", colorForeground: "#0f2744", colorMutedForeground: "#64748b",
    colorBackground: "#ffffff", colorInput: "#f8fafc", colorInputForeground: "#0f2744",
    colorDanger: "#dc2626", colorNeutral: "#dbe4ee", fontFamily: "Tajawal, sans-serif", borderRadius: "1rem",
  },
  elements: {
    rootBox: "w-full flex justify-center", cardBox: "w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none", footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-black", headerSubtitle: "text-slate-500", formFieldLabel: "text-slate-700 font-bold",
    formButtonPrimary: "bg-[#117b59] hover:bg-[#0c6549]", formFieldInput: "bg-slate-50 text-slate-900 border-slate-200",
    footerActionLink: "text-[#117b59]", footerActionText: "text-slate-500",
  },
};

function Router() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const isAdmin = location === "/admin" || location === "/admin/submissions" || location === "/owner-admin" || location === "/sign-in" || location.startsWith("/sign-in/") || location === "/sign-up" || location.startsWith("/sign-up/") || location === "/coordinator/dashboard";
  const isCoordinatorPortal = location === "/coordinator" || location === "/coordinator-portal";
  const isPrivate = isAdmin || isCoordinatorPortal;

  return (
    <div className="relative flex min-h-screen flex-col" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      <PageSeo pathname={location} language={language} noIndex={isPrivate} />
      <BrandBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        {!isAdmin && !isCoordinatorPortal && <Navbar />}
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/participant-portal" component={ParticipantPortal} />
            <Route path="/coordinator" component={CoordinatorPortal} />
            <Route path="/coordinator-portal" component={CoordinatorPortal} />
            <Route path="/special-requests" component={SpecialRequests} />
            <Route path="/knowledge-center" component={KnowledgeCenter} />
            <Route path="/knowledge-center/:slug" component={KnowledgeArticle} />
            <Route path="/about" component={About} />
            <Route path="/faq" component={FAQ} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/submissions" component={AdminSubmissions} />
            <Route path="/owner-admin" component={OwnerLogin} />
            <Route path="/sign-in/*?" component={OwnerSignIn} />
            <Route path="/sign-up/*?" component={OwnerSignUp} />
            <Route path="/coordinator/dashboard" component={AdminDashboard} />
            <Route path="/research/:id" component={ResearchDetail} />
            <Route component={NotFound} />
          </Switch>
        </main>
        {!isAdmin && !isCoordinatorPortal && <Footer />}
        {!isAdmin && !isCoordinatorPortal && <FloatingButtons />}
      </div>
    </div>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <WouterRouter base={basePath}>
              <Router />
            </WouterRouter>
          </LanguageProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
