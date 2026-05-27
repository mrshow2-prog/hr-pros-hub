import { useCVBuilder, type SectionKey } from "@/contexts/CVBuilderContext";
import {
  isMultiColumn,
  placementFor,
  TOGGLEABLE_SECTIONS,
} from "@/lib/cv/sidebarPlacement";
import { cn } from "@/lib/utils";

interface Props {
  sectionKey: SectionKey;
  className?: string;
}

/**
 * Tiny segmented "Sidebar / Main" toggle shown next to section headers for
 * multi-column templates (Bold, Vibrant). No-op for single-column templates.
 */
export default function SidebarPlacementToggle({ sectionKey, className }: Props) {
  const { state, patchIntent } = useCVBuilder();

  if (!isMultiColumn(state.selectedTemplate)) return null;
  if (!TOGGLEABLE_SECTIONS.includes(sectionKey)) return null;

  const current = placementFor(sectionKey, state.intentForm.sidebarPlacement);

  const set = (next: "sidebar" | "main") => {
    patchIntent({
      sidebarPlacement: {
        ...(state.intentForm.sidebarPlacement ?? {}),
        [sectionKey]: next,
      },
    });
  };

  const Btn = ({ value, label }: { value: "sidebar" | "main"; label: string }) => (
    <button
      type="button"
      onClick={() => set(value)}
      aria-pressed={current === value}
      className={cn(
        "px-2 py-0.5 font-dm text-[10.5px] uppercase tracking-wider transition-colors",
        current === value
          ? "bg-ink text-paper"
          : "bg-transparent text-ink/55 hover:text-ink",
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-sm border border-ink/15",
        className,
      )}
      title="Choose whether this section appears in the sidebar or the main body"
    >
      <Btn value="sidebar" label="Sidebar" />
      <Btn value="main" label="Main" />
    </div>
  );
}
