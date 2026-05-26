import CVRenderer, { SAMPLE_CV } from "@/components/cv-builder/templates/CVRenderer";
import { ScaledPreview } from "@/components/cv-builder/templates/shared";
import { getPalette } from "@/lib/cv/palettes";

const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces";

export default function HeroCvPreview() {
  const accent = getPalette("sienna").accentHex;
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -top-3 -left-3 z-10 rounded-sm bg-ink px-3 py-1 text-[11px] uppercase tracking-wider2 text-paper">
        ATS 96
      </div>
      <div className="absolute -top-3 -right-3 z-10 rounded-sm bg-sienna px-3 py-1 text-[11px] uppercase tracking-wider2 text-paper">
        UAE-ready
      </div>
      <div
        className="rotate-[-1.5deg] overflow-hidden rounded-sm bg-paper shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-ink/10"
        aria-hidden="true"
      >
        <ScaledPreview scale={0.5} visibleHeight={560}>
          <div style={{ ['--accent' as never]: accent } as React.CSSProperties}>
            <CVRenderer cv={SAMPLE_CV} template="simple" photoUrl={SAMPLE_PHOTO_URL} />
          </div>
        </ScaledPreview>
      </div>
    </div>
  );
}
