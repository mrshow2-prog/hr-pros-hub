import type { SectionKey, TemplateId } from "@/contexts/CVBuilderContext";
import { normalizeTemplateId } from "@/contexts/CVBuilderContext";

/** Sections that the user can toggle between the sidebar and the main body. */
export const TOGGLEABLE_SECTIONS: SectionKey[] = [
  "skills",
  "education",
  "languages",
  "certifications",
];

/** Templates that have a dedicated sidebar/banner column. */
export const MULTI_COLUMN_TEMPLATES: TemplateId[] = ["bold", "vibrant"];

export function isMultiColumn(template: TemplateId | string | null | undefined): boolean {
  if (!template) return false;
  return MULTI_COLUMN_TEMPLATES.includes(normalizeTemplateId(template));
}

/** Default placement when the user hasn't explicitly chosen one. */
export const DEFAULT_PLACEMENT: Record<SectionKey, "sidebar" | "main"> = {
  contact: "main",
  summary: "main",
  experience: "main",
  skills: "sidebar",
  education: "sidebar",
  languages: "sidebar",
  competencies: "main",
  achievements: "main",
  certifications: "main",
  custom: "main",
};

export type SidebarPlacementMap = Partial<Record<SectionKey, "sidebar" | "main">>;

export function placementFor(
  key: SectionKey,
  overrides: SidebarPlacementMap | undefined | null,
): "sidebar" | "main" {
  return overrides?.[key] ?? DEFAULT_PLACEMENT[key];
}

/** Effective set of sidebar section keys for a multi-column template. */
export function getSidebarKeys(
  overrides: SidebarPlacementMap | undefined | null,
): SectionKey[] {
  return TOGGLEABLE_SECTIONS.filter((k) => placementFor(k, overrides) === "sidebar");
}
