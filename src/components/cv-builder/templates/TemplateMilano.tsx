import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Globe,
} from "lucide-react";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { Page, isVisible, visibleBullets, stripUrlPrefix } from "./shared";

/**
 * Milano — Editorial creative template. Bold monogram block, big display
 * typography, large year markers on the experience timeline and pill
 * skills. Inspired by Kickresume premium "creative" templates.
 */
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

  const SH = ({ num, children }: { num: string; children: React.ReactNode }) => (
    <header className="mb-4 flex items-end gap-3">
      <span
        className="font-syne text-[34px] font-bold leading-none"
        style={{ color: accent as string }}
      >
        {num}
      </span>
      <div className="flex-1">
        <h2 className="font-syne text-[20px] font-bold uppercase tracking-[0.04em] text-ink">
          {children}
        </h2>
        <span
          className="mt-1 block h-[3px] w-12"
          style={{ background: accent as string }}
        />
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

  return (
    <Page>
      {/* ─── Header: monogram + name ─── */}
      <header className="relative px-12 pt-12 pb-8">
        <div className="flex items-stretch gap-6">
          {/* Monogram or photo */}
          {photoUrl ? (
            <div className="shrink-0">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden">
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <span
                  className="absolute -bottom-2 -right-2 h-10 w-10"
                  style={{ background: accent as string }}
                  aria-hidden
                />
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
            <p
              className="mb-2 font-dm text-[11px] font-bold uppercase tracking-[0.32em]"
              style={{ color: accent as string }}
            >
              Curriculum Vitae
            </p>
            <h1 className="font-syne text-[52px] font-bold leading-[0.95] tracking-[-0.035em] text-ink">
              {(cv.contact.name || "Your name").split(" ").slice(0, -1).join(" ") || cv.contact.name || "Your"}
            </h1>
            <h1 className="font-syne text-[52px] font-bold italic leading-[0.95] tracking-[-0.035em]" style={{ color: accent as string }}>
              {(cv.contact.name || "Your name").split(" ").slice(-1).join(" ") || "name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mt-3 font-dm text-[14px] font-medium uppercase tracking-[0.24em] text-ink/70">
                {cv.contact.jobTitle}
              </p>
            )}
          </div>
        </div>

        {/* Thick accent divider */}
        <div className="mt-8 flex items-center gap-3">
          <span className="h-[5px] flex-1" style={{ background: accent as string }} aria-hidden />
          <span className="h-[5px] w-8 bg-ink" aria-hidden />
        </div>

        {/* Contact strip */}
        {isVisible(cv, "contact") && contactItems.length > 0 && (
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
        {/* ─── Profile ─── */}
        {isVisible(cv, "summary") && cv.summary && (
          <section className="mb-9">
            <SH num="01">Profile</SH>
            <p className="font-syne text-[15px] italic leading-[1.7] text-ink/85">
              "{cv.summary}"
            </p>
          </section>
        )}

        {/* ─── Experience ─── */}
        {isVisible(cv, "experience") && cv.experience.length > 0 && (
          <section className="mb-9">
            <SH num="02">Experience</SH>
            <div className="space-y-6">
              {cv.experience.map((exp, i) => {
                const year = (exp.endDate || exp.startDate || exp.period || "—")
                  .match(/\d{4}/)?.[0] ?? String(2025 - i);
                return (
                  <article key={exp.id} className="grid grid-cols-[88px_1fr] gap-5">
                    <div>
                      <p
                        className="font-syne text-[40px] font-bold leading-none tracking-tight"
                        style={{ color: accent as string }}
                      >
                        {year}
                      </p>
                      <p className="mt-1 font-dm text-[10px] uppercase tracking-[0.2em] text-ink/55">
                        {(exp.startDate || "").match(/\d{4}/)?.[0] !== year
                          ? `from ${(exp.startDate || "").match(/\d{4}/)?.[0] ?? ""}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="font-syne text-[18px] font-bold leading-snug text-ink">
                        {exp.role}
                      </p>
                      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink/65">
                        {[exp.company, exp.location].filter(Boolean).join(" · ")}
                      </p>
                      {visibleBullets(exp).length > 0 && (
                        <ul className="space-y-1.5">
                          {visibleBullets(exp).map((b) => (
                            <li
                              key={b.id}
                              className="relative pl-5 text-[12.5px] leading-[1.65] text-ink/85"
                            >
                              <span
                                className="absolute left-0 top-[10px] h-[2px] w-3"
                                style={{ background: accent as string }}
                              />
                              {b.rewrite || b.original}
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
        )}

        {/* ─── Skills + Languages two-col ─── */}
        <div className="mb-9 grid grid-cols-[1.4fr_1fr] gap-10">
          {isVisible(cv, "skills") && cv.skills.length > 0 && (
            <section>
              <SH num="03">Skills</SH>
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
          )}

          {isVisible(cv, "languages") && cv.languages.length > 0 && (
            <section>
              <SH num="04">Languages</SH>
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
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span
                              key={j}
                              className="h-2 w-4"
                              style={{
                                background:
                                  j < filled ? (accent as string) : "rgba(0,0,0,0.1)",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* ─── Education ─── */}
        {isVisible(cv, "education") && cv.education.length > 0 && (
          <section>
            <SH num="05">Education</SH>
            <div className="space-y-3.5">
              {cv.education.map((ed) => (
                <div key={ed.id} className="grid grid-cols-[1fr_auto] items-baseline gap-3 border-b border-ink/10 pb-2.5">
                  <div>
                    <p className="font-syne text-[15px] font-semibold text-ink">{ed.qualification}</p>
                    <p className="text-[12.5px] font-semibold" style={{ color: accent as string }}>
                      {ed.institution}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-dm text-[12px] text-ink/55">{ed.period}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Page>
  );
}
