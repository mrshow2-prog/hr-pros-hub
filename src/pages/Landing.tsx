import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";
import BrandMark from "@/components/brand/BrandMark";
import HeroCvPreview from "@/components/landing/HeroCvPreview";
import TrustStrip from "@/components/landing/TrustStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import TemplateGallery from "@/components/landing/TemplateGallery";
import WhyRegional from "@/components/landing/WhyRegional";
import PricingStrip from "@/components/landing/PricingStrip";
import Faq from "@/components/landing/Faq";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-dm">
      <SEO
        title="People Studio CV — ATS-ready CV Builder for UAE & GCC"
        description="Build an ATS-optimized CV tuned for the UAE and GCC market. Live ATS score, matching cover letter, interview prep, and 7 recruiter-tested templates."
        path="/"
      />

      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-ink/10">
        <BrandMark />
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-ink/70 hover:text-ink">
            Sign in
          </Link>
          <Link to="/login" className="rounded-sm bg-sienna px-4 py-2 text-paper hover:opacity-90">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-6xl mx-auto grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55 mb-6">
              A People Studio product · Built for UAE & GCC
            </p>
            <h1 className="font-syne text-4xl md:text-6xl leading-[1.05] tracking-tight">
              Your CV, professionally rewritten and ready for any ATS.
            </h1>
            <p className="mt-6 text-base md:text-lg text-ink/70 max-w-xl">
              Upload what you have. Get a sharper version, tailored to the job, with a live ATS
              score, matching cover letter, and interview prep — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="rounded-sm bg-ink px-6 py-3 text-paper hover:opacity-90"
              >
                Start building — free
              </Link>
              <a
                href="https://peoplestudiohr.com"
                className="rounded-sm border border-ink/20 px-6 py-3 hover:border-ink/40"
              >
                Back to People Studio
              </a>
            </div>
            <p className="mt-4 text-xs text-ink/55">
              No card required · Free draft · Pay only when you export
            </p>
          </div>

          <div className="lg:pl-8">
            <HeroCvPreview />
          </div>
        </div>
      </main>

      <TrustStrip />
      <HowItWorks />
      <TemplateGallery />
      <WhyRegional />
      <PricingStrip />
      <Faq />

      {/* Final CTA */}
      <section className="border-t border-ink/10 px-6 md:px-10 py-20 text-center">
        <h2 className="font-syne text-3xl md:text-4xl tracking-tight max-w-2xl mx-auto">
          One upload away from a CV recruiters actually open.
        </h2>
        <div className="mt-8">
          <Link
            to="/login"
            className="rounded-sm bg-sienna px-7 py-3 text-paper hover:opacity-90"
          >
            Start building
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
