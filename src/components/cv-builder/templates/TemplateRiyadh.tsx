import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { isVisible, visibleBullets } from "./shared";

/** Riyadh — Bold sidebar-style template (dark sienna rail). */
export default function TemplateRiyadh({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const SidebarHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-2.5 border-b border-paper/30 pb-1 font-dm text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
      {children}
    </h2>
  );
  const MainHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 font-dm text-[14px] font-bold uppercase tracking-[0.16em] text-ink">
      <span className="block">{children}</span>
      <span className="mt-1 block h-[2px] w-10 bg-sienna" />
    </h2>
  );

  return (
    <div className="mx-auto flex w-[794px] max-w-full bg-white text-ink font-dm text-left">
      {/* Sidebar */}
      <aside
        className="w-[252px] shrink-0 px-7 py-10 text-paper"
        style={{ backgroundColor: "#6E3D2F" }}
      >
        {photoUrl && (
          <div className="mx-auto mb-7 h-28 w-28 overflow-hidden border border-paper/30">
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {isVisible(cv, "contact") && (
          <section className="mb-7">
            <SidebarHeading>Contact</SidebarHeading>
            <ul className="space-y-2.5">
              {[
                ["Location", cv.contact.location],
                ["Phone", cv.contact.phone],
                ["Email", cv.contact.email],
                ["LinkedIn", cv.contact.linkedinUrl],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <li key={k as string}>
                    <p className="font-dm text-[9px] font-bold uppercase tracking-[0.16em] text-paper/65">
                      {k}
                    </p>
                    <p className="break-words text-[11.5px] leading-snug text-paper">{v as string}</p>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {isVisible(cv, "skills") && cv.skills.length > 0 && (
          <section className="mb-7">
            <SidebarHeading>Skills</SidebarHeading>
            <ul className="space-y-1.5">
              {cv.skills.map((s) => (
                <li key={s} className="flex gap-2 text-[12px] leading-snug text-paper">
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 bg-sienna" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isVisible(cv, "languages") && cv.languages.length > 0 && (
          <section>
            <SidebarHeading>Languages</SidebarHeading>
            <ul className="space-y-1.5">
              {cv.languages.map((l) => (
                <li key={l.id} className="text-[12px] text-paper">
                  <span className="font-semibold">{l.name}</span>
                  {l.level ? <span className="text-paper/75"> — {l.level}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 px-10 py-10">
        <header className="mb-7">
          <h1 className="text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            {cv.contact.name || "Your name"}
          </h1>
          {cv.contact.jobTitle && (
            <p className="mt-2 text-[16px] font-semibold uppercase tracking-[0.14em] text-sienna">
              {cv.contact.jobTitle}
            </p>
          )}
        </header>

        {isVisible(cv, "summary") && cv.summary && (
          <section className="mb-7">
            <MainHeading>Profile</MainHeading>
            <p className="text-[13px] leading-[1.65] text-ink/85">{cv.summary}</p>
          </section>
        )}

        {isVisible(cv, "experience") && cv.experience.length > 0 && (
          <section className="mb-7">
            <MainHeading>Experience</MainHeading>
            <div className="space-y-5">
              {cv.experience.map((exp) => (
                <article key={exp.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14.5px] font-bold text-ink">{exp.role}</p>
                    <p className="whitespace-nowrap text-[11.5px] text-ink/55">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                    </p>
                  </div>
                  <p className="mb-1.5 text-[12.5px] font-semibold text-sienna">
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </p>
                  {visibleBullets(exp).length > 0 && (
                    <ul className="space-y-1">
                      {visibleBullets(exp)
                        .map((b) => (
                          <li key={b.id} className="relative pl-4 text-[12.5px] leading-[1.55] text-ink/85">
                            <span className="absolute left-0 top-[2px] font-bold text-sienna">•</span>
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
          <section>
            <MainHeading>Education</MainHeading>
            <div className="space-y-3">
              {cv.education.map((ed) => (
                <div key={ed.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-bold text-ink">{ed.qualification}</p>
                    <p className="whitespace-nowrap text-[11.5px] text-ink/55">{ed.period}</p>
                  </div>
                  <p className="text-[12.5px] font-semibold text-sienna">{ed.institution}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
