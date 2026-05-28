import { Fragment } from "react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, visibleBullets } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

const SH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-6 font-syne text-[24px] font-semibold tracking-[-0.01em] text-ink">
    {children}
  </h2>
);

export default function TemplateExecutive({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const renderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    experience: () => (
      <section className="mb-12">
        <SH>Professional Experience</SH>
        <div className="space-y-9">
          {cv.experience.map((exp) => (
            <article key={exp.id}>
              <div className="mb-2 flex items-baseline justify-between gap-5">
                <p className="font-syne text-[19px] font-semibold tracking-[-0.01em] text-ink">
                  {exp.role}
                </p>
                <p className="whitespace-nowrap text-[14px] font-light text-ink/60">
                  {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                </p>
              </div>
              <p className="mb-3 text-[16px] font-medium text-sienna">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              {visibleBullets(exp).length > 0 && (
                <ul className="space-y-2">
                  {visibleBullets(exp).map((b) => (
                    <li key={b.id} className="flex gap-2 text-[15px] font-light leading-[1.7] text-ink/85">
              <span className="relative top-[12px] h-0.5 w-2 bg-sienna shrink-0" />
              <span className="flex-1">{b.rewrite || b.original}</span>
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
      <section className="mb-12">
        <SH>Education</SH>
        <div className="space-y-6">
          {cv.education.map((ed) => (
            <div key={ed.id}>
              <div className="flex items-baseline justify-between gap-5">
                <p className="text-[17px] font-semibold text-ink">{ed.qualification}</p>
                <p className="whitespace-nowrap text-[14px] font-light text-ink/60">{ed.period}</p>
              </div>
              <p className="text-[16px] font-medium text-sienna">{ed.institution}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: () => (
      <section className="mb-12">
        <SH>Key Skills</SH>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px] font-light text-ink/85">
          {cv.skills.map((s) => (
            <div key={s} className="flex gap-2">
              <span className="relative top-[10px] h-0.5 w-2 bg-sienna shrink-0" />
              <span className="flex-1">{s}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    competencies: () => (
      <section className="mb-12">
        <SH>Competency Clusters</SH>
        <div className="space-y-2">
          {cv.competencyClusters.map((c) => (
            <p key={c.id} className="text-[15px] font-light leading-[1.6] text-ink/85">
              {c.title && (
                <span className="font-semibold text-sienna">{c.title}: </span>
              )}
              {c.items.filter(Boolean).join(" · ")}
            </p>
          ))}
        </div>
      </section>
    ),
    languages: () => (
      <section className="mb-12">
        <SH>Languages</SH>
        <div className="flex flex-wrap gap-8 text-[15px] font-light text-ink/85">
          {cv.languages.map((l) => (
            <div key={l.id}>
              <span className="font-semibold text-ink">{l.name}</span>{" "}
              <span className="text-ink/60">({l.level})</span>
            </div>
          ))}
        </div>
      </section>
    ),
    achievements: () => (
      <section className="mb-12">
        <SH>Achievements</SH>
        <ul className="space-y-2">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="flex gap-2 text-[15px] font-light leading-[1.7] text-ink/85">
              <span className="relative top-[12px] h-0.5 w-2 bg-sienna shrink-0" />
              <span className="flex-1">{a}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section className="mb-12">
        <SH>Certifications</SH>
        <div className="space-y-2">
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-4 text-[15px] font-light text-ink/85">
              <div>
                <span className="font-semibold text-ink">{c.name}</span>
                {c.issuer && <span className="text-sienna"> — {c.issuer}</span>}
              </div>
              {c.date && <span className="text-ink/60">{c.date}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    custom: () => (
      <>
        {cv.customSections.map((s) => (
          <section key={s.id} className="mb-12">
            <SH>{s.title || "Additional"}</SH>
            <ul className="space-y-2">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2 text-[15px] font-light leading-[1.7] text-ink/85">
              <span className="relative top-[12px] h-0.5 w-2 bg-sienna shrink-0" />
              <span className="flex-1">{b}</span>
            </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    ),
  };

  return (
    <Page className="px-[72px]">
      {shouldRender(cv, "contact") && (
        <header className="mb-14 flex items-start gap-10">
          {photoUrl && <Photo url={photoUrl} shape="square" size={160} />}
          <div className="flex-1 pt-2">
            <h1 className="font-syne text-[56px] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mb-6 mt-3 text-[22px] font-light tracking-[-0.01em] text-sienna">
                {cv.contact.jobTitle}
              </p>
            )}
            <ContactLine cv={cv} className="text-[14px] font-light text-ink/60" />
          </div>
        </header>
      )}

      {shouldRender(cv, "summary") && (
        <section className="mb-12">
          <SH>Executive Summary</SH>
          <p className="max-w-[680px] border-l-[3px] border-sienna pl-6 text-justify hyphens-auto text-[16px] font-light leading-[1.8] text-ink/85">
            {cv.summary}
          </p>
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
