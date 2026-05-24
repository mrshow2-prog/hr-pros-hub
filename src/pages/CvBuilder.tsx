import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";
import { CVBuilderProvider, useCVBuilder } from "@/contexts/CVBuilderContext";
import WizardShell from "@/components/cv-builder/WizardShell";
import StepUpload from "@/components/cv-builder/StepUpload";
import StepIntent from "@/components/cv-builder/StepIntent";
import StepGaps from "@/components/cv-builder/StepGaps";
import StepPayment from "@/components/cv-builder/StepPayment";
import StepTemplate from "@/components/cv-builder/StepTemplate";
import StepDraft from "@/components/cv-builder/StepDraft";
import StepExport from "@/components/cv-builder/StepExport";
import { supabase } from "@/integrations/supabase/client";

function CvBuilderTopBar() {
  const nav = useNavigate();
  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? ""));
  }, []);
  const logout = async () => {
    await supabase.auth.signOut();
    nav("/login", { replace: true });
  };
  return (
    <div className="w-full bg-paper border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs font-dm text-ink/70">
        <Link to="/my-cvs" className="hover:text-ink">← My CVs</Link>
        <div className="flex items-center gap-3">
          {email && <span className="hidden sm:inline">{email}</span>}
          <button onClick={logout} className="hover:text-ink underline">Log out</button>
        </div>
      </div>
    </div>
  );
}

function Wizard() {
  const { state, loading } = useCVBuilder();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-dm text-sm text-ink/55">
        Loading your session…
      </div>
    );
  }

  const step = state.currentStep;
  return (
    <WizardShell stepKey={step}>
      {step === 1 && <StepUpload />}
      {step === 2 && <StepIntent />}
      {step === 3 && <StepGaps />}
      {step === 4 && <StepTemplate />}
      {step === 5 && <StepPayment />}
      {step === 6 && <StepDraft />}
      {step === 7 && <StepExport />}
    </WizardShell>
  );
}

export default function CvBuilder() {
  return (
    <CVBuilderProvider>
      <SEO
        title="CV Builder — Your CV, professionally rewritten"
        description="Upload your CV, answer a few questions, and get a rewritten ATS-optimised version. One payment, yours to keep."
        path="/builder"
      />
      <CvBuilderTopBar />
      <Wizard />
      <SiteFooter />
    </CVBuilderProvider>
  );
}
