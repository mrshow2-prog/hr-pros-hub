import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";

export type PhotoShape = "circle" | "square-sm" | "square";
export type PhotoPos = "left" | "right";

export function isVisible(cv: GeneratedCV, key: SectionKey) {
  return !cv.hiddenSections.includes(key);
}

export function ContactLine({ cv, className }: { cv: GeneratedCV; className?: string }) {
  const items = [
    cv.contact.location,
    cv.contact.phone,
    cv.contact.email,
    cv.contact.linkedinUrl,
  ].filter(Boolean);
  return (
    <div className={cn("flex flex-wrap gap-x-5 gap-y-1", className)}>
      {items.map((it) => (
        <span key={it}>{it}</span>
      ))}
    </div>
  );
}

export function Photo({
  url,
  shape,
  size,
  className,
}: {
  url: string | null;
  shape: "circle" | "square";
  size: number;
  className?: string;
}) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      style={{ width: size, height: size }}
      className={cn(
        "shrink-0 object-cover border border-ink/10",
        shape === "circle" ? "rounded-full" : "rounded",
        className,
      )}
    />
  );
}

/** A4 page wrapper. ~794px wide, generous padding overridden per-template. */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-[794px] max-w-full min-h-[1123px] bg-white text-ink shadow-sm font-dm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Scales any node (e.g. <Page />) down by `scale` inside a clipped container. */
export function ScaledPreview({
  children,
  scale,
  width = 794,
  height,
  className,
}: {
  children: ReactNode;
  scale: number;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-clay/40", className)}
      style={{ width: "100%", height: height ?? "auto", aspectRatio: !height ? "794 / 500" : undefined }}
    >
      <div
        style={{
          width,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
