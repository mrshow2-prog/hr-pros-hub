import { useEffect, useState } from "react";
import PsLogo from "@/components/ui/PsLogo";
import { BOOKING_HREF } from "@/lib/contact";

export default function BusinessNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Who It's For", href: "#audience" },
    { label: "Free Tools", href: "#free-tools-promo" },
    { label: "Services", href: "#services" },
    { label: "Retainers", href: "#retainers" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "hsl(var(--paper) / 0.98)" : "hsl(var(--paper) / 0.92)",
        borderBottom: scrolled ? "1px solid hsl(var(--ink) / 0.12)" : "1px solid hsl(var(--ink) / 0.06)",
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <PsLogo size="md" />
          <span className="hidden border-l border-ink/15 pl-3 font-dm text-[10px] font-bold uppercase text-ink/45 sm:inline" style={{ letterSpacing: "0.12em" }}>
            HR Advisory
          </span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-dm font-bold text-xs uppercase text-ink/50 hover:text-terracotta transition-colors duration-200"
              style={{ letterSpacing: "0.12em" }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          href={BOOKING_HREF}
          className="font-dm font-bold text-xs uppercase px-5 py-2.5 rounded-sm transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-paper"
          style={{ letterSpacing: "0.1em" }}
        >
          Book a Call
        </a>
      </div>
    </nav>
  );
}
