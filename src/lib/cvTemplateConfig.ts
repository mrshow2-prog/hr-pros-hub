import type { TemplateId } from "@/contexts/CVBuilderContext";

export interface TemplateConfig {
  primaryColor: string;
  headingFont: string;
  bodyFont: string;
  sectionDividerStyle: "underline" | "bar" | "none";
  photoStyle: "circle" | "square" | "none";
  photoPosition: "top-left" | "top-right";
  layoutStyle: "sidebar" | "single-column";
  headingUppercase: boolean;
}

export const TEMPLATE_CONFIG: Record<TemplateId, TemplateConfig> = {
  classic: {
    primaryColor: "#1f2937",
    headingFont: "Times-Roman",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "underline",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
  modern: {
    primaryColor: "#b8552a",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "sidebar",
    headingUppercase: true,
  },
  compact: {
    primaryColor: "#0f172a",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "underline",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  "skills-first": {
    primaryColor: "#0d7a5f",
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "sidebar",
    headingUppercase: true,
  },
  executive: {
    primaryColor: "#0f1b3d",
    headingFont: "Times-Bold",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "underline",
    photoStyle: "circle",
    photoPosition: "top-right",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
};

export function getTemplateConfig(id: TemplateId | null | undefined): TemplateConfig {
  return TEMPLATE_CONFIG[id ?? "modern"] ?? TEMPLATE_CONFIG.modern;
}
