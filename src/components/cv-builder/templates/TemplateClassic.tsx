import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { ContactLine, Page, Photo, isVisible } from "./shared";

interface Props {
  cv: GeneratedCV;
  photoUrl: string | null;
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-3.5 border-b border-ink/30 pb-1.5 font-syne text-[20px] font-semibold uppercase tracking-[0.05em] text-ink">
    {children}
  </h2>
);

export default function TemplateClassic({ cv, photoUrl }: Props) {
  return (
    <Page className="px-14 py-12">
      {/* Header */}
      {isVisible(cv, "contact") && (
        <header className="mb-8 flex items-start gap-6 border-b-2 border-ink pb-6">
          {photoUrl && <Photo url={photoUrl} shape="circle" size={120} className="border-[3px] border-stone" />}
          <div className="flex-1">
            <h1 className="font-syne text-[42px] font-semibold leading-[1.1] text-ink">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mb-4 mt-1.5 text-[18px] text-sienna">{cv.contact.jobTitle}</p>
            )}
            <ContactLine cv={cv} className="text-[13px] text-ink/60" />
          </div>
        </header>
      )}

      {isVisible(cv, "summary") && cv.summary && (
        <section className="mb-7">
          <SectionHeader>Professional Summary</SectionHeader>
          <p className="text-[14px] leading-[1.6] text-ink/85">{cv.summary}</p>
        </section>
      )}

      {isVisible(cv, "experience") && cv.experience.length > 0 && (
        <section className="mb-7">
          <SectionHeader>Work Experience</SectionHeader>
          <div className="space-y-5">
            {cv.experience.map((exp) => (
              <article key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <p className="text-[15px] font-semibold text-ink">{exp.role}</p>
                  <p className="whitespace-nowrap text-[13px] text-ink/60">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                  </p>
                </div>
                <p className="mb-1.5 text-[14px] text-sienna">
                  {[exp.company, exp.location].filter(Boolean).join(" · ")}
                </p>
                {exp.bullets.length > 0 && (
                  <ul className="ml-5 list-disc space-y-1 text-[13px] leading-[1.5] text-ink/85 marker:text-sienna">
                    {exp.bullets
                      .filter((b) => b.status !== "reverted" && b.rewrite)
                      .map((b) => (
                        <li key={b.id}>{b.rewrite}</li>
                      ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "education") && cv.education.length > 0 && (
        <section className="mb-7">
          <SectionHeader>Education</SectionHeader>
          <div className="space-y-4">
            {cv.education.map((ed) => (
              <div key={ed.id}>
                <div className="flex items-baseline justify-between">
                  <p className="text-[15px] font-semibold text-ink">{ed.qualification}</p>
                  <p className="whitespace-nowrap text-[13px] text-ink/60">{ed.period}</p>
                </div>
                <p className="text-[14px] text-sienna">{ed.institution}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "skills") && cv.skills.length > 0 && (
        <section className="mb-7">
          <SectionHeader>Skills &amp; Competencies</SectionHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-ink/85">
            {cv.skills.map((s) => (
              <div key={s}>
                <span className="mr-2 font-bold text-sienna">•</span>
                {s}
              </div>
            ))}
          </div>
        </section>
      )}

      {isVisible(cv, "languages") && cv.languages.length > 0 && (
        <section>
          <SectionHeader>Languages</SectionHeader>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink/85">
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
