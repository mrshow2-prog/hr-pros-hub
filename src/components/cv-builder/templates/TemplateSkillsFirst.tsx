import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, isVisible } from "./shared";

const SH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 font-dm text-[18px] font-semibold tracking-[-0.01em] text-ink">{children}</h2>
);

export default function TemplateSkillsFirst({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  return (
    <Page className="px-14 py-12">
      {isVisible(cv, "contact") && (
        <header className="mb-10 flex items-center gap-7 border-b border-ink/25 pb-6">
          {photoUrl && <Photo url={photoUrl} shape="circle" size={120} />}
          <div className="flex-1">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mb-3.5 mt-1.5 text-[18px] font-medium text-sienna">
                {cv.contact.jobTitle}
              </p>
            )}
            <ContactLine cv={cv} className="text-[13px] font-light text-ink/60" />
          </div>
        </header>
      )}

      {isVisible(cv, "summary") && cv.summary && (
        <section className="mb-8">
          <SH>Professional Summary</SH>
          <p className="text-[14px] font-light leading-[1.7] text-ink/85">{cv.summary}</p>
        </section>
      )}

      {isVisible(cv, "skills") && cv.skills.length > 0 && (
        <section className="mb-8">
          <SH>Skills &amp; Competencies</SH>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-ink/10 bg-clay px-3.5 py-1.5 text-[13px] text-ink"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "experience") && cv.experience.length > 0 && (
        <section className="mb-8">
          <SH>Work Experience</SH>
          <div className="divide-y divide-clay">
            {cv.experience.map((exp) => (
              <article key={exp.id} className="py-6 first:pt-0 last:pb-0">
                <div className="mb-1.5 flex items-baseline justify-between gap-4">
                  <p className="text-[16px] font-semibold text-ink">{exp.role}</p>
                  <p className="whitespace-nowrap text-[13px] font-light text-ink/60">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                  </p>
                </div>
                <p className="mb-2 text-[14px] font-medium text-sienna">
                  {[exp.company, exp.location].filter(Boolean).join(" · ")}
                </p>
                {exp.bullets.length > 0 && (
                  <ul className="space-y-1">
                    {exp.bullets
                      .filter((b) => b.status !== "reverted" && b.rewrite)
                      .map((b) => (
                        <li
                          key={b.id}
                          className="relative pl-5 text-[13px] font-light leading-[1.6] text-ink/85"
                        >
                          <span className="absolute left-0 font-semibold text-sienna">→</span>
                          {b.rewrite}
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
        <section className="mb-8">
          <SH>Education</SH>
          <div className="space-y-4">
            {cv.education.map((ed) => (
              <div key={ed.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-semibold text-ink">{ed.qualification}</p>
                  <p className="whitespace-nowrap text-[13px] font-light text-ink/60">{ed.period}</p>
                </div>
                <p className="text-[14px] font-medium text-sienna">{ed.institution}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "languages") && cv.languages.length > 0 && (
        <section>
          <SH>Languages</SH>
          <div className="flex flex-wrap gap-5 text-[13px] font-light text-ink/85">
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
