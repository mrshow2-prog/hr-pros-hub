import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type Seniority = "" | "graduate" | "mid" | "senior" | "director" | "executive";
export type CVType = "" | "chronological" | "skills" | "hybrid";
export type Tone = "" | "conservative" | "balanced" | "modern";
export type TemplateId = "classic" | "modern" | "compact" | "skills-first" | "executive";
export type TypeOption = "light" | "dark";
export type PaymentStatus = "unpaid" | "pending" | "paid";

export type SectionKey =
  | "contact"
  | "summary"
  | "experience"
  | "skills"
  | "education"
  | "competencies"
  | "languages";

export interface UploadedFile {
  path: string;
  name: string;
  size: number;
}

export interface IntentForm {
  targetRoles: string[];
  functionArea: string;
  targetIndustry: string | null;
  industryAgnostic: boolean;
  seniority: Seniority;
  cvType: CVType;
  tone: Tone;
  /** null = unlimited pages */
  pageLimit: number | null;
}

export interface Gap {
  id: string;
  category: string;
  example: string;
  question: string;
  layer?: "writing" | "expectation";
}

/** Free text for writing-layer gaps, structured yes/no for expectation gaps */
export type GapResponse = string | { confirm: "yes" | "no"; details?: string };

export interface GapAnalysis {
  gaps: Gap[];
  responses: Record<string, GapResponse>;
}

export interface CVBullet {
  id: string;
  original: string;
  rewrite: string;
  explanation: string;
  status: "accepted" | "edited" | "reverted";
}

export interface CVExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  /** Legacy / display fallback */
  period?: string;
  bullets: CVBullet[];
}

export interface CVEducation {
  id: string;
  institution: string;
  qualification: string;
  period: string;
}

export interface CompetencyCluster {
  id: string;
  title: string;
  items: string[];
}

export interface LanguageEntry {
  id: string;
  name: string;
  level: "Basic" | "Conversational" | "Professional" | "Fluent" | "Native";
}

export interface ContactInfo {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  photoPath: string | null;
}

export interface GeneratedCV {
  contact: ContactInfo;
  summary: string;
  experience: CVExperience[];
  skills: string[];
  education: CVEducation[];
  competencyClusters: CompetencyCluster[];
  languages: LanguageEntry[];
  hiddenSections: SectionKey[];
}

export type AtsSeverity = "critical" | "warning" | "info";

export interface AtsJumpTarget {
  section: SectionKey;
  expId?: string;
  bulletId?: string;
  edId?: string;
  field?: string;
}

export type AtsAutoFix =
  | { kind: "summary"; action: "expand" | "condense" | "rewrite" }
  | { kind: "bullets"; expId: string; action: "rewrite" | "expand" | "condense" };

export interface AtsFinding {
  id: string;
  severity: AtsSeverity;
  label: string;
  fix: string;
  jumpTo?: AtsJumpTarget;
  autoFix?: AtsAutoFix;
}

export interface AtsScore {
  overall: number;
  keywordMatch: number;
  formatting: { label: string; pass: boolean }[];
  readability: number;
  findings?: AtsFinding[];
  sectionScores?: { label: string; score: number }[];
}

export interface CVBuilderState {
  sessionId: string;
  anonToken: string;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  uploadedFiles: UploadedFile[];
  parsedText: string;
  photoPath: string | null;
  intentForm: IntentForm;
  gapAnalysis: GapAnalysis;
  paymentStatus: PaymentStatus;
  selectedTemplate: TemplateId | null;
  typeOption: TypeOption;
  generatedCV: GeneratedCV | null;
  atsScore: AtsScore | null;
  lastSavedAt: number | null;
  lastScoredAt: number | null;
}

// ---------- Defaults & storage ----------

const LS_SESSION_KEY = "cv_builder_session_id";
const LS_TOKEN_KEY = "cv_builder_anon_token";

const randomToken = () =>
  (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 48);

const defaultIntent: IntentForm = {
  targetRoles: [],
  functionArea: "",
  targetIndustry: "",
  industryAgnostic: false,
  seniority: "",
  cvType: "",
  tone: "",
  pageLimit: null,
};

