import { normalizeTemplateId, type GeneratedCV, type TemplateId } from "@/contexts/CVBuilderContext";
import TemplateClassic from "./TemplateClassic";
import TemplateModern from "./TemplateModern";
import TemplateCompact from "./TemplateCompact";
import TemplateSkillsFirst from "./TemplateSkillsFirst";
import TemplateExecutive from "./TemplateExecutive";
import TemplateRiyadh from "./TemplateRiyadh";
import TemplateGeneva from "./TemplateGeneva";

export interface CVRendererProps {
  cv: GeneratedCV;
  template: TemplateId | string | null | undefined;
  photoUrl: string | null;
}

export default function CVRenderer({ cv, template, photoUrl }: CVRendererProps) {
  switch (normalizeTemplateId(template)) {
    case "london":
      return <TemplateClassic cv={cv} photoUrl={photoUrl} />;
    case "dubai":
      return <TemplateModern cv={cv} photoUrl={photoUrl} />;
    case "singapore":
      return <TemplateCompact cv={cv} photoUrl={photoUrl} />;
    case "berlin":
      return <TemplateSkillsFirst cv={cv} photoUrl={photoUrl} />;
    case "zurich":
      return <TemplateExecutive cv={cv} photoUrl={photoUrl} />;
    case "riyadh":
      return <TemplateRiyadh cv={cv} photoUrl={photoUrl} />;
    case "geneva":
      return <TemplateGeneva cv={cv} photoUrl={photoUrl} />;
    default:
      return <TemplateModern cv={cv} photoUrl={photoUrl} />;
  }
}

/** Built-in sample CV used for selector previews. */
export const SAMPLE_CV: GeneratedCV = {
  contact: {
    name: "Ahmed Al-Mansouri",
    jobTitle: "Senior HR Business Partner",
    email: "ahmed@example.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    linkedinUrl: "linkedin.com/in/almansouri",
    website: "almansouri.com",
    photoPath: null,
  },
  summary:
    "Strategic HR leader with 12+ years of experience driving organizational development and talent management across MENA markets. Proven track record in implementing Emiratisation initiatives, reducing turnover by 34%, and building high-performance cultures in fast-growth environments. Expert in UAE labour law, MOHRE compliance, and cross-cultural team leadership.",
  experience: [
    {
      id: "e1",
      role: "Senior HR Business Partner",
      company: "Emirates Financial Services",
      location: "Dubai, UAE",
      startDate: "Jan 2020",
      endDate: "Present",
      bullets: [
        { id: "b1", original: "", rewrite: "Reduced employee turnover from 28% to 19% through redesigned onboarding and retention programs.", explanation: "", status: "accepted" },
        { id: "b2", original: "", rewrite: "Achieved 4.2% Emiratisation rate, exceeding MOHRE targets and avoiding AED 850K in potential fines.", explanation: "", status: "accepted" },
        { id: "b3", original: "", rewrite: "Implemented new HRIS serving 450+ employees, reducing payroll processing time by 60%.", explanation: "", status: "accepted" },
      ],
    },
    {
      id: "e2",
      role: "HR Manager",
      company: "Al-Futtaim Group",
      location: "Dubai, UAE",
      startDate: "Mar 2017",
      endDate: "Dec 2019",
      bullets: [
        { id: "b4", original: "", rewrite: "Designed leadership development program for 45 managers, improving engagement scores by 23%.", explanation: "", status: "accepted" },
        { id: "b5", original: "", rewrite: "Streamlined recruitment cycle from 45 to 28 days while maintaining quality of hire above 85%.", explanation: "", status: "accepted" },
      ],
    },
  ],
  skills: [
    "Talent Acquisition & Retention",
    "UAE Labour Law Compliance",
    "Emiratisation Strategy",
    "Performance Management",
    "Organizational Development",
    "MOHRE & WPS Systems",
    "Employee Relations",
    "Compensation & Benefits",
  ],
  education: [
    { id: "ed1", qualification: "Master of Business Administration (MBA)", institution: "American University of Sharjah", period: "2016" },
    { id: "ed2", qualification: "BA Business Administration", institution: "United Arab Emirates University", period: "2012" },
  ],
  competencyClusters: [],
  languages: [
    { id: "l1", name: "Arabic", level: "Native" },
    { id: "l2", name: "English", level: "Fluent" },
    { id: "l3", name: "French", level: "Conversational" },
  ],
  achievements: [],
  certifications: [],
  customSections: [],
  hiddenSections: [],
};
