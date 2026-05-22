import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type Seniority = "" | "graduate" | "mid" | "senior" | "director" | "executive";
export type CVType = "" | "chronological" | "skills" | "hybrid";
export type Tone = "" | "conservative" | "balanced" | "modern";
export type TemplateId = "classic" | "modern" | "compact" | "skills-first" | "executive";
export type TypeOption = "light" | "dark";
export type PaymentStatus = "unpaid" | "pending" | "paid";

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
}

export interface Gap {
  id: string;
  category: string;
  example: string;
  question: string;
}

export interface GapAnalysis {
  gaps: Gap[];
  responses: Record<string, string>;
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
  period: string;
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

export interface GeneratedCV {
  summary: string;
  experience: CVExperience[];
  skills: string[];
  education: CVEducation[];
  competencyClusters?: CompetencyCluster[];
}

export interface AtsScore {
  overall: number;
  keywordMatch: number;
  formatting: { label: string; pass: boolean }[];
  readability: number;
}

export interface CVBuilderState {
  sessionId: string;
  anonToken: string;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  uploadedFiles: UploadedFile[];
  parsedText: string;
  intentForm: IntentForm;
  gapAnalysis: GapAnalysis;
  paymentStatus: PaymentStatus;
  selectedTemplate: TemplateId | null;
  typeOption: TypeOption;
  generatedCV: GeneratedCV | null;
  atsScore: AtsScore | null;
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
};

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
    intentForm: defaultIntent,
    gapAnalysis: { gaps: [], responses: {} },
    paymentStatus: "unpaid",
    selectedTemplate: null,
    typeOption: "light",
    generatedCV: null,
    atsScore: null,
  };
};

// ---------- Context shape ----------

interface CVBuilderContextValue {
  state: CVBuilderState;
  loading: boolean;
  setStep: (step: CVBuilderState["currentStep"]) => void;
  setUploadedFiles: (files: UploadedFile[]) => void;
  setParsedText: (text: string) => void;
  patchIntent: (patch: Partial<IntentForm>) => void;
  setGaps: (gaps: Gap[]) => void;
  setGapResponse: (id: string, value: string) => void;
  setPayment: (status: PaymentStatus) => void;
  setTemplate: (id: TemplateId) => void;
  setTypeOption: (opt: TypeOption) => void;
  setGeneratedCV: (cv: GeneratedCV | null) => void;
  updateBullet: (experienceId: string, bulletId: string, patch: Partial<CVBullet>) => void;
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
      const { sessionId, anonToken, ...persisted } = state;
      await supabase.from("cv_builder_sessions").upsert(
        [
          {
            id: sessionId,
            user_id: userId,
            anon_token: userId ? null : anonToken,
            state: persisted as unknown as Record<string, unknown>,
            payment_status: state.paymentStatus,
          },
        ],
        { onConflict: "id" },
      );
    }, 1000);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state]);

  const setStep = useCallback((step: CVBuilderState["currentStep"]) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);
  const setUploadedFiles = useCallback((files: UploadedFile[]) => {
    setState((s) => ({ ...s, uploadedFiles: files }));
  }, []);
  const setParsedText = useCallback((text: string) => {
    setState((s) => ({ ...s, parsedText: text }));
  }, []);
  const patchIntent = useCallback((patch: Partial<IntentForm>) => {
    setState((s) => ({ ...s, intentForm: { ...s.intentForm, ...patch } }));
  }, []);
  const setGaps = useCallback((gaps: Gap[]) => {
    setState((s) => ({ ...s, gapAnalysis: { ...s.gapAnalysis, gaps } }));
  }, []);
  const setGapResponse = useCallback((id: string, value: string) => {
    setState((s) => ({
      ...s,
      gapAnalysis: { ...s.gapAnalysis, responses: { ...s.gapAnalysis.responses, [id]: value } },
    }));
  }, []);
  const setPayment = useCallback((status: PaymentStatus) => {
    setState((s) => ({ ...s, paymentStatus: status }));
  }, []);
  const setTemplate = useCallback((id: TemplateId) => {
    setState((s) => ({ ...s, selectedTemplate: id }));
  }, []);
  const setTypeOption = useCallback((opt: TypeOption) => {
    setState((s) => ({ ...s, typeOption: opt }));
  }, []);
  const setGeneratedCV = useCallback((cv: GeneratedCV | null) => {
    setState((s) => ({ ...s, generatedCV: cv }));
  }, []);
  const updateBullet = useCallback(
    (experienceId: string, bulletId: string, patch: Partial<CVBullet>) => {
      setState((s) => {
        if (!s.generatedCV) return s;
        return {
          ...s,
          generatedCV: {
            ...s.generatedCV,
            experience: s.generatedCV.experience.map((exp) =>
              exp.id !== experienceId
                ? exp
                : {
                    ...exp,
                    bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, ...patch } : b)),
                  },
            ),
          },
        };
      });
    },
    [],
  );
  const setAts = useCallback((ats: AtsScore | null) => {
    setState((s) => ({ ...s, atsScore: ats }));
  }, []);
  const resetSession = useCallback(() => {
    localStorage.removeItem(LS_SESSION_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    setState(buildInitialState());
  }, []);

  const value = useMemo<CVBuilderContextValue>(
    () => ({
      state,
      loading,
      setStep,
      setUploadedFiles,
      setParsedText,
      patchIntent,
      setGaps,
      setGapResponse,
      setPayment,
      setTemplate,
      setTypeOption,
      setGeneratedCV,
      updateBullet,
      setAts,
      resetSession,
    }),
    [
      state,
      loading,
      setStep,
      setUploadedFiles,
      setParsedText,
      patchIntent,
      setGaps,
      setGapResponse,
      setPayment,
      setTemplate,
      setTypeOption,
      setGeneratedCV,
      updateBullet,
      setAts,
      resetSession,
    ],
  );

  return <CVBuilderContext.Provider value={value}>{children}</CVBuilderContext.Provider>;
}

export function useCVBuilder() {
  const ctx = useContext(CVBuilderContext);
  if (!ctx) throw new Error("useCVBuilder must be used within CVBuilderProvider");
  return ctx;
}
