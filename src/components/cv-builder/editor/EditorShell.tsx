/**
 * Split editor (Phase 2.1)
 *
 * Left pane: existing form blocks from StepDraft, organised under stable
 * section anchors so the ATS panel can deep-link to fields via `jumpTo`.
 * Right pane: live preview of the rendered template + ATS findings drawer.
 * Top bar: section tabs, template / theme switchers, score pill, Continue.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useCVBuilder, type SectionKey, type TemplateId, type AtsFinding, type AtsAutoFix } from "@/contexts/CVBuilderContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ContactBlock,
  SummaryBlock,
  ExperienceList,
  SkillsBlock,
  EducationBlock,
  ClustersBlock,
  LanguagesBlock,
  AchievementsBlock,
  CertificationsBlock,
  CustomSectionsBlock,
  SectionShell,
  SkillsCaseToggle,
} from "../StepDraft";
import PdfmePreview from "../templates/PdfmePreview";
import { cn } from "@/lib/utils";
import { scoreCv } from "@/lib/cv/atsEngine";
import { getPalette } from "@/lib/cv/palettes";
import { getSectionOrder, hasContent } from "@/lib/cv/sectionVisibility";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "traditional", label: "Traditional" },
  { id: "executive", label: "Executive" },
  { id: "detailed", label: "Detailed" },
  { id: "skills", label: "Skills-Based" },
  { id: "bold", label: "Bold" },
  { id: "editorial", label: "Editorial" },
];

type SectionDef = { key: SectionKey; label: string };
const SECTION_LABELS: Record<SectionKey, string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  competencies: "Competencies",
  languages: "Languages",
  achievements: "Achievements",
  certifications: "Certifications",
  custom: "Custom sections",
};
const PINNED: SectionKey[] = ["contact", "summary"];


export default function EditorShell() {
  const { state, setGeneratedCV, setAts, setStep, setTemplate, patchSummary, replaceBullets } =
    useCVBuilder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atsOpen, setAtsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>("contact");
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [suppressedIds, setSuppressedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [templateChanging, setTemplateChanging] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);

  // ── Auto-generate on first mount if we don't have a CV yet ────
  const runGeneration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-cv", {
        body: {
          parsedText: state.parsedText,
          intentForm: state.intentForm,
          gapResponses: state.gapAnalysis.responses,
          template: state.selectedTemplate,
          typeOption: state.typeOption,
          uploadedFiles: state.uploadedFiles,
          pageLimit: state.intentForm.pageLimit ?? null,
          provider: "gemini",
        },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (data?.generatedCV) setGeneratedCV(data.generatedCV);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [state.parsedText, state.intentForm, state.gapAnalysis.responses,
      state.selectedTemplate, state.typeOption, state.uploadedFiles, setGeneratedCV]);

  useEffect(() => {
    if (!state.generatedCV) runGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-score whenever the CV mutates (debounced) ────────────
  useEffect(() => {
    if (!state.generatedCV) return;
    const t = setTimeout(() => {
      const result = scoreCv(state.generatedCV!, state.intentForm);
      setAts(result);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.generatedCV, state.intentForm.targetRoles, state.intentForm.functionArea, state.intentForm.pageLimit]);

  // ── Scroll the left pane to a section anchor ──────────────────
  const scrollToSection = useCallback((key: SectionKey) => {
    setActiveSection(key);
    const el = leftRef.current?.querySelector(`[data-section="${key}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const jumpTo = useCallback((finding: AtsFinding) => {
    const t = finding.jumpTo;
    if (!t) return;
    scrollToSection(t.section);
    // Defer focus until after scroll
    setTimeout(() => {
      const tryFind = (sel: string) =>
        leftRef.current?.querySelector(sel) as HTMLElement | null;
      let node: HTMLElement | null = null;
      if (t.bulletId) {
        node = tryFind(`[data-bullet-id="${t.bulletId}"] textarea`)
          || tryFind(`[data-bullet-id="${t.bulletId}"] input`);
      } else if (t.expId && t.field) {
        node = tryFind(`[data-exp-id="${t.expId}"] [data-field="${t.field}"] input, [data-exp-id="${t.expId}"] [data-field="${t.field}"] textarea`);
      } else if (t.expId) {
        // For bullet findings, jump to the first bullet textarea inside that role
        node = tryFind(`[data-exp-id="${t.expId}"] li[data-bullet-id] textarea`)
          || tryFind(`[data-exp-id="${t.expId}"] textarea`)
          || tryFind(`[data-exp-id="${t.expId}"] input`);
      } else if (t.field) {
        node = tryFind(`[data-field="${t.field}"] input, [data-field="${t.field}"] textarea`)
          || tryFind(`[data-field="${t.field}"]`);
      } else {
        node = tryFind(`[data-section="${t.section}"]`);
      }
      if (node) {
        node.focus?.();
        node.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }
    }, 350);
  }, [scrollToSection]);

  // ── AI auto-fix: invoke generate-cv-section based on finding.autoFix ──
  const runAutoFix = useCallback(async (finding: AtsFinding) => {
    const af = finding.autoFix;
    if (!af || !state.generatedCV) return;
    setFixingId(finding.id);
    let success = false;
    try {
      if (af.kind === "summary") {
        const { data, error } = await supabase.functions.invoke("generate-cv-section", {
          body: {
            action: af.action,
            kind: "summary",
            currentSummary: state.generatedCV.summary,
            intentForm: state.intentForm,
          },
        });
        if (error) throw error;
        if (typeof data?.summary === "string" && data.summary.trim()) {
          patchSummary(data.summary.trim());
          success = true;
        }
      } else if (af.kind === "bullets") {
        const exp = state.generatedCV.experience.find((e) => e.id === af.expId);
        if (!exp) return;
        const current = exp.bullets.map((b) => b.rewrite);
        const original = exp.bullets.map((b) => b.original || b.rewrite);
        const { data, error } = await supabase.functions.invoke("generate-cv-section", {
          body: {
            action: af.action,
            kind: "bullets",
            jobTitle: exp.role,
            company: exp.company,
            currentBullets: current,
            originalBullets: original,
            intentForm: state.intentForm,
          },
        });
        if (error) throw error;
        if (Array.isArray(data?.bullets) && data.bullets.length) {
          replaceBullets(af.expId, data.bullets);
          success = true;
        }
      }
    } catch (e) {
      console.error("Auto-fix failed", e);
    } finally {
      setFixingId(null);
      if (success) {
        setSuppressedIds((s) => {
          const next = new Set(s);
          next.add(finding.id);
          return next;
        });
      }
    }
  }, [state.generatedCV, state.intentForm, patchSummary, replaceBullets]);

  const handleRefresh = useCallback(() => {
    if (!state.generatedCV) return;
    setRefreshing(true);
    setSuppressedIds(new Set());
    setAts(scoreCv(state.generatedCV, state.intentForm));
    setTimeout(() => setRefreshing(false), 500);
  }, [state.generatedCV, state.intentForm, setAts]);

  // ── Loading / generation gate ────────────────────────────────
  if (loading || !state.generatedCV) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-paper">
        {error ? (
          <div className="max-w-md rounded-md border border-sienna/30 bg-clay/30 p-6 text-center">
            <p className="font-syne text-lg text-ink">High demand right now</p>
            <p className="mt-2 font-dm text-sm text-ink/70">{error}</p>
            <button
              onClick={runGeneration}
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-sienna px-4 py-2 font-dm text-sm font-medium text-paper hover:opacity-90"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 font-dm text-sm text-ink/65">
            <Loader2 className="animate-spin" size={16} />
            Drafting your CV — about 20 seconds…
          </div>
        )}
      </div>
    );
  }

  const score = state.atsScore;
  const cv = state.generatedCV;
  const showCompetencies =
    state.intentForm.cvType === "skills" || state.intentForm.cvType === "hybrid";

  // Build the ordered section list: contact + summary pinned at top,
  // then the user's customised body order from cv.sectionOrder.
  const orderedBody = getSectionOrder(cv);
  const orderedKeys: SectionKey[] = [...PINNED, ...orderedBody];
  const visibleKeys: SectionKey[] = orderedKeys.filter(
    (k) => k !== "competencies" || showCompetencies,
  );
  const SECTIONS: SectionDef[] = visibleKeys.map((k) => ({ key: k, label: SECTION_LABELS[k] }));

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-paper">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-2 border-b border-ink/10 bg-paper/95 px-3 py-2 backdrop-blur">
        <nav className="flex flex-1 flex-wrap items-center gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => scrollToSection(s.key)}
              className={cn(
                "rounded-sm px-2.5 py-1 font-dm text-xs transition",
                activeSection === s.key
                  ? "bg-ink text-paper"
                  : "text-ink/65 hover:bg-ink/5 hover:text-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <select
            value={state.selectedTemplate ?? "simple"}
            onChange={(e) => {
              setTemplateChanging(true);
              setTemplate(e.target.value as TemplateId);
            }}
            disabled={templateChanging}
            className="rounded border border-ink/15 bg-paper px-2 py-1 font-dm text-xs text-ink focus:border-sienna focus:outline-none disabled:opacity-60"
            aria-label="Template"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {templateChanging && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sienna/10 px-2 py-1 font-dm text-[11px] text-sienna ring-1 ring-sienna/30">
              <Loader2 className="animate-spin" size={12} />
              Updating preview…
            </span>
          )}
          {/* dark/light toggle removed — palette is set on the Template step */}

          <button
            onClick={() => setPreviewOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded border border-ink/15 px-2 py-1 font-dm text-xs text-ink/70 hover:border-ink/40"
            aria-label={previewOpen ? "Hide preview" : "Show preview"}
            title={previewOpen ? "Hide preview" : "Show preview"}
          >
            {previewOpen ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
            {previewOpen ? "Hide preview" : "Show preview"}
          </button>

          <button
            onClick={() => setAtsOpen((o) => !o)}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm border px-3 py-1 font-dm text-xs transition",
              score && score.overall >= 75
                ? "border-olive bg-olive/10 text-olive"
                : score && score.overall >= 50
                  ? "border-amber-600 bg-amber-50 text-amber-800"
                  : "border-sienna/40 bg-sienna/10 text-sienna",
            )}
            aria-label="Open ATS analysis"
            title="Open ATS analysis"
          >
            <CheckCircle2 size={12} />
            ATS {score?.overall ?? "—"}
            {score?.findings && score.findings.length > 0 && (
              <span
                className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-ink/10 px-1.5 text-[10px] text-ink/70"
                title={`${score.findings.length} issue${score.findings.length === 1 ? "" : "s"} to review`}
              >
                <AlertTriangle size={9} /> {score.findings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-1 rounded-sm border border-ink/20 px-3 py-1.5 font-dm text-xs text-ink/70 hover:border-ink/40 hover:text-ink"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep(5)}
            className="inline-flex items-center gap-1 rounded-sm bg-sienna px-3 py-1.5 font-dm text-xs font-medium text-paper hover:opacity-90"
          >
            Continue <ChevronRight size={12} />
          </button>
        </div>
      </header>

      {/* Split body */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={previewOpen ? 50 : 100} minSize={30}>
            <div
              ref={leftRef}
              className="h-full overflow-y-auto px-5 py-6 lg:px-8"
            >
              <div className="mx-auto max-w-2xl space-y-3">
                {(() => {
                  const visible = SECTIONS;
                  const reorderableVisible = visible.filter((s) => !PINNED.includes(s.key));
                  const goNext = (key: SectionKey) => {
                    const idx = visible.findIndex((v) => v.key === key);
                    const next = visible[idx + 1];
                    if (next) scrollToSection(next.key);
                  };
                  const renderBody = (key: SectionKey) => {
                    switch (key) {
                      case "contact": return <ContactBlock contact={cv.contact} />;
                      case "summary": return <SummaryBlock summary={cv.summary} />;
                      case "experience": return <ExperienceList experience={cv.experience} />;
                      case "skills": return <SkillsBlock skills={cv.skills} />;
                      case "education": return <EducationBlock education={cv.education} />;
                      case "competencies": return <ClustersBlock clusters={cv.competencyClusters} />;
                      case "languages": return <LanguagesBlock languages={cv.languages} />;
                      case "achievements": return <AchievementsBlock achievements={cv.achievements} />;
                      case "certifications": return <CertificationsBlock certifications={cv.certifications} />;
                      case "custom": return <CustomSectionsBlock sections={cv.customSections} />;
                      default: return null;
                    }
                  };
                  const titleFor = (key: SectionKey, label: string) =>
                    key === "summary" ? "Professional summary"
                    : key === "experience" ? "Work experience"
                    : key === "education" ? "Education"
                    : key === "competencies" ? "Competency clusters"
                    : key === "custom" ? "Custom sections"
                    : label;
                  return visible.map((s, i) => {
                    const isLast = i === visible.length - 1;
                    const rIdx = reorderableVisible.findIndex((v) => v.key === s.key);
                    const canMoveUp = rIdx > 0;
                    const canMoveDown = rIdx >= 0 && rIdx < reorderableVisible.length - 1;
                    const empty = !hasContent(cv, s.key);
                    const isReorderable = !PINNED.includes(s.key);
                    return (
                      <CollapsibleSection
                        key={s.key}
                        sectionKey={s.key}
                        title={titleFor(s.key, s.label)}
                        isOpen={activeSection === s.key}
                        onToggle={() => setActiveSection((cur) => (cur === s.key ? ("" as SectionKey) : s.key))}
                        onContinue={isLast ? undefined : () => goNext(s.key)}
                        canMoveUp={isReorderable ? canMoveUp : undefined}
                        canMoveDown={isReorderable ? canMoveDown : undefined}
                        headerAction={s.key === "skills" ? <SkillsCaseToggle /> : undefined}
                      >
                        <SectionShell
                          sectionKey={s.key}
                          title={titleFor(s.key, s.label)}
                          canMoveUp={canMoveUp}
                          canMoveDown={canMoveDown}
                          showEmptyHint={empty && !PINNED.includes(s.key)}
                          hideMoveControls
                          hideVisibilityControl
                        >
                          {renderBody(s.key)}
                        </SectionShell>
                      </CollapsibleSection>
                    );
                  });
                })()}
                <div className="h-32" />
              </div>
            </div>
          </ResizablePanel>




          {previewOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={25}>
                <PreviewPane
                  onStatusChange={(status) => {
                    if (status === "ready" || status === "error") {
                      setTemplateChanging(false);
                    }
                  }}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* ATS drawer */}
        {atsOpen && (
          <AtsDrawer
            onClose={() => setAtsOpen(false)}
            onJump={jumpTo}
            onAutoFix={runAutoFix}
            fixingId={fixingId}
            suppressedIds={suppressedIds}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </div>
    </div>
  );
}

/* ────────── Live preview pane ────────── */

function PreviewPane({ onStatusChange }: { onStatusChange?: (status: "loading" | "ready" | "error") => void }) {
  const { state } = useCVBuilder();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.85);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!state.photoPath) { setPhotoUrl(null); return; }
      const { data } = await supabase.storage
        .from("cv-builder-uploads")
        .createSignedUrl(state.photoPath, 60 * 60);
      if (active) setPhotoUrl(data?.signedUrl ?? null);
    })();
    return () => { active = false; };
  }, [state.photoPath]);

  // Fit width
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 48; // padding
      setScale(Math.min(1, Math.max(0.45, w / 794)));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  if (!state.generatedCV || !state.selectedTemplate) return null;
  const accentHexForPreview = getPalette(state.intentForm.colorPalette).accentHex;


  return (
    <div ref={wrapRef} className="h-full overflow-y-auto bg-clay/30 p-6">
      <div className="mx-auto" style={{ width: 794 * scale }}>
        <PdfmePreview
          cv={state.generatedCV}
          template={state.selectedTemplate}
          photoUrl={photoUrl}
          pageWidth={794 * scale}
          gap={24 * scale}
          accentHex={accentHexForPreview}
          photoShape={state.intentForm.photoShape}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}

