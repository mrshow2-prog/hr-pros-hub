import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { Page, Photo, isVisible } from "./shared";

const SH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-2.5 border-b border-sienna pb-1 font-dm text-[14px] font-bold uppercase tracking-[0.1em] text-ink">
    {children}
  </h2>
);

export default function TemplateCompact({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  return (
    <Page className="px-12 py-10">
      {isVisible(cv, "contact") && (
        <header className="mb-6 grid grid-cols-[1fr_auto] gap-8 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-5">
            {photoUrl && <Photo url={photoUrl} shape="square" size={100} />}
            <div>
              <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.01em] text-ink">
                {cv.contact.name || "Your name"}
              </h1>
              {cv.contact.jobTitle && (
                <p className="mt-1 text-[16px] font-medium text-sienna">{cv.contact.jobTitle}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-1 text-right text-[12px] leading-[1.4] text-ink/60">
            {cv.contact.location && <div>{cv.contact.location}</div>}
            {cv.contact.phone && <div>{cv.contact.phone}</div>}
            {cv.contact.email && <div>{cv.contact.email}</div>}
            {cv.contact.linkedinUrl && <div>{cv.contact.linkedinUrl}</div>}
          </div>
        </header>
      )}

      <div className="grid grid-cols-[1.6fr_1fr] gap-8">
        {/* Left column */}
        <div>
          {isVisible(cv, "summary") && cv.summary && (
            <section className="mb-5">
              <SH>Summary</SH>
              <p className="text-[13px] font-light leading-[1.5] text-ink/85">{cv.summary}</p>
            </section>
          )}

          {isVisible(cv, "experience") && cv.experience.length > 0 && (
            <section className="mb-5">
              <SH>Work Experience</SH>
              <div className="space-y-4">
                {cv.experience.map((exp) => (
                  <article key={exp.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[14px] font-semibold leading-[1.3] text-ink">{exp.role}</p>
                      <p className="whitespace-nowrap text-[11px] text-ink/60">
                        {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                      </p>
                    </div>
                    <p className="mb-1 text-[13px] font-medium leading-[1.3] text-sienna">
                      {[exp.company, exp.location].filter(Boolean).join(" · ")}
                    </p>
                    {exp.bullets.length > 0 && (
                      <ul className="ml-3.5 list-disc space-y-0.5 text-[12px] font-light leading-[1.4] text-ink/85 marker:text-sienna">
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
            <section>
              <SH>Education</SH>
              <div className="space-y-3">
                {cv.education.map((ed) => (
                  <div key={ed.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-[1.3] text-ink">
                        {ed.qualification}
                      </p>
                      <p className="whitespace-nowrap text-[11px] text-ink/60">{ed.period}</p>
                    </div>
                    <p className="text-[12px] font-medium leading-[1.3] text-sienna">
                      {ed.institution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div>
          {isVisible(cv, "skills") && cv.skills.length > 0 && (
            <section className="mb-5">
              <SH>Skills</SH>
              <div className="flex flex-col gap-1.5 text-[12px] font-light leading-[1.3] text-ink/85">
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
              <SH>Languages</SH>
              <div className="flex flex-col gap-1.5">
                {cv.languages.map((l) => (
                  <div key={l.id} className="text-[12px] leading-[1.3]">
                    <div className="font-semibold text-ink">{l.name}</div>
                    <div className="font-light text-ink/60">{l.level}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Page>
  );
}
