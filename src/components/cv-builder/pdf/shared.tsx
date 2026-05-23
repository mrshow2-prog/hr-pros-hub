import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { GeneratedCV, CVExperience, SectionKey } from "@/contexts/CVBuilderContext";
import type { TemplateConfig } from "@/lib/cvTemplateConfig";

export const INK = "#111827";
export const SUBINK = "#374151";
export const MUTED = "#6b7280";
export const HAIRLINE = "#e5e7eb";

export interface PdfProps {
  cv: GeneratedCV;
  photoDataUrl: string | null;
}

/* ---------- helpers ---------- */
export function contactItems(cv: GeneratedCV): string[] {
  return [
    cv.contact.email,
    cv.contact.phone,
    cv.contact.location,
    cv.contact.linkedinUrl,
  ].filter(Boolean) as string[];
}

export function isHidden(cv: GeneratedCV, key: SectionKey) {
  return new Set<SectionKey>(cv.hiddenSections).has(key);
}

export function periodOf(exp: CVExperience) {
  return [exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period || "";
}

export function visibleBullets(exp: CVExperience) {
  return exp.bullets.filter(
    (b) => b.status !== "reverted" && (b.rewrite || b.original),
  );
}

/* ---------- shared style factory ---------- */
export function baseStyles(cfg: TemplateConfig) {
  return StyleSheet.create({
    runningHeader: {
      position: "absolute",
      top: 18,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.6,
      borderBottomColor: HAIRLINE,
      paddingBottom: 4,
    },
    runningName: {
      fontFamily: cfg.headingFont,
      fontSize: 9,
      color: cfg.primaryColor,
      letterSpacing: cfg.headingUppercase ? 0.8 : 0,
      textTransform: cfg.headingUppercase ? "uppercase" : "none",
    },
    runningPage: { fontSize: 8.5, color: MUTED },
    footer: {
      position: "absolute",
      bottom: 16,
      left: 40,
      right: 40,
      textAlign: "center",
      color: MUTED,
      fontSize: 7.5,
      letterSpacing: 0.4,
    },
  });
}

export function RunningHeaderAndFooter({
  cv,
  cfg,
}: {
  cv: GeneratedCV;
  cfg: TemplateConfig;
}) {
  const s = baseStyles(cfg);
  return (
    <>
      <View
        fixed
        render={({ pageNumber }) =>
          pageNumber > 1 ? (
            <View style={s.runningHeader}>
              <Text style={s.runningName}>{cv.contact.name || ""}</Text>
              <Text style={s.runningPage}>Page {pageNumber}</Text>
            </View>
          ) : <View />
        }
      />
      <Text
        fixed
        style={s.footer}
        render={({ pageNumber, totalPages }) =>
          totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
        }
      />
    </>
  );
}

export function PhotoImg({
  url,
  size,
  shape,
  marginBottom,
}: {
  url: string;
  size: number;
  shape: "circle" | "square";
  marginBottom?: number;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={url}
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? 999 : 4,
        objectFit: "cover",
        marginBottom: marginBottom ?? 0,
      }}
    />
  );
}
