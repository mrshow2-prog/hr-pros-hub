/**
 * Modal template picker used in the Draft / Editor screen.
 *
 * Replaces the small dropdown with a richer browse experience: a scrollable
 * list of templates on the left with thumbnail previews, and a large preview
 * pane on the right that updates as the user clicks each template. The
 * selection is only committed when the user clicks "Use this template".
 */
import { useEffect, useState } from "react";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCVBuilder, type TemplateId } from "@/contexts/CVBuilderContext";
import { getPalette } from "@/lib/cv/palettes";
import CVRenderer, { SAMPLE_CV } from "../templates/CVRenderer";
import { ScaledPreview } from "../templates/shared";

const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces";

interface TemplateMeta {
  id: TemplateId;
  name: string;
  badge: string;
  description: string;
  isNew?: boolean;
  ats: number;
}

const TEMPLATES: TemplateMeta[] = [
  { id: "simple", name: "Simple", badge: "Most picked", description: "Clean contemporary design with accent bars and generous spacing.", ats: 96 },
  { id: "traditional", name: "Traditional", badge: "Recruiter favourite", description: "Traditional single-column with formal serif.", ats: 97 },
  { id: "executive", name: "Executive", badge: "C-Suite", description: "Refined design with oversized name and featured summary.", ats: 96 },
  { id: "detailed", name: "Detailed", badge: "Information-dense", description: "Two-column compact layout for long careers.", ats: 94 },
  { id: "skills", name: "Skills-Based", badge: "Career change", description: "Leads with skills and pill-style competency tags.", ats: 95 },
  { id: "bold", name: "Bold", badge: "High contrast", isNew: true, description: "Striking dark sidebar with photo and skills.", ats: 93 },
  { id: "editorial", name: "Editorial", badge: "Premium", description: "Editorial layout with serif headlines and timeline.", ats: 94 },
  { id: "vibrant", name: "Vibrant", badge: "Top pick", isNew: true, description: "Rich coloured sidebar with skill bars and icons.", ats: 93 },
  { id: "gradient", name: "Gradient", badge: "Modern", isNew: true, description: "Gradient header band with overlapping photo.", ats: 92 },
  { id: "creative", name: "Creative", badge: "Standout", isNew: true, description: "Editorial creative with monogram and year markers.", ats: 90 },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user confirms a new template choice. */
  onConfirm: (id: TemplateId) => void;
}

export default function TemplatePickerDialog({ open, onOpenChange, onConfirm }: Props) {
  const { state } = useCVBuilder();
  const palette = getPalette(state.intentForm.colorPalette);
  const photoShape = state.intentForm.photoShape;
  const previewPhoto = photoShape === "none" ? null : SAMPLE_PHOTO_URL;
  const currentId = (state.selectedTemplate ?? "simple") as TemplateId;

  const [draftId, setDraftId] = useState<TemplateId>(currentId);

  // Re-sync the draft to current template whenever the dialog opens
  useEffect(() => {
    if (open) setDraftId(currentId);
  }, [open, currentId]);

  const active = TEMPLATES.find((t) => t.id === draftId) ?? TEMPLATES[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[1180px] w-[95vw] h-[88vh] p-0 gap-0 overflow-hidden bg-paper"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
          <div>
            <h2 className="font-syne text-lg text-ink">Choose a template</h2>
            <p className="font-dm text-xs text-ink/60">
              Click any template to preview it. Your content stays the same.
            </p>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: template list */}
          <div className="w-[320px] shrink-0 overflow-y-auto border-r border-ink/10 bg-paper/60 p-3">
            <div className="grid gap-3">
              {TEMPLATES.map((t) => {
                const isDraft = draftId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDraftId(t.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-md border-2 bg-paper text-left transition",
                      isDraft
                        ? "shadow-md"
                        : "border-transparent shadow-sm hover:-translate-y-0.5 hover:shadow-md",
                    )}
                    style={isDraft ? { borderColor: palette.accentHex } : undefined}
                  >
                    <ScaledPreview scale={0.18} visibleHeight={150} className="border-b border-ink/10 pointer-events-none">
                      <div style={{ ['--accent' as never]: palette.accentHex } as React.CSSProperties}>
                        <CVRenderer cv={SAMPLE_CV} template={t.id} photoUrl={previewPhoto} />
                      </div>
                    </ScaledPreview>
                    {isDraft && (
                      <div
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-paper shadow"
                        style={{ background: palette.accentHex }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                    {t.isNew && !isDraft && (
                      <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 font-dm text-[9px] font-semibold uppercase tracking-wider text-paper shadow">
                        <Sparkles size={9} /> New
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate font-syne text-sm text-ink">{t.name}</div>
                        <div className="truncate font-dm text-[11px] text-ink/55">{t.badge}</div>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 font-dm text-[10px] font-medium text-olive">
                        <ShieldCheck size={10} /> {t.ats}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: large preview */}
          <div className="flex flex-1 flex-col min-w-0 bg-paper/40">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-syne text-base text-ink">{active.name}</h3>
                  <span
                    className="inline-block rounded bg-clay px-2 py-0.5 font-dm text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: palette.accentHex }}
                  >
                    {active.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 font-dm text-[11px] font-medium text-olive">
                    <ShieldCheck size={11} /> ATS {active.ats}%
                  </span>
                </div>
                <p className="mt-1 font-dm text-[12.5px] text-ink/65">{active.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded border border-ink/15 px-3 py-2 font-dm text-xs text-ink/70 hover:border-ink/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(draftId);
                    onOpenChange(false);
                  }}
                  disabled={draftId === currentId}
                  className="rounded px-4 py-2 font-dm text-xs font-semibold uppercase tracking-wider text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: palette.accentHex }}
                >
                  {draftId === currentId ? "Current template" : "Use this template"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="mx-auto" style={{ maxWidth: 720 }}>
                <ScaledPreview scale={0.85} visibleHeight={900} className="rounded-md border border-ink/10 shadow-sm">
                  <div style={{ ['--accent' as never]: palette.accentHex } as React.CSSProperties}>
                    <CVRenderer cv={SAMPLE_CV} template={draftId} photoUrl={previewPhoto} />
                  </div>
                </ScaledPreview>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
