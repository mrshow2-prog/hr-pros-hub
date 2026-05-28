import { Fragment } from "react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, visibleBullets } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-5 border-l-4 border-sienna pl-4 font-dm text-[16px] font-semibold uppercase tracking-[0.08em] text-ink">
    {children}
  </h2>
);

export default function TemplateModern({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const renderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    experience: () => (
      <section className="mb-9">
        <SectionHeader>Work Experience</SectionHeader>
        <div className="divide-y divide-clay">
          {cv.experience.map((exp) => (
            <article key={exp.id} className="py-7 first:pt-0 last:pb-0">
              <div className="mb-1.5 flex items-baseline justify-between gap-4">
                <p className="text-[17px] font-semibold text-ink">{exp.role}</p>
                <p className="whitespace-nowrap text-[14px] font-light text-ink/60">
                  {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                </p>
              </div>
              <p className="mb-2.5 text-[15px] font-medium text-sienna">
                {[exp.company, exp.location].filter(Boolean).join(" · ")}
              </p>
              {visibleBullets(exp).length > 0 && (
                <ul className="space-y-1.5">
                  {visibleBullets(exp).map((b) => (
                    <li key={b.id} className="flex gap-2 text-[14px] font-light leading-[1.6] text-ink/85">
              <span className="relative top-[10px] h-1.5 w-1.5 rounded-full bg-sienna shrink-0" />
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
      <section className="mb-9">
        <SectionHeader>Education</SectionHeader>
        <div className="divide-y divide-clay">
          {cv.education.map((ed) => (
            <div key={ed.id} className="py-5 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[16px] font-semibold text-ink">{ed.qualification}</p>
                <p className="whitespace-nowrap text-[14px] font-light text-ink/60">{ed.period}</p>
              </div>
              <p className="text-[15px] font-medium text-sienna">{ed.institution}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    skills: () => (
      <section className="mb-9">
        <SectionHeader>Skills &amp; Competencies</SectionHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[14px] font-light text-ink/85">
          {cv.skills.map((s) => (
            <div key={s}>
              <span className="mr-2 font-bold text-sienna">▪</span>
              {s}
            </div>
          ))}
        </div>
      </section>
    ),
    competencies: () => (
      <section className="mb-9">
        <SectionHeader>Core Competencies</SectionHeader>
        <div className="space-y-2">
          {cv.competencyClusters.map((c) => (
            <p key={c.id} className="text-[14px] font-light leading-[1.6] text-ink/85">
              {c.title && <span className="font-semibold text-sienna">{c.title}: </span>}
              {c.items.filter(Boolean).join(" · ")}
            </p>
          ))}
        </div>
      </section>
    ),
    languages: () => (
      <section className="mb-9">
        <SectionHeader>Languages</SectionHeader>
        <div className="flex flex-wrap gap-6 text-[14px] font-light text-ink/85">
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
      <section className="mb-9">
        <SectionHeader>Achievements</SectionHeader>
        <ul className="space-y-1.5">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="flex gap-2 text-[14px] font-light leading-[1.6] text-ink/85">
              <span className="relative top-[10px] h-1.5 w-1.5 rounded-full bg-sienna shrink-0" />
              <span className="flex-1">{a}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section className="mb-9">
        <SectionHeader>Certifications</SectionHeader>
        <div className="space-y-2">
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-4 text-[14px] font-light text-ink/85">
              <div>
                <span className="font-semibold text-ink">{c.name}</span>
                {c.issuer && <span className="text-sienna"> — {c.issuer}</span>}
              </div>
              {c.date && <span className="whitespace-nowrap text-ink/60">{c.date}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    custom: () => (
      <>
        {cv.customSections.map((s) => (
          <section key={s.id} className="mb-9">
            <SectionHeader>{s.title || "Additional"}</SectionHeader>
            <ul className="space-y-1.5">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2 text-[14px] font-light leading-[1.6] text-ink/85">
              <span className="relative top-[10px] h-1.5 w-1.5 rounded-full bg-sienna shrink-0" />
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
    <Page className="px-16">
      {shouldRender(cv, "contact") && (
        <header className="mb-12 flex items-start gap-8">
          {photoUrl && <Photo url={photoUrl} shape="square" size={140} />}
          <div className="flex-1">
            <h1 className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mb-5 mt-2 text-[20px] text-sienna">{cv.contact.jobTitle}</p>
            )}
            <ContactLine cv={cv} className="text-[14px] font-light text-ink/60" />
          </div>
        </header>
      )}

      {shouldRender(cv, "summary") && (
        <section className="mb-9">
          <SectionHeader>Professional Summary</SectionHeader>
          <p className="text-justify hyphens-auto text-[15px] font-light leading-[1.7] text-ink/85">{cv.summary}</p>
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
