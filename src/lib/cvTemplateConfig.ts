import { normalizeTemplateId, type TemplateId } from "@/contexts/CVBuilderContext";

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

/** Brand sienna across the board — every template uses the same accent
 *  so that exports and the wizard preview share a consistent palette. */
const SIENNA = "#9c5643";

export const TEMPLATE_CONFIG: Record<TemplateId, TemplateConfig> = {
  // London — traditional serif, single column, underline headings, circle photo
  london: {
    primaryColor: SIENNA,
    headingFont: "Times-Roman",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "underline",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
  // Dubai — clean contemporary, accent bar, square photo
  dubai: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
  // Singapore — dense, two-column information-rich
  singapore: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "underline",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Berlin — skills-led with pill chips
  berlin: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "none",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Zurich — premium executive serif
  zurich: {
    primaryColor: SIENNA,
    headingFont: "Times-Bold",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "none",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Riyadh — bold dark sidebar
  riyadh: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "none",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "sidebar",
    headingUppercase: true,
  },
  // Geneva — editorial timeline, serif headings
  geneva: {
    primaryColor: SIENNA,
    headingFont: "Times-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "underline",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
};

export function getTemplateConfig(id: TemplateId | string | null | undefined): TemplateConfig {
  return TEMPLATE_CONFIG[normalizeTemplateId(id)];
}
