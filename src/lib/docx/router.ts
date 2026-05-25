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
    case "london":    return buildLondonDoc(cv, photoUrl);
    case "zurich":    return buildZurichDoc(cv, photoUrl);
    case "singapore": return buildCompactDoc(cv, photoUrl);
    case "berlin":    return buildBerlinDoc(cv, photoUrl);
    case "riyadh":    return buildRiyadhDoc(cv, photoUrl);
    case "geneva":    return buildGenevaDoc(cv, photoUrl);
    case "dubai":
    default:          return buildDubaiDoc(cv, photoUrl);
  }
}
