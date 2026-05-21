import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";
import { CVBuilderProvider, useCVBuilder } from "@/contexts/CVBuilderContext";

function StatusCard() {
  const { state, loading } = useCVBuilder();
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-ink/10 bg-paper p-8 shadow-sm">
      <p className="font-syne text-xs uppercase tracking-widest2 text-sienna">CV Builder</p>
      <h1 className="mt-3 font-syne text-3xl text-ink">Architecture wired</h1>
      <p className="mt-3 text-ink/70">
        The CV Builder foundation is in place. The wizard UI will be built on top of this in the next step.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded border border-ink/10 bg-clay/40 p-3">
          <dt className="text-xs uppercase tracking-wider text-ink/60">Current step</dt>
          <dd className="mt-1 font-syne text-lg text-ink">{state.currentStep} / 7</dd>
        </div>
        <div className="rounded border border-ink/10 bg-clay/40 p-3">
          <dt className="text-xs uppercase tracking-wider text-ink/60">Session</dt>
          <dd className="mt-1 truncate font-mono text-xs text-ink">{state.sessionId.slice(0, 8)}…</dd>
        </div>
        <div className="rounded border border-ink/10 bg-clay/40 p-3">
          <dt className="text-xs uppercase tracking-wider text-ink/60">Payment</dt>
          <dd className="mt-1 font-syne text-lg text-ink capitalize">{state.paymentStatus}</dd>
        </div>
        <div className="rounded border border-ink/10 bg-clay/40 p-3">
          <dt className="text-xs uppercase tracking-wider text-ink/60">Hydration</dt>
          <dd className="mt-1 font-syne text-lg text-ink">{loading ? "loading" : "ready"}</dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-1 text-sm text-ink/75">
        <li>✓ Route /career-studio/cv-builder</li>
        <li>✓ CVBuilderContext (7-step state)</li>
        <li>✓ Persistence: cv_builder_sessions</li>
        <li>✓ Storage bucket: cv-builder-uploads</li>
        <li>✓ Edge function stubs: analyze-cv-gaps, generate-cv, calculate-ats-score</li>
      </ul>
    </div>
  );
}

export default function CvBuilder() {
  return (
    <CVBuilderProvider>
      <SEO
        title="CV Builder — People.Studio"
        description="AI-powered CV builder with ATS optimisation."
        path="/career-studio/cv-builder"
      />
      <main className="min-h-screen bg-paper py-16">
        <StatusCard />
      </main>
      <SiteFooter />
    </CVBuilderProvider>
  );
}
