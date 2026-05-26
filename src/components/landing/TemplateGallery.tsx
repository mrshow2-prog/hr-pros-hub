import { Link } from "react-router-dom";
import CVRenderer, { SAMPLE_CV } from "@/components/cv-builder/templates/CVRenderer";
import { ScaledPreview } from "@/components/cv-builder/templates/shared";
import { getPalette } from "@/lib/cv/palettes";
import type { TemplateId } from "@/contexts/CVBuilderContext";

const SAMPLE_PHOTO_URL =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces";

const ITEMS: { id: TemplateId; name: string; tag: string }[] = [
  { id: "simple", name: "Simple", tag: "Most picked" },
  { id: "traditional", name: "Traditional", tag: "Recruiter favourite" },
  { id: "executive", name: "Executive", tag: "C-Suite" },
  { id: "detailed", name: "Detailed", tag: "Information-dense" },
  { id: "skills", name: "Skills-Based", tag: "Career change" },
  { id: "bold", name: "Bold", tag: "New · High contrast" },
  { id: "editorial", name: "Editorial", tag: "New · Premium" },
];

export default function TemplateGallery() {
  const accent = getPalette("sienna").accentHex;
  return (
    <section className="border-t border-ink/10 px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">Templates</p>
            <h2 className="mt-3 font-syne text-3xl md:text-4xl tracking-tight">
              Seven templates. Every one ATS-tested.
            </h2>
          </div>
          <Link to="/login" className="text-sm text-sienna hover:underline">
            Browse all templates →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ id, name, tag }) => (
            <div
              key={id}
              className="group rounded-sm border border-ink/10 bg-paper p-4 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="relative overflow-hidden rounded-sm ring-1 ring-ink/10">
                <ScaledPreview scale={0.32} visibleHeight={340}>
                  <div style={{ ['--accent' as never]: accent } as React.CSSProperties}>
                    <CVRenderer cv={SAMPLE_CV} template={id} photoUrl={SAMPLE_PHOTO_URL} />
                  </div>
                </ScaledPreview>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-syne text-lg tracking-tight">{name}</div>
                <span className="text-[10px] uppercase tracking-wider2 text-sienna">{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
