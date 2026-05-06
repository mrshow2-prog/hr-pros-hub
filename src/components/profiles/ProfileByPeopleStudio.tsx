import { Link } from "react-router-dom";

/** Centered top bar: "PROFILE BY people·STUDIO" */
export function ProfileByPeopleStudioHeader() {
  return (
    <div className="w-full bg-[#0f1420] border-b border-white/10 py-3 px-4 flex items-center justify-center">
      <Link to="/" aria-label="People.Studio home" className="inline-flex items-baseline gap-2 leading-none group">
        <span className="font-mono text-[11px] tracking-[0.35em] uppercase text-white/70 group-hover:text-white transition-colors">
          Profile by
        </span>
        <span className="inline-flex items-baseline">
          <span className="font-serif italic text-[18px] text-[#c9a84c]">people</span>
          <span className="mx-[0.25em] inline-block h-[3px] w-[3px] rounded-full bg-[#c9a84c] -translate-y-[6px]" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80 -translate-y-[4px]">STUDIO</span>
        </span>
      </Link>
    </div>
  );
}

/** Footer CTA band */
export function ProfileByPeopleStudioFooter() {
  return (
    <footer className="w-full bg-[#0f1420] text-white py-20 px-6 text-center border-t border-white/10">
      <div className="max-w-2xl mx-auto">
        <div className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#c9a84c] mb-6">
          Want a profile like this?
        </div>
        <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] mb-6">
          Your career deserves more than a{" "}
          <em className="text-[#c9a84c] not-italic font-bold italic">PDF.</em>
        </h2>
        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          People·STUDIO designs living, interactive profiles for senior talent — built to be remembered, not just reviewed.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#c9a84c] hover:bg-[#e8d49a] text-[#0a0a0f] font-mono text-xs tracking-[0.25em] uppercase px-10 py-4 transition-colors"
        >
          Build Your Profile →
        </Link>
        <div className="mt-12 font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
          Designed & Built by{" "}
          <Link to="/" className="text-[#c9a84c] hover:text-[#e8d49a] transition-colors">
            People·STUDIO
          </Link>
        </div>
      </div>
    </footer>
  );
}
