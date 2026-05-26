import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { buildFlowingDoc } from "./flow";

export const buildDubaiDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "simple", {
    headingVariant: "bar",
    photo: { url: photoUrl, size: 100, shape: "square" },
    nameSize: 48,
  });

export const buildLondonDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "traditional", {
    headingVariant: "underline",
    photo: { url: photoUrl, size: 90, shape: "circle" },
    nameSize: 44,
    bottomRule: true,
  });

export const buildZurichDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "executive", {
    headingVariant: "none",
    photo: { url: photoUrl, size: 110, shape: "square" },
    nameSize: 56,
    quoteSummary: true,
    headingMap: {
      summary: "Executive Summary",
      experience: "Professional Experience",
      skills: "Core Competencies",
    },
  });

export const buildBerlinDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "skills", {
    headingVariant: "none",
    skillsVariant: "pills",
    photo: { url: photoUrl, size: 90, shape: "circle" },
    nameSize: 40,
    bottomRule: true,
  });

export const buildGenevaDoc = (cv: GeneratedCV, photoUrl: string | null) =>
  buildFlowingDoc(cv, "editorial", {
    headingVariant: "underline",
    photo: { url: photoUrl, size: 100, shape: "circle" },
    nameSize: 52,
    timeline: true,
    headingMap: {
      summary: "Profile",
      experience: "Career Timeline",
    },
  });
