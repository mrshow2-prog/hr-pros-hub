import { ReactNode } from "react";
import { MapPin, Phone, Mail, Linkedin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";

/** Strip protocol and leading "www." for compact display. */
export function stripUrlPrefix(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

export type PhotoShape = "circle" | "square-sm" | "square";
export type PhotoPos = "left" | "right";

export function isVisible(cv: GeneratedCV, key: SectionKey) {
  return !cv.hiddenSections.includes(key);
}

export function cleanBulletText(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—•▪·*]+\s*/, "")
    .trim();
}

export function visibleBullets(exp: GeneratedCV["experience"][number]) {
  return exp.bullets
    .map((b) => ({
      ...b,
      rewrite: cleanBulletText(b.rewrite),
      original: cleanBulletText(b.original),
    }))
    .filter((b) => b.status !== "reverted" && (b.rewrite || b.original));
}

export function ContactLine({ cv, className }: { cv: GeneratedCV; className?: string }) {
  const items: { icon: typeof MapPin; label: string }[] = [];
  if (cv.contact.location) items.push({ icon: MapPin, label: cv.contact.location });
  if (cv.contact.phone) items.push({ icon: Phone, label: cv.contact.phone });
  if (cv.contact.email) items.push({ icon: Mail, label: cv.contact.email });
  if (cv.contact.linkedinUrl)
    items.push({ icon: Linkedin, label: stripUrlPrefix(cv.contact.linkedinUrl) });
  if (cv.contact.website)
    items.push({ icon: Globe, label: stripUrlPrefix(cv.contact.website) });
  return (
    <div className={cn("flex flex-wrap gap-x-5 gap-y-1", className)}>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <Icon className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} />
          <span>{label}</span>
        </span>
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
        "mx-auto w-[794px] max-w-full bg-white text-ink font-dm text-left",
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
  const hasExplicitHeight = typeof visibleHeight === "number";
  const topInset = 22;
  const cropHeight = (hasExplicitHeight ? visibleHeight : Math.round(scaledWidth * 1.15)) + topInset;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-white flex justify-center",
        className,
      )}
      style={hasExplicitHeight ? { height: cropHeight } : undefined}
    >
      <div
        className="relative"
        style={{ width: scaledWidth, height: cropHeight, overflow: "hidden", paddingTop: topInset, background: "white" }}
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
