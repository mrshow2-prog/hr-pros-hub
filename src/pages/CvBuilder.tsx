import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";
import { CVBuilderProvider, useCVBuilder } from "@/contexts/CVBuilderContext";
import WizardShell from "@/components/cv-builder/WizardShell";
import StepUpload from "@/components/cv-builder/StepUpload";
import StepGaps from "@/components/cv-builder/StepGaps";
import StepScratchBasics from "@/components/cv-builder/StepScratchBasics";
import StepTemplate from "@/components/cv-builder/StepTemplate";
import EditorShell from "@/components/cv-builder/editor/EditorShell";
import StepExport from "@/components/cv-builder/StepExport";
import { supabase } from "@/integrations/supabase/client";

import BrandMark from "@/components/brand/BrandMark";

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
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between font-dm text-xs text-ink/70">
        <BrandMark to="/my-cvs" logoHeightClass="h-6 md:h-7" />
        <div className="flex items-center gap-4">
          <Link to="/my-cvs" className="hover:text-ink">← My CVs</Link>
          {email && <span className="hidden sm:inline">{email}</span>}
          <button onClick={logout} className="hover:text-ink underline">Log out</button>
        </div>
      </div>
    </div>
  );
}

function Wizard() {
  const { state, loading } = useCVBuilder();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.currentStep]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-dm text-sm text-ink/55">
        Loading your session…
      </div>
    );
  }

  const step = state.currentStep;
  const locked = state.paymentStatus === "paid";
  // Paid (unlocked) sessions are locked to the editor / export — never let the
  // wizard render the upload / intent / gaps screens again.
  if (step === 4 || (locked && step < 4)) {
    return <EditorShell />;
  }

  return (
    <WizardShell stepKey={step}>
      {step === 1 && <StepTemplate />}
      {step === 2 && <StepUpload />}
      {step === 3 && state.fromScratch && !state.scratchBasics.completed && <StepScratchBasics />}
      {step === 3 && !(state.fromScratch && !state.scratchBasics.completed) && <StepGaps />}
      {step === 5 && <StepExport />}
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
