import { Fragment } from "react";
import { MapPin, Phone, Mail, Linkedin, Globe } from "lucide-react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { Page, visibleBullets, stripUrlPrefix } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

/** Milano — Editorial creative template with numbered sections + reorderable body. */
export default function TemplateMilano({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const accent = "var(--accent, #c9a36a)";

  const initials = (cv.contact.name || "Y N")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "YN";

  let n = 1;
  const num = () => String(n++).padStart(2, "0");

  const SH = ({ num: numStr, children }: { num: string; children: React.ReactNode }) => (
    <header className="mb-4 flex items-end gap-3">
      <span className="font-syne text-[34px] font-bold leading-none" style={{ color: accent as string }}>
        {numStr}
      </span>
      <div className="flex-1">
        <h2 className="font-syne text-[20px] font-bold uppercase tracking-[0.04em] text-ink">{children}</h2>
        <span className="mt-1 block h-[3px] w-12" style={{ background: accent as string }} />
      </div>
    </header>
  );

  const contactItems = ([
    [MapPin, cv.contact.location],
    [Phone, cv.contact.phone],
    [Mail, cv.contact.email],
    [Linkedin, stripUrlPrefix(cv.contact.linkedinUrl)],
    [Globe, stripUrlPrefix(cv.contact.website)],
  ] as const).filter(([, v]) => Boolean(v));

  const renderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    experience: () => (
      <section className="mb-9">
        <SH num={num()}>Experience</SH>
        <div className="space-y-6">
          {cv.experience.map((exp) => {
            const endYear = (exp.endDate || exp.period || "").match(/\d{4}/)?.[0] ?? null;
            const startYear = (exp.startDate || "").match(/\d{4}/)?.[0] ?? null;
            const displayYear = endYear ?? startYear;
            return (
              <article key={exp.id} className="grid grid-cols-[88px_1fr] gap-5">
                <div>
                  {displayYear && (
                    <>
                      <p className="font-syne text-[40px] font-bold leading-none tracking-tight" style={{ color: accent as string }}>
                        {displayYear}
                      </p>
                      <p className="mt-1 font-dm text-[10px] uppercase tracking-[0.2em] text-ink/55">
                        {startYear && startYear !== displayYear ? `from ${startYear}` : ""}
                      </p>
                    </>
                  )}
                </div>
                <div>
                  <p className="font-syne text-[18px] font-bold leading-snug text-ink">{exp.role}</p>
                  <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink/65">
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </p>
                  {visibleBullets(exp).length > 0 && (
                    <ul className="space-y-1.5">
                      {visibleBullets(exp).map((b) => (
                        <li key={b.id} className="flex gap-2 text-[12.5px] leading-[1.65] text-ink/85">
                          <span className="relative shrink-0 top-[10px] h-[2px] w-3" style={{ background: accent as string }} />
                          <span className="flex-1">{b.rewrite || b.original}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    ),
    skills: () => (
      <section className="mb-9">
        <SH num={num()}>Skills</SH>
        <div className="flex flex-wrap gap-2">
          {cv.skills.map((s, i) => (
            <span
              key={s}
              className="rounded-full px-3 py-1 text-[11.5px] font-medium"
              style={
                i % 2 === 0
                  ? { background: accent as string, color: "white" }
                  : { background: "transparent", border: `1.5px solid ${accent}`, color: "#1a1714" }
              }
            >
              {s}
            </span>
          ))}
        </div>
      </section>
    ),
    competencies: () => (
      <section className="mb-9">
        <SH num={num()}>Competencies</SH>
        <div className="space-y-2">
          {cv.competencyClusters.map((c) => (
            <p key={c.id} className="text-[12.5px] leading-[1.6] text-ink/85">
              {c.title && (
                <span className="font-dm font-bold" style={{ color: accent as string }}>{c.title}: </span>
              )}
              {c.items.filter(Boolean).join(" · ")}
            </p>
          ))}
        </div>
      </section>
    ),
    languages: () => (
      <section className="mb-9">
        <SH num={num()}>Languages</SH>
        <ul className="space-y-2">
          {cv.languages.map((l) => {
            const lvl = (l.level || "").toLowerCase();
            const filled =
              lvl.includes("native") || lvl.includes("fluent") ? 5 :
              lvl.includes("professional") ? 4 :
              lvl.includes("conversational") ? 3 :
              lvl.includes("basic") ? 2 : 4;
            return (
              <li key={l.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="font-syne font-semibold text-ink">{l.name}</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="h-2 w-4" style={{ background: j < filled ? (accent as string) : "rgba(0,0,0,0.1)" }} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    ),
    education: () => (
      <section className="mb-9">
        <SH num={num()}>Education</SH>
        <div className="space-y-3.5">
          {cv.education.map((ed) => (
            <div key={ed.id} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-ink/10 pb-2.5">
              <div>
                <p className="font-syne text-[15px] font-semibold text-ink">{ed.qualification}</p>
                <p className="text-[12.5px] font-semibold" style={{ color: accent as string }}>{ed.institution}</p>
              </div>
              <p className="whitespace-nowrap font-dm text-[12px] text-ink/55">{ed.period}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    achievements: () => (
      <section className="mb-9">
        <SH num={num()}>Achievements</SH>
        <ul className="space-y-1.5">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-[1.65] text-ink/85">
              <span className="relative shrink-0 top-[10px] h-[2px] w-3" style={{ background: accent as string }} />
              <span className="flex-1">{a}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section className="mb-9">
        <SH num={num()}>Certifications</SH>
        <div className="space-y-2">
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2 text-[12.5px] text-ink/85">
              <div>
                <span className="font-syne font-semibold text-ink">{c.name}</span>
                {c.issuer && <span style={{ color: accent as string }}> — {c.issuer}</span>}
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
            <SH num={num()}>{s.title || "Additional"}</SH>
            <ul className="space-y-1.5">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-[1.65] text-ink/85">
                  <span className="relative shrink-0 top-[10px] h-[2px] w-3" style={{ background: accent as string }} />
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
    <Page>
      <header className="relative px-12 pt-12 pb-8">
        <div className="flex items-stretch gap-6">
          {photoUrl ? (
            <div className="shrink-0">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden">
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="absolute -bottom-2 -right-2 h-10 w-10" style={{ background: accent as string }} aria-hidden />
              </div>
            </div>
          ) : (
            <div
              className="flex h-32 w-32 shrink-0 items-center justify-center font-syne text-[58px] font-bold leading-none text-paper"
              style={{ background: accent as string }}
            >
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="mb-2 font-dm text-[11px] font-bold uppercase tracking-[0.32em]" style={{ color: accent as string }}>
              Curriculum Vitae
            </p>
            {(() => {
              const tokens = (cv.contact.name || "Your name").trim().split(/\s+/);
              const first = tokens.length > 1 ? tokens.slice(0, -1).join(" ") : tokens[0];
              const last = tokens.length > 1 ? tokens[tokens.length - 1] : "";
              return (
                <>
                  <h1 className="font-syne text-[52px] font-bold leading-[0.95] tracking-[-0.035em] text-ink">{first}</h1>
                  {last && (
                    <h1 className="font-syne text-[52px] font-bold italic leading-[0.95] tracking-[-0.035em]" style={{ color: accent as string }}>
                      {last}
                    </h1>
                  )}
                </>
              );
            })()}
            {cv.contact.jobTitle && (
              <p className="mt-3 font-dm text-[14px] font-medium uppercase tracking-[0.24em] text-ink/70">
                {cv.contact.jobTitle}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-[5px] flex-1" style={{ background: accent as string }} aria-hidden />
          <span className="h-[5px] w-8 bg-ink" aria-hidden />
        </div>

        {shouldRender(cv, "contact") && contactItems.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink/75">
            {contactItems.map(([Icon, v], i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <Icon className="h-3 w-3" style={{ color: accent as string }} strokeWidth={2.4} />
                <span>{v as string}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="px-12 pb-12">
        {shouldRender(cv, "summary") && (
          <section className="mb-9">
            <SH num={num()}>Profile</SH>
            <p className="font-syne text-justify hyphens-auto text-[15px] italic leading-[1.7] text-ink/85">"{cv.summary}"</p>
          </section>
        )}

        {getSectionOrder(cv)
          .filter((k) => shouldRender(cv, k))
          .map((k) => (
            <Fragment key={k}>{renderers[k]?.()}</Fragment>
          ))}
      </div>
    </Page>
  );
}
