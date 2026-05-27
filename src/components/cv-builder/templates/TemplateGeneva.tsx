import { Fragment } from "react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, visibleBullets } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

/** Geneva — Editorial timeline template with serif headings. */
export default function TemplateGeneva({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const SH = ({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) => (
    <header className="mb-5">
      {eyebrow && (
        <p className="mb-1 font-dm text-[10px] font-semibold uppercase tracking-[0.22em] text-sienna">
          {eyebrow}
        </p>
      )}
      <h2 className="border-b border-ink/15 pb-2 font-syne text-[24px] font-semibold tracking-[-0.01em] text-ink">
        {children}
      </h2>
    </header>
  );

  // Eyebrow numbers are auto-incremented in render order.
  let n = 1;
  const eyebrow = () => String(n++).padStart(2, "0");

  const renderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    experience: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Career Timeline</SH>
        <div className="relative space-y-7 pl-7">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-sienna/40" aria-hidden />
          {cv.experience.map((exp) => (
            <article key={exp.id} className="relative">
              <span className="absolute -left-[27px] top-[8px] h-3 w-3 rounded-full border-2 border-sienna bg-paper" />
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-syne text-[16px] font-semibold text-ink">{exp.role}</p>
                <p className="whitespace-nowrap font-dm text-[12px] font-light text-ink/55">
                  {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                </p>
              </div>
              <p className="mb-2 text-[13px] font-semibold text-sienna">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              {visibleBullets(exp).length > 0 && (
                <ul className="space-y-1.5">
                  {visibleBullets(exp).map((b) => (
                    <li key={b.id} className="relative pl-4 text-[13px] font-light leading-[1.65] text-ink/85">
                      <span className="absolute left-0 top-[2px] text-sienna">—</span>
                      {b.rewrite || b.original}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    ),
    education: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Education</SH>
        <div className="space-y-3.5">
          {cv.education.map((ed) => (
            <div key={ed.id} className="flex items-baseline justify-between gap-3">
              <div>
                <p className="font-syne text-[15px] font-semibold text-ink">{ed.qualification}</p>
                <p className="text-[13px] font-semibold text-sienna">{ed.institution}</p>
              </div>
              <p className="whitespace-nowrap font-dm text-[12px] font-light text-ink/55">{ed.period}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Skills</SH>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
          {cv.skills.map((s) => (
            <p key={s} className="relative pl-4 text-[13px] font-light text-ink/85">
              <span className="absolute left-0 text-sienna">·</span>
              {s}
            </p>
          ))}
        </div>
      </section>
    ),
    competencies: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Competencies</SH>
        <div className="space-y-3">
          {cv.competencyClusters.map((c) => (
            <div key={c.id}>
              {c.title && (
                <p className="mb-1 font-dm text-[10px] font-semibold uppercase tracking-[0.18em] text-sienna">
                  {c.title}
                </p>
              )}
              <p className="text-[13px] font-light text-ink/85">{c.items.filter(Boolean).join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    languages: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Languages</SH>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] font-light text-ink/85">
          {cv.languages.map((l) => (
            <div key={l.id}>
              <span className="font-syne font-semibold text-ink">{l.name}</span>
              {l.level && <span className="text-ink/55"> — {l.level}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    achievements: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Achievements</SH>
        <ul className="space-y-1.5">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="relative pl-4 text-[13px] font-light leading-[1.65] text-ink/85">
              <span className="absolute left-0 top-[2px] text-sienna">—</span>
              {a}
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section className="mb-9">
        <SH eyebrow={eyebrow()}>Certifications</SH>
        <div className="space-y-2">
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-3 text-[13px] font-light text-ink/85">
              <div>
                <span className="font-syne font-semibold text-ink">{c.name}</span>
                {c.issuer && <span className="text-sienna"> — {c.issuer}</span>}
              </div>
              {c.date && <span className="text-ink/55">{c.date}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    custom: () => (
      <>
        {cv.customSections.map((s) => (
          <section key={s.id} className="mb-9">
            <SH eyebrow={eyebrow()}>{s.title || "Additional"}</SH>
            <ul className="space-y-1.5">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="relative pl-4 text-[13px] font-light leading-[1.65] text-ink/85">
                  <span className="absolute left-0 top-[2px] text-sienna">—</span>
                  {b}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    ),
  };

  return (
    <Page className="px-16 py-14">
      {shouldRender(cv, "contact") && (
        <header className="mb-12 flex items-end gap-7">
          {photoUrl && <Photo url={photoUrl} shape="circle" size={104} />}
          <div className="flex-1">
            <p className="mb-1 font-dm text-[11px] font-semibold uppercase tracking-[0.24em] text-sienna">
              Curriculum Vitae
            </p>
            <h1 className="font-syne text-[44px] font-bold leading-[1.05] tracking-[-0.025em] text-ink">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mt-1.5 font-syne text-[17px] italic text-ink/80">{cv.contact.jobTitle}</p>
            )}
            <ContactLine cv={cv} className="mt-3 text-[12.5px] font-light text-ink/65" />
          </div>
        </header>
      )}

      {shouldRender(cv, "summary") && (
        <section className="mb-9">
          <SH eyebrow={eyebrow()}>Profile</SH>
          <p className="font-syne text-justify hyphens-auto text-[15px] italic leading-[1.7] text-ink/85">{cv.summary}</p>
        </section>
      )}

      {getSectionOrder(cv)
        .filter((k) => shouldRender(cv, k))
        .map((k) => (
          <Fragment key={k}>{renderers[k]?.()}</Fragment>
        ))}
    </Page>
  );
}
