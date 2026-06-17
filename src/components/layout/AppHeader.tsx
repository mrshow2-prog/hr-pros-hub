import { Link, useLocation } from "react-router-dom";

export default function AppHeader() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <header className="w-full bg-paper border-b border-ink/10">
      <div className={`flex items-center justify-between py-5 px-6 md:px-10 ${isLanding ? "" : "max-w-6xl mx-auto"}`}>
        <Link to="/" className="inline-flex items-baseline gap-1 font-syne text-lg tracking-tight">
          <span>People</span>
          <span className="inline-block h-[0.12em] w-[0.12em] rounded-full bg-sienna self-center" aria-hidden="true" />
          <span>Studio</span>
          <span className="text-sienna ml-1">CV</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {pathname !== "/login" && (
            <Link to="/login" className="text-ink/70 hover:text-ink">
              Sign in
            </Link>
          )}
          <Link to="/login" className="rounded-sm bg-sienna px-4 py-2 text-paper hover:opacity-90">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
