import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, isVisible, visibleBullets } from "./shared";

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
  return (
    <Page className="px-[72px]">
      {isVisible(cv, "contact") && (
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

      {isVisible(cv, "summary") && cv.summary && (
        <section className="mb-12">
          <SH>Executive Summary</SH>
          <p className="max-w-[680px] border-l-[3px] border-sienna pl-6 text-[16px] font-light leading-[1.8] text-ink/85">
            {cv.summary}
          </p>
        </section>
      )}

      {isVisible(cv, "experience") && cv.experience.length > 0 && (
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
                    {visibleBullets(exp)
                      .map((b) => (
                        <li
                          key={b.id}
                          className="relative pl-6 text-[15px] font-light leading-[1.7] text-ink/85"
                        >
                          <span className="absolute left-0 top-[12px] h-0.5 w-2 bg-sienna" />
                          {b.rewrite || b.original}
                        </li>
                      ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "education") && cv.education.length > 0 && (
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
      )}

      {isVisible(cv, "skills") && cv.skills.length > 0 && (
        <section className="mb-12">
          <SH>Core Competencies</SH>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] font-light text-ink/85">
            {cv.skills.map((s) => (
              <div key={s}>{s}</div>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "languages") && cv.languages.length > 0 && (
        <section>
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
      )}
    </Page>
  );
}
