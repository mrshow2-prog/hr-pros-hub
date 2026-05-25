import { Link } from "react-router-dom";
import TemplateModern from "@/components/cv-builder/templates/TemplateModern";
import TemplateClassic from "@/components/cv-builder/templates/TemplateClassic";
import TemplateExecutive from "@/components/cv-builder/templates/TemplateExecutive";
import TemplateCompact from "@/components/cv-builder/templates/TemplateCompact";
import TemplateSkillsFirst from "@/components/cv-builder/templates/TemplateSkillsFirst";
import TemplateRiyadh from "@/components/cv-builder/templates/TemplateRiyadh";

const ITEMS = [
  { name: "Dubai", tag: "Most picked", Component: TemplateModern },
  { name: "London", tag: "Recruiter favourite", Component: TemplateClassic },
  { name: "Zurich", tag: "Executive", Component: TemplateExecutive },
  { name: "Singapore", tag: "Information-dense", Component: TemplateCompact },
  { name: "Berlin", tag: "Career change", Component: TemplateSkillsFirst },
  { name: "Riyadh", tag: "New · Bold", Component: TemplateRiyadh },
];

export default function TemplateGallery() {
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
          {ITEMS.map(({ name, tag, Component }) => (
            <div
              key={name}
              className="group rounded-sm border border-ink/10 bg-paper p-4 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-ink/5">
                <div
                  className="absolute inset-0 origin-top-left"
                  style={{ transform: "scale(0.35)", width: "286%", height: "286%" }}
                  aria-hidden="true"
                >
                  <Component />
                </div>
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
