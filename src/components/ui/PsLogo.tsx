import { Link } from "react-router-dom";

interface PsLogoProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export default function PsLogo({ light = false, size = "md", className = "" }: PsLogoProps) {
  return (
    <Link to="/" dir="ltr" aria-label="People.Studio home" className={`inline-flex items-baseline leading-none ${sizes[size]} ${className}`}>
      <span
        className="font-serif italic font-normal text-sienna"
        style={{ letterSpacing: "0" }}
      >
        people
      </span>
      <span className="mx-[0.3em] inline-block h-[0.18em] w-[0.18em] rounded-full bg-sienna align-baseline -translate-y-[0.45em]" aria-hidden="true" />
      <span
        className={`font-dm font-medium uppercase tracking-widest2 ${light ? "text-paper" : "text-ink"}`}
        style={{ fontSize: "0.36em", transform: "translateY(-0.62em)" }}
      >
        STUDIO
      </span>
    </Link>
  );
}
