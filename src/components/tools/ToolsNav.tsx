import { Link } from "react-router-dom";
import PsLogo from "@/components/ui/PsLogo";

const navLinks = [
  { label: "Back", to: "/business" },
];

export default function ToolsNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <PsLogo size="sm" />
          <span className="hidden border-l border-ink/15 pl-3 font-dm text-[10px] font-bold uppercase tracking-wider2 text-ink/45 sm:inline">
            Free Tools
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-dm text-[0.7rem] font-bold uppercase tracking-wider2 text-ink/45 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <a
          href="mailto:bmesiha@outlook.com?subject=People.Studio — Free tools call"
          className="bg-sienna px-4 py-2.5 font-dm text-[0.68rem] font-bold uppercase tracking-wider2 text-paper transition-colors hover:bg-umber"
        >
          Book a Call
        </a>
      </div>
    </nav>
  );
}