const emptyContact: ContactInfo = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  photoPath: null,
};

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

/** Normalises whatever shape we get (legacy/stub/generated) into the full GeneratedCV */
export function hydrateGeneratedCV(raw: Partial<GeneratedCV> | null | undefined): GeneratedCV {
  return {
    contact: { ...emptyContact, ...(raw?.contact ?? {}) },
    summary: raw?.summary ?? "",
    experience: (raw?.experience ?? []).map((e) => ({
      id: e.id ?? newId("exp"),
      company: e.company ?? "",
      role: e.role ?? "",
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      period: e.period ?? "",
      bullets: (e.bullets ?? []).map((b) => ({
        id: b.id ?? newId("b"),
        original: b.original ?? "",
        rewrite: b.rewrite ?? "",
        explanation: b.explanation ?? "",
        status: b.status ?? "accepted",
      })),
    })),
    skills: raw?.skills ?? [],
    education: (raw?.education ?? []).map((ed) => ({
      id: ed.id ?? newId("ed"),
      institution: ed.institution ?? "",
      qualification: ed.qualification ?? "",
      period: ed.period ?? "",
    })),
    competencyClusters: (raw?.competencyClusters ?? []).map((c) => ({
      id: c.id ?? newId("cl"),
      title: c.title ?? "",
      items: c.items ?? [],
    })),
    languages: (raw?.languages ?? []).map((l) => ({
      id: l.id ?? newId("lang"),
      name: l.name ?? "",
      level: l.level ?? "Professional",
    })),
    hiddenSections: raw?.hiddenSections ?? [],
  };
}

const buildInitialState = (): CVBuilderState => {
  const sessionId = localStorage.getItem(LS_SESSION_KEY) ?? crypto.randomUUID();
  const anonToken = localStorage.getItem(LS_TOKEN_KEY) ?? randomToken();
  localStorage.setItem(LS_SESSION_KEY, sessionId);
  localStorage.setItem(LS_TOKEN_KEY, anonToken);
  return {
    sessionId,
    anonToken,
    currentStep: 1,
    uploadedFiles: [],
    parsedText: "",
    photoPath: null,
    intentForm: defaultIntent,
    gapAnalysis: { gaps: [], responses: {} },
    paymentStatus: "unpaid",
    selectedTemplate: null,
    typeOption: "light",
    generatedCV: null,
    atsScore: null,
    lastSavedAt: null,
    lastScoredAt: null,
  };
};

// ---------- Context shape ----------

interface CVBuilderContextValue {
  state: CVBuilderState;
  loading: boolean;
  setStep: (step: CVBuilderState["currentStep"]) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  setParsedText: (text: string) => void;
  setPhotoPath: (path: string | null) => void;
  patchIntent: (patch: Partial<IntentForm>) => void;
  setGaps: (gaps: Gap[]) => void;
  setGapResponse: (id: string, value: GapResponse) => void;
  setPayment: (status: PaymentStatus) => void;
  setTemplate: (id: TemplateId) => void;
  setTypeOption: (opt: TypeOption) => void;
  setGeneratedCV: (cv: Partial<GeneratedCV> | null) => void;

  // Editing mutators
  patchContact: (patch: Partial<ContactInfo>) => void;
  patchSummary: (summary: string) => void;
  patchExperience: (expId: string, patch: Partial<CVExperience>) => void;
  addExperience: () => void;
  removeExperience: (expId: string) => void;
  updateBullet: (experienceId: string, bulletId: string, patch: Partial<CVBullet>) => void;
  replaceBullets: (experienceId: string, newRewrites: string[]) => void;
  addBullet: (experienceId: string) => void;
  removeBullet: (experienceId: string, bulletId: string) => void;
  setSkills: (skills: string[]) => void;
  patchEducation: (edId: string, patch: Partial<CVEducation>) => void;
  addEducation: () => void;
  removeEducation: (edId: string) => void;
  patchCluster: (clId: string, patch: Partial<CompetencyCluster>) => void;
  addCluster: () => void;
  removeCluster: (clId: string) => void;
  setLanguages: (languages: LanguageEntry[]) => void;
  toggleSection: (key: SectionKey) => void;

