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
  // Traditional — traditional serif, single column, underline headings, circle photo
  traditional: {
    primaryColor: SIENNA,
    headingFont: "Times-Roman",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "underline",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
  // Simple — clean contemporary, accent bar, square photo
  simple: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
  // Detailed — dense, two-column information-rich
  detailed: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "underline",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Skills — skills-led with pill chips
  skills: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "none",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Executive — premium executive serif
  executive: {
    primaryColor: SIENNA,
    headingFont: "Times-Bold",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "none",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Bold — bold dark sidebar
  bold: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "none",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "sidebar",
    headingUppercase: true,
  },
  // Editorial — editorial timeline, serif headings
  editorial: {
    primaryColor: SIENNA,
    headingFont: "Times-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "underline",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Vibrant — modern two-column with rich coloured sidebar
  vibrant: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "sidebar",
    headingUppercase: true,
  },
  // Gradient — gradient header band with overlapping photo
  gradient: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    sectionDividerStyle: "bar",
    photoStyle: "circle",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: false,
  },
  // Creative — editorial creative with monogram and year markers
  creative: {
    primaryColor: SIENNA,
    headingFont: "Helvetica-Bold",
    bodyFont: "Times-Roman",
    sectionDividerStyle: "bar",
    photoStyle: "square",
    photoPosition: "top-left",
    layoutStyle: "single-column",
    headingUppercase: true,
  },
};

export function getTemplateConfig(id: TemplateId | string | null | undefined): TemplateConfig {
  return TEMPLATE_CONFIG[normalizeTemplateId(id)];
}
