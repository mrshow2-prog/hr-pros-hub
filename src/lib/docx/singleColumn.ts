import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { buildFlowingDoc } from "./flow";

export const buildModernDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "modern", {
    headingVariant: "bar",
    sections: ["summary", "experience", "education", "skills", "languages"],
    photo: { url: photoUrl, size: 90, shape: "square" },
    nameSize: 48,
  });

export const buildClassicDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "classic", {
    headingVariant: "underline",
    sections: ["summary", "experience", "education", "skills", "languages"],
    photo: { url: photoUrl, size: 90, shape: "circle" },
    nameSize: 44,
  });

export const buildExecutiveDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "executive", {
    headingVariant: "underline",
    sections: ["summary", "experience", "education", "skills", "languages"],
    photo: { url: photoUrl, size: 110, shape: "circle" },
    nameSize: 56,
    headingMap: { summary: "Executive Summary", experience: "Professional Experience", skills: "Core Competencies" },
  });

export const buildSkillsFirstDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "skills-first", {
    headingVariant: "underline",
    sections: ["summary", "skills-pills", "experience", "education", "languages"],
    photo: { url: photoUrl, size: 90, shape: "circle" },
    nameSize: 44,
  });
