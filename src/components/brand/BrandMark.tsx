import { Link } from "react-router-dom";
import logo from "@/assets/people-studio-logo.png.asset.json";

interface BrandMarkProps {
  to?: string;
  className?: string;
  logoHeightClass?: string;
}

export default function BrandMark({
  to = "/",
  className = "",
  logoHeightClass = "h-7 md:h-8",
}: BrandMarkProps) {
  return (
    <Link
      to={to}
      aria-label="People Studio CV — home"
      className={`inline-flex items-center gap-2 leading-none ${className}`}
    >
      <img
        src={logo.url}
        alt="People Studio"
        className={`${logoHeightClass} w-auto select-none`}
        draggable={false}
      />
      <span className="font-syne text-lg md:text-xl tracking-tight text-sienna">
        CV
      </span>
    </Link>
  );
}
