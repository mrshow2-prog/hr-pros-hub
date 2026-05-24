import { Link } from "react-router-dom";

interface SiteFooterProps {
  variant?: "light" | "dark";
  className?: string;
}

const LEGAL_LINKS = [
  { label: "Privacy", to: "/legal#privacy" },
  { label: "Terms", to: "/legal#terms" },
  { label: "Refunds", to: "/legal#refunds" },
];

export default function SiteFooter({ variant = "light", className = "" }: SiteFooterProps) {
  const dark = variant === "dark";
  const baseText = dark ? "text-paper/55" : "text-ink/50";
  const linkText = dark ? "text-paper/55 hover:text-paper" : "text-ink/55 hover:text-ink";
  const divider = dark ? "border-paper/15" : "border-ink/10";
  const dot = dark ? "bg-paper/25" : "bg-ink/20";

  return (
    <footer className={`border-t ${divider} px-6 py-6 font-dm text-[0.66rem] font-medium uppercase tracking-wider ${baseText} md:px-10 ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <span>
          © {new Date().getFullYear()} People Studio CV ·{" "}
          <a href="https://peoplestudiohr.com" className={linkText}>
            peoplestudiohr.com
          </a>
        </span>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGAL_LINKS.map((link, i) => (
            <span key={link.to} className="flex items-center gap-x-4">
              <Link to={link.to} className={`transition-colors ${linkText}`}>
                {link.label}
              </Link>
              {i < LEGAL_LINKS.length - 1 && <span aria-hidden className={`inline-block h-1 w-1 rounded-full ${dot}`} />}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