/* ────────── ATS findings drawer ────────── */

function AtsDrawer({
  onClose,
  onJump,
  onAutoFix,
  fixingId,
  suppressedIds,
  onRefresh,
  refreshing,
}: {
  onClose: () => void;
  onJump: (f: AtsFinding) => void;
  onAutoFix: (f: AtsFinding) => void;
  fixingId: string | null;
  suppressedIds: Set<string>;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { state } = useCVBuilder();
  const score = state.atsScore;

  const findings = useMemo(
    () => (score?.findings ?? []).filter((f) => !suppressedIds.has(f.id)),
    [score, suppressedIds],
  );
  const grouped = useMemo(() => ({
    critical: findings.filter((f) => f.severity === "critical"),
    warning: findings.filter((f) => f.severity === "warning"),
    info: findings.filter((f) => f.severity === "info"),
  }), [findings]);

  const warningHasAutoFix = grouped.warning.some((f) => f.autoFix);

  return (
    <aside className="flex h-full w-[340px] flex-col border-l border-ink/10 bg-paper">
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <p className="font-syne text-sm text-ink">ATS analysis</p>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded p-1 text-ink/55 hover:bg-ink/5 hover:text-ink disabled:opacity-60"
            aria-label="Re-score"
            title="Re-score"
          >
            <RefreshCw size={14} className={cn(refreshing && "animate-spin")} />
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink/55 hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Score donut */}
        <ScoreDonut value={score?.overall ?? 0} />

        {/* Section breakdown */}
        <div className="mt-5 space-y-1.5">
          {(score?.sectionScores ?? []).map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 font-dm text-[11px] text-ink/65">{s.label}</span>
              <div className="h-1.5 flex-1 rounded-full bg-ink/10">
                <div
                  className={cn(
                    "h-1.5 rounded-full",
                    s.score >= 75 ? "bg-olive" : s.score >= 50 ? "bg-amber-500" : "bg-sienna",
                  )}
                  style={{ width: `${s.score}%` }}
                />
              </div>
              <span className="w-8 text-right font-dm text-[11px] text-ink/55">{s.score}</span>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div className="mt-6 space-y-4">
          <FindingGroup
            title="Critical"
            icon={<AlertCircle size={12} />}
            tone="critical"
            items={grouped.critical}
            onJump={onJump}
            onAutoFix={onAutoFix}
            fixingId={fixingId}
          />
          <FindingGroup
            title="Warnings"
            icon={<AlertTriangle size={12} />}
            tone="warning"
            items={grouped.warning}
            onJump={onJump}
            onAutoFix={onAutoFix}
            fixingId={fixingId}
            note={warningHasAutoFix ? "Click ‘Fix with AI’ to rewrite automatically, or ‘Edit manually’ to jump to the field." : undefined}
          />
          <FindingGroup
            title="Suggestions"
            icon={<Info size={12} />}
            tone="info"
            items={grouped.info}
            onJump={onJump}
            onAutoFix={onAutoFix}
            fixingId={fixingId}
          />
          {findings.length === 0 && (
            <p className="font-dm text-xs text-ink/55">
              No findings — your CV passes all checks. Nicely done.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function ScoreDonut({ value }: { value: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = c - (value / 100) * c;
  const tone =
    value >= 75 ? "stroke-olive" : value >= 50 ? "stroke-amber-500" : "stroke-sienna";
  return (
    <div className="flex items-center gap-4">
      <svg width="92" height="92" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className="fill-none stroke-ink/10" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r}
          className={cn("fill-none", tone)}
          strokeWidth="9"
          strokeDasharray={c}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="56" textAnchor="middle" className="fill-ink font-syne" fontSize="22">
          {value}
        </text>
      </svg>
      <div className="font-dm text-xs leading-relaxed text-ink/65">
        Overall ATS readiness.<br />
        <span className="text-ink/45">Updated live as you edit.</span>
      </div>
    </div>
  );
}

function FindingGroup({
  title,
  icon,
  tone,
  items,
  onJump,
  onAutoFix,
  fixingId,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "critical" | "warning" | "info";
  items: AtsFinding[];
  onJump: (f: AtsFinding) => void;
  onAutoFix: (f: AtsFinding) => void;
  fixingId: string | null;
  note?: string;
}) {
  if (items.length === 0) return null;
  const toneCls =
    tone === "critical"
      ? "text-sienna"
      : tone === "warning"
        ? "text-amber-700"
        : "text-ink/55";
  return (
    <div>
      <p className={cn("mb-2 inline-flex items-center gap-1.5 font-dm text-[11px] uppercase tracking-wider2", toneCls)}>
        {icon} {title} · {items.length}
      </p>
      {note && (
        <p className="mb-2 rounded-sm bg-ink/5 px-2.5 py-1.5 font-dm text-[11px] leading-relaxed text-ink/65">
          {note}
        </p>
      )}

      <ul className="space-y-2">
        {items.map((f) => {
          const fixing = fixingId === f.id;
          return (
            <li key={f.id} className="rounded-md border border-ink/10 bg-paper p-3">
              <p className="font-dm text-xs font-medium text-ink">{f.label}</p>
              <p className="mt-1 font-dm text-[11px] leading-relaxed text-ink/65">{f.fix}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {f.autoFix && (
                  <button
                    onClick={() => onAutoFix(f)}
                    disabled={fixing}
                    className="inline-flex items-center gap-1 rounded-sm bg-sienna px-2 py-1 font-dm text-[11px] font-medium text-paper hover:opacity-90 disabled:opacity-60"
                  >
                    {fixing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {fixing ? "Fixing…" : "Fix with AI"}
                  </button>
                )}
                {f.jumpTo && (
                  <button
                    onClick={() => onJump(f)}
                    className="inline-flex items-center gap-1 font-dm text-[11px] text-ink/60 hover:text-ink hover:underline"
                  >
                    {f.autoFix ? "Edit manually" : "Go to field"} <ChevronRight size={10} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ────────── Collapsible progressive section ────────── */

function CollapsibleSection({
  sectionKey,
  title,
  isOpen,
  onToggle,
  onContinue,
  canMoveUp,
  canMoveDown,
  headerAction,
  children,
}: {
  sectionKey: SectionKey;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onContinue?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { state, toggleSection, moveSection } = useCVBuilder();
  const hidden = state.generatedCV?.hiddenSections.includes(sectionKey);
  const showArrows = canMoveUp !== undefined || canMoveDown !== undefined;
  const isPinned = sectionKey === "contact" || sectionKey === "summary";
  return (
    <div
      data-section={sectionKey}
      className={cn(
        "rounded-md border border-ink/10 bg-paper transition",
        isOpen ? "shadow-sm" : "hover:border-ink/25",
        hidden && "opacity-60",
      )}
    >
      <div className="flex w-full items-center gap-2 px-5 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between gap-3 text-left"
          aria-expanded={isOpen}
        >
          <span className="font-syne text-base text-ink">{title}</span>
          <ChevronDown
            size={16}
            className={cn("text-ink/55 transition-transform", isOpen && "rotate-180")}
          />
        </button>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {headerAction}
          {showArrows && (
            <>
              <button
                type="button"
                onClick={() => moveSection(sectionKey, "up")}
                disabled={!canMoveUp}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-ink/15 text-ink/65 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                title="Move section up"
                aria-label="Move section up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveSection(sectionKey, "down")}
                disabled={!canMoveDown}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-ink/15 text-ink/65 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                title="Move section down"
                aria-label="Move section down"
              >
                <ChevronDown size={14} />
              </button>
            </>
          )}
          {!isPinned && (
            <button
              type="button"
              onClick={() => toggleSection(sectionKey)}
              className="inline-flex items-center gap-1.5 rounded border border-ink/15 px-2 py-1 font-dm text-[11px] text-ink/65 hover:border-ink/30"
              title={hidden ? "Show section in export" : "Hide section from export"}
            >
              {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              {hidden ? "Hidden" : "Visible"}
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="border-t border-ink/10 px-5 py-5">
          {children}
          {onContinue && (
            <div className="mt-6 flex justify-end border-t border-ink/10 pt-4">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-1 rounded-sm bg-ink px-4 py-2 font-dm text-xs font-medium text-paper hover:opacity-90"
              >
                Save & continue <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

