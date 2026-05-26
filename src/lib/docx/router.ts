import type { Document } from "docx";
import { normalizeTemplateId, type GeneratedCV, type TemplateId } from "@/contexts/CVBuilderContext";
import {
  buildDubaiDoc, buildLondonDoc, buildZurichDoc, buildBerlinDoc, buildGenevaDoc,
} from "./singleColumn";
import { buildCompactDoc } from "./compact";
import { buildRiyadhDoc } from "./sidebar";

export function buildDocxByTemplate(
  cv: GeneratedCV,
  template: TemplateId | string,
  photoUrl: string | null,
): Promise<Document> {
  switch (normalizeTemplateId(template)) {
    case "traditional": return buildLondonDoc(cv, photoUrl);
    case "executive":   return buildZurichDoc(cv, photoUrl);
    case "detailed":    return buildCompactDoc(cv, photoUrl);
    case "skills":      return buildBerlinDoc(cv, photoUrl);
    case "bold":        return buildRiyadhDoc(cv, photoUrl);
    case "editorial":   return buildGenevaDoc(cv, photoUrl);
    // New templates route to the closest existing docx builder.
    case "vibrant":     return buildRiyadhDoc(cv, photoUrl);
    case "gradient":    return buildDubaiDoc(cv, photoUrl);
    case "creative":    return buildGenevaDoc(cv, photoUrl);
    case "simple":
    default:            return buildDubaiDoc(cv, photoUrl);
  }
}
