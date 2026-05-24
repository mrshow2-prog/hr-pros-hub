import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import SiteFooter from "@/components/ui/SiteFooter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-dm">
      <SEO
        title="People Studio CV — AI CV Builder, ATS-optimized"
        description="Upload your CV, get an ATS-optimized rewrite, JD-tailored versions, cover letters, and interview prep. Built for the UAE market."
        path="/"
      />
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-ink/10">
        <Link to="/" className="font-syne text-lg tracking-tight">People Studio <span className="text-sienna">CV</span></Link>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-ink/70 hover:text-ink">Sign in</Link>
          <Link to="/login" className="rounded-sm bg-sienna px-4 py-2 text-paper hover:opacity-90">Get started</Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55 mb-6">A People Studio product</p>
          <h1 className="font-syne text-4xl md:text-6xl leading-tight tracking-tight">
            Your CV, professionally rewritten and ready for any ATS.
          </h1>
          <p className="mt-6 text-base md:text-lg text-ink/70 max-w-2xl mx-auto">
            Upload what you have. Get a sharper version, tailored to the job, with a live ATS score, matching cover letter, and interview prep — all in one place.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="rounded-sm bg-ink px-6 py-3 text-paper hover:opacity-90">Start building</Link>
            <a href="https://peoplestudiohr.com" className="rounded-sm border border-ink/20 px-6 py-3 hover:border-ink/40">Back to People Studio</a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
