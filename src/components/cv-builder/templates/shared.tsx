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

/**
 * Scales a Page-sized node down by `scale` and crops to a fixed visible
 * height. The scaled content is rendered at its natural scaled width and
 * horizontally centred so cards never end up with awkward empty bands.
 */
export function ScaledPreview({
  children,
  scale,
  pageWidth = 794,
  visibleHeight,
  className,
}: {
  children: ReactNode;
  scale: number;
  pageWidth?: number;
  /** Cropped visible height in px. Defaults to ~A4 aspect of the scaled width. */
  visibleHeight?: number;
  className?: string;
}) {
  const scaledWidth = pageWidth * scale;
  const cropHeight = visibleHeight ?? Math.round(scaledWidth * 1.15);
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-clay/40 flex justify-center",
        className,
      )}
      style={{ height: cropHeight }}
    >
      <div
        className="relative"
        style={{ width: scaledWidth, height: cropHeight, overflow: "hidden" }}
      >
        <div
          style={{
            width: pageWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
