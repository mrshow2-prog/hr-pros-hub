import type { Document } from "docx";
import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import {
  buildModernDoc, buildClassicDoc, buildExecutiveDoc, buildSkillsFirstDoc,
} from "./singleColumn";
import { buildCompactDoc } from "./compact";

export function buildDocxByTemplate(
  cv: GeneratedCV,
  template: TemplateId,
  photoUrl: string | null,
): Promise<Document> {
  switch (template) {
    case "classic": return buildClassicDoc(cv, photoUrl);
    case "executive": return buildExecutiveDoc(cv, photoUrl);
    case "compact": return buildCompactDoc(cv, photoUrl);
    case "skills-first": return buildSkillsFirstDoc(cv, photoUrl);
    case "modern":
    default: return buildModernDoc(cv, photoUrl);
  }
}
