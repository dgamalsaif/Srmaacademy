import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import Home from "@/pages/Home";
import ParticipantPortal from "@/pages/ParticipantPortal";
import CoordinatorPortal from "@/pages/CoordinatorPortal";
import SpecialRequests from "@/pages/SpecialRequests";
import KnowledgeCenter from "@/pages/KnowledgeCenter";
import About from "@/pages/About";
import FAQ from "@/pages/FAQ";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSubmissions from "@/pages/AdminSubmissions";
import ResearchDetail from "@/pages/ResearchDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isAdmin = location === "/admin" || location === "/admin/submissions";
  const isCoordinatorPortal = location === "/coordinator" || location === "/coordinator-portal";

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {!isAdmin && !isCoordinatorPortal && <Navbar />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/participant-portal" component={ParticipantPortal} />
          <Route path="/coordinator" component={CoordinatorPortal} />
          <Route path="/coordinator-portal" component={CoordinatorPortal} />
          <Route path="/special-requests" component={SpecialRequests} />
          <Route path="/knowledge-center" component={KnowledgeCenter} />
          <Route path="/about" component={About} />
          <Route path="/faq" component={FAQ} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/submissions" component={AdminSubmissions} />
          <Route path="/research/:id" component={ResearchDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAdmin && !isCoordinatorPortal && <Footer />}
      {!isAdmin && !isCoordinatorPortal && <FloatingButtons />}
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
