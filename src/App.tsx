import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import SiteAssistant from "@/components/ui/SiteAssistant";
import Index from "./pages/Index";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import Tools from "./pages/Tools";
import Career from "./pages/Career";
import CvBuilder from "./pages/CvBuilder";
import CvBuilderLogin from "./pages/cv-builder/CvBuilderLogin";
import MyCvs from "./pages/cv-builder/MyCvs";
import RequireCvAuth from "./components/cv-builder/RequireCvAuth";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import ProfileRouter from "./pages/ProfileRouter";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfileEditor from "./pages/admin/AdminProfileEditor";
import LanguageSync from "./i18n/LanguageSync";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <LanguageSync />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/business" element={<Business />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/career" element={<Career />} />
          <Route path="/career-studio/cv-builder/login" element={<CvBuilderLogin />} />
          <Route
            path="/career-studio/cv-builder/my-cvs"
            element={<RequireCvAuth><MyCvs /></RequireCvAuth>}
          />
          <Route
            path="/career-studio/cv-builder"
            element={<RequireCvAuth><CvBuilder /></RequireCvAuth>}
          />
          <Route
            path="/ar/career-studio/cv-builder"
            element={<RequireCvAuth><CvBuilder /></RequireCvAuth>}
          />
          <Route path="/legal" element={<Legal />} />
          {/* Arabic mirrors — same components, language flipped via <LanguageSync> */}
          <Route path="/ar" element={<Index />} />
          <Route path="/ar/business" element={<Business />} />
          <Route path="/ar/tools" element={<Tools />} />
          <Route path="/ar/career" element={<Career />} />
          <Route path="/ar/legal" element={<Legal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/:slug" element={<AdminProfileEditor />} />
          {/* Dynamic profile pages — always English, no /ar prefix */}
          <Route path="/:slug" element={<ProfileRouter />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
        <SiteAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