  setAts: (ats: AtsScore | null) => void;
  resetSession: () => void;
}

const CVBuilderContext = createContext<CVBuilderContextValue | null>(null);

// ---------- Provider ----------

export function CVBuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CVBuilderState>(() => buildInitialState());
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<number | null>(null);
  const hydrated = useRef(false);

  // Hydrate from Supabase
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("cv_builder_sessions")
        .select("state, payment_status")
        .eq("id", state.sessionId)
        .maybeSingle();
      if (!active) return;
      if (!error && data?.state) {
        const remote = data.state as Partial<CVBuilderState>;
        setState((prev) => ({
          ...prev,
          ...remote,
          generatedCV: remote.generatedCV ? hydrateGeneratedCV(remote.generatedCV) : null,
          sessionId: prev.sessionId,
          anonToken: prev.anonToken,
          paymentStatus: (data.payment_status as PaymentStatus) ?? prev.paymentStatus,
        }));
      }
      hydrated.current = true;
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persistence
  useEffect(() => {
    if (!hydrated.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id ?? null;
      const { sessionId, anonToken: _anonToken, lastSavedAt, ...persisted } = state;
      if (!userId) return; // auth required
      const { error } = await supabase.from("cv_builder_sessions").upsert(
        [
          {
            id: sessionId,
            user_id: userId,
            state: persisted as unknown as any,
            payment_status: state.paymentStatus,
          },
        ],
        { onConflict: "id" },
      );
      if (!error) {
        setState((s) => ({ ...s, lastSavedAt: Date.now() }));
      }
    }, 1000);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // Only persist on meaningful state changes (exclude lastSavedAt to avoid loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.currentStep,
    state.uploadedFiles,
    state.parsedText,
    state.photoPath,
    state.intentForm,
    state.gapAnalysis,
    state.paymentStatus,
    state.selectedTemplate,
    state.typeOption,
    state.generatedCV,
    state.atsScore,
    state.lastScoredAt,
  ]);

  const patchCV = useCallback(
    (mutator: (cv: GeneratedCV) => GeneratedCV) => {
      setState((s) => (s.generatedCV ? { ...s, generatedCV: mutator(s.generatedCV) } : s));
    },
    [],
  );

  const value = useMemo<CVBuilderContextValue>(
    () => ({
      state,
      loading,
      setStep: (step) => setState((s) => ({ ...s, currentStep: step })),
      setUploadedFiles: (files) => setState((s) => ({ ...s, uploadedFiles: files })),
      setParsedText: (text) => setState((s) => ({ ...s, parsedText: text })),
      setPhotoPath: (path) => setState((s) => ({ ...s, photoPath: path })),
      patchIntent: (patch) =>
        setState((s) => ({ ...s, intentForm: { ...s.intentForm, ...patch } })),
      setGaps: (gaps) =>
        setState((s) => ({ ...s, gapAnalysis: { ...s.gapAnalysis, gaps } })),
      setGapResponse: (id, value) =>
        setState((s) => ({
          ...s,
          gapAnalysis: {
            ...s.gapAnalysis,
            responses: { ...s.gapAnalysis.responses, [id]: value },
          },
        })),
      setPayment: (status) => setState((s) => ({ ...s, paymentStatus: status })),
      setTemplate: (id) => setState((s) => ({ ...s, selectedTemplate: id })),
      setTypeOption: (opt) => setState((s) => ({ ...s, typeOption: opt })),
      setGeneratedCV: (cv) =>
        setState((s) => ({ ...s, generatedCV: cv ? hydrateGeneratedCV(cv) : null })),

      patchContact: (patch) =>
        patchCV((cv) => ({ ...cv, contact: { ...cv.contact, ...patch } })),
      patchSummary: (summary) => patchCV((cv) => ({ ...cv, summary })),
      patchExperience: (expId, patch) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.map((e) => (e.id === expId ? { ...e, ...patch } : e)),
        })),
      addExperience: () =>
        patchCV((cv) => ({
          ...cv,
          experience: [
            ...cv.experience,
            {
              id: newId("exp"),
              company: "",
              role: "",
              location: "",
              startDate: "",
              endDate: "",
              bullets: [],
            },
          ],
        })),
      removeExperience: (expId) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.filter((e) => e.id !== expId),
        })),
      updateBullet: (experienceId, bulletId, patch) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.map((exp) =>
            exp.id !== experienceId
              ? exp
              : {
                  ...exp,
                  bullets: exp.bullets.map((b) =>
                    b.id === bulletId ? { ...b, ...patch } : b,
                  ),
                },
          ),
        })),
      replaceBullets: (experienceId, newRewrites) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.map((exp) => {
            if (exp.id !== experienceId) return exp;
            const next: CVBullet[] = newRewrites.map((rewrite, i) => {
              const prev = exp.bullets[i];
              if (prev) {
                return {
                  ...prev,
                  rewrite,
                  status: prev.original && prev.original === rewrite ? "accepted" : "edited",
                };
              }
              return {
                id: newId("b"),
                original: "",
                rewrite,
                explanation: "",
                status: "edited",
              };
            });
            return { ...exp, bullets: next };
          }),
        })),
      addBullet: (experienceId) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.map((exp) =>
            exp.id !== experienceId
              ? exp
              : {
                  ...exp,
                  bullets: [
                    ...exp.bullets,
                    {
                      id: newId("b"),
                      original: "",
                      rewrite: "",
                      explanation: "Added by you.",
                      status: "edited",
                    },
                  ],
                },
          ),
        })),
      removeBullet: (experienceId, bulletId) =>
        patchCV((cv) => ({
          ...cv,
          experience: cv.experience.map((exp) =>
            exp.id !== experienceId
              ? exp
              : { ...exp, bullets: exp.bullets.filter((b) => b.id !== bulletId) },
          ),
        })),
      setSkills: (skills) => patchCV((cv) => ({ ...cv, skills })),
      patchEducation: (edId, patch) =>
        patchCV((cv) => ({
          ...cv,
          education: cv.education.map((e) => (e.id === edId ? { ...e, ...patch } : e)),
        })),
      addEducation: () =>
        patchCV((cv) => ({
          ...cv,
          education: [
            ...cv.education,
            { id: newId("ed"), institution: "", qualification: "", period: "" },
          ],
        })),
      removeEducation: (edId) =>
        patchCV((cv) => ({
          ...cv,
          education: cv.education.filter((e) => e.id !== edId),
        })),
      patchCluster: (clId, patch) =>
        patchCV((cv) => ({
          ...cv,
          competencyClusters: cv.competencyClusters.map((c) =>
            c.id === clId ? { ...c, ...patch } : c,
          ),
        })),
      addCluster: () =>
        patchCV((cv) => ({
          ...cv,
          competencyClusters: [
            ...cv.competencyClusters,
            { id: newId("cl"), title: "New cluster", items: [] },
          ],
        })),
      removeCluster: (clId) =>
        patchCV((cv) => ({
          ...cv,
          competencyClusters: cv.competencyClusters.filter((c) => c.id !== clId),
        })),
      setLanguages: (languages) => patchCV((cv) => ({ ...cv, languages })),
      toggleSection: (key) =>
        patchCV((cv) => ({
          ...cv,
          hiddenSections: cv.hiddenSections.includes(key)
            ? cv.hiddenSections.filter((k) => k !== key)
            : [...cv.hiddenSections, key],
        })),

      setAts: (ats) =>
        setState((s) => ({ ...s, atsScore: ats, lastScoredAt: ats ? Date.now() : s.lastScoredAt })),
      resetSession: () => {
        localStorage.removeItem(LS_SESSION_KEY);
        localStorage.removeItem(LS_TOKEN_KEY);
        setState(buildInitialState());
      },
    }),
    [state, loading, patchCV],
  );

  return <CVBuilderContext.Provider value={value}>{children}</CVBuilderContext.Provider>;
}

export function useCVBuilder() {
  const ctx = useContext(CVBuilderContext);
  if (!ctx) throw new Error("useCVBuilder must be used within CVBuilderProvider");
  return ctx;
}
