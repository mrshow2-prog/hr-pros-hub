import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import Index from "./pages/Index";
import Business from "./pages/Business";
import Profile from "./pages/Profile";
import Tools from "./pages/Tools";
import Career from "./pages/Career";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

// Static profile page lives at /public/Chef-M-Khalil/index.html.
// Embed it in a full-viewport iframe so the URL stays clean (no /index.html).
const StaticProfileFrame = ({ src, title }: { src: string; title: string }) => {
  useEffect(() => {
    const prev = document.body.style.margin;
    document.body.style.margin = "0";
    return () => { document.body.style.margin = prev; };
  }, []);
  return (
    <iframe
      src={src}
      title={title}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
    />
  );
};

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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/business" element={<Business />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/career" element={<Career />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/Chef-M-Khalil" element={<StaticProfileFrame src="/Chef-M-Khalil/index.html" title="Chef Mohamed Khalil" />} />
          <Route path="/chef-m-khalil" element={<StaticProfileFrame src="/Chef-M-Khalil/index.html" title="Chef Mohamed Khalil" />} />
          <Route path="/Bishoy-Mesiha" element={<StaticProfileFrame src="/Bishoy-Mesiha/index.html" title="Bishoy Mesiha" />} />
          <Route path="/bishoy-mesiha" element={<StaticProfileFrame src="/Bishoy-Mesiha/index.html" title="Bishoy Mesiha" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
