import type { GeneratedCV, TemplateId } from "@/contexts/CVBuilderContext";
import PdfModern from "./PdfModern";
import PdfClassic from "./PdfClassic";
import PdfExecutive from "./PdfExecutive";
import PdfCompact from "./PdfCompact";
import PdfSkillsFirst from "./PdfSkillsFirst";

interface Props {
  cv: GeneratedCV;
  template: TemplateId;
  photoDataUrl: string | null;
}

export default function PdfRouter({ cv, template, photoDataUrl }: Props) {
  switch (template) {
    case "classic":
      return <PdfClassic cv={cv} photoDataUrl={photoDataUrl} />;
    case "executive":
      return <PdfExecutive cv={cv} photoDataUrl={photoDataUrl} />;
    case "compact":
      return <PdfCompact cv={cv} photoDataUrl={photoDataUrl} />;
    case "skills-first":
      return <PdfSkillsFirst cv={cv} photoDataUrl={photoDataUrl} />;
    case "modern":
    default:
      return <PdfModern cv={cv} photoDataUrl={photoDataUrl} />;
  }
}
