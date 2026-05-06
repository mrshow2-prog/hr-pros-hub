import { Link } from "react-router-dom";

/** Slim top bar shown above scoped profile pages. */
export function ProfileByPeopleStudioHeader() {
  return (
    <div className="w-full bg-black text-white text-xs tracking-widest uppercase py-2 px-4 flex items-center justify-between border-b border-white/10 font-mono">
      <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">
        ← People.Studio
      </Link>
      <span className="opacity-60">Profile by People.Studio</span>
    </div>
  );
}

/** Slim CTA band shown below scoped profile pages. */
export function ProfileByPeopleStudioFooter() {
  return (
    <footer className="w-full bg-black text-white py-10 px-6 text-center border-t border-white/10">
      <p className="font-serif italic text-xl md:text-2xl mb-3">
        Want a profile like this?
      </p>
      <p className="text-sm opacity-70 max-w-md mx-auto mb-5">
        People.Studio crafts bespoke executive profiles, web CVs and personal brand sites.
      </p>
      <Link
        to="/"
        className="inline-block font-mono text-xs tracking-widest uppercase border border-white/40 hover:border-white px-6 py-3 transition-colors"
      >
        Reach out to People.Studio →
      </Link>
      <div className="mt-6 text-[10px] tracking-widest uppercase opacity-50 font-mono">
        © {new Date().getFullYear()} People.Studio
      </div>
    </footer>
  );
}
