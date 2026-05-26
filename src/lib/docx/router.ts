import type { Document } from "docx";
import { normalizeTemplateId, type GeneratedCV, type TemplateId } from "@/contexts/CVBuilderContext";
import {
  buildDubaiDoc, buildLondonDoc, buildZurichDoc, buildBerlinDoc, buildGenevaDoc,
} from "./singleColumn";
import { buildCompactDoc } from "./compact";
import { buildRiyadhDoc } from "./sidebar";
import { setDocxAccent } from "./shared";

export interface DocxOptions {
  accentHex?: string | null;
  photoShape?: "circle" | "square" | "none";
}

export async function buildDocxByTemplate(
  cv: GeneratedCV,
  template: TemplateId | string,
  photoUrl: string | null,
  opts?: DocxOptions,
): Promise<Document> {
  setDocxAccent(opts?.accentHex ?? null);

  // Honour photo shape: drop the photo entirely when shape is "none", and
  // pre-mask to a circle so the docx ImageRun renders a round photo.
  let effectivePhoto = photoUrl;
  if (opts?.photoShape === "none") {
    effectivePhoto = null;
  } else if (effectivePhoto && opts?.photoShape === "circle") {
    try {
      const { maskImageCircle } = await import("@/lib/cv/pdfme/core");
      effectivePhoto = (await maskImageCircle(effectivePhoto)) ?? effectivePhoto;
    } catch {
      /* fallback: keep original photo */
    }
  }

  switch (normalizeTemplateId(template)) {
    case "traditional": return buildLondonDoc(cv, effectivePhoto);
    case "executive":   return buildZurichDoc(cv, effectivePhoto);
    case "detailed":    return buildCompactDoc(cv, effectivePhoto);
    case "skills":      return buildBerlinDoc(cv, effectivePhoto);
    case "bold":        return buildRiyadhDoc(cv, effectivePhoto);
    case "editorial":   return buildGenevaDoc(cv, effectivePhoto);
    // New templates route to the closest existing docx builder.
    case "vibrant":     return buildRiyadhDoc(cv, effectivePhoto);
    case "gradient":    return buildDubaiDoc(cv, effectivePhoto);
    case "creative":    return buildGenevaDoc(cv, effectivePhoto);
    case "simple":
    default:            return buildDubaiDoc(cv, effectivePhoto);
  }
}
