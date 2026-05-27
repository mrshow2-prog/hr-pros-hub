import { Fragment } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Globe,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Languages as LanguagesIcon,
  Award,
  BadgeCheck,
  ListChecks,
  FileText,
} from "lucide-react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { Page, visibleBullets, stripUrlPrefix } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

/** Tokyo — Bold gradient header band + reorderable body. */
export default function TemplateTokyo({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const accent = "var(--accent, #c9a36a)";

  const SH = ({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) => (
    <header className="mb-3 flex items-center gap-2.5">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-md"
        style={{ background: accent as string }}
      >
        <Icon className="h-3 w-3 text-paper" strokeWidth={2.4} />
      </span>
      <h2 className="font-syne text-[16px] font-bold tracking-[-0.01em] text-ink">{children}</h2>
      <span className="ml-1 h-px flex-1 bg-ink/10" />
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
      <section className="mb-7 col-span-2">
        <SH icon={Briefcase}>Experience</SH>
        <div className="space-y-5">
          {cv.experience.map((exp) => (
            <article key={exp.id} className="grid grid-cols-[110px_1fr] gap-5">
              <div className="pt-1 text-right">
                <p className="font-dm text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: accent as string }}>
                  {[exp.startDate, exp.endDate].filter(Boolean).join(" — ") || exp.period}
                </p>
              </div>
              <div className="relative border-l-2 pl-5" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-2 ring-paper" style={{ background: accent as string }} />
                <p className="text-[14.5px] font-bold text-ink">{exp.role}</p>
                <p className="mb-2 text-[12.5px] font-semibold text-ink/65">
                  {[exp.company, exp.location].filter(Boolean).join(" · ")}
                </p>
                {visibleBullets(exp).length > 0 && (
                  <ul className="space-y-1.5">
                    {visibleBullets(exp).map((b) => (
                      <li key={b.id} className="flex gap-2 text-[12.5px] leading-[1.6] text-ink/85">
                        <span className="relative shrink-0 top-[8px] h-1 w-2 rounded-sm" style={{ background: accent as string }} />
                        <span className="flex-1">{b.rewrite || b.original}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    ),
    education: () => (
      <section>
        <SH icon={GraduationCap}>Education</SH>
        <div className="space-y-3">
          {cv.education.map((ed) => (
            <div key={ed.id}>
              <p className="text-[13px] font-bold text-ink">{ed.qualification}</p>
              <p className="text-[12px] font-semibold" style={{ color: accent as string }}>{ed.institution}</p>
              {ed.period && <p className="text-[11px] text-ink/55">{ed.period}</p>}
            </div>
          ))}
        </div>
      </section>
    ),
    skills: () => (
      <section>
        <SH icon={Sparkles}>Skills</SH>
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.map((s) => (
            <span
              key={s}
              className="rounded-md border px-2.5 py-1 text-[11.5px] font-medium text-ink"
              style={{ borderColor: "rgba(0,0,0,0.12)", background: `color-mix(in srgb, ${accent} 8%, transparent)` }}
            >
              {s}
            </span>
          ))}
        </div>
      </section>
    ),
    competencies: () => (
      <section>
        <SH icon={ListChecks}>Competencies</SH>
        <div className="space-y-2">
          {cv.competencyClusters.map((c) => (
            <div key={c.id} className="text-[12.5px] text-ink/85">
              {c.title && <span className="font-semibold text-ink">{c.title}: </span>}
              {c.items.filter(Boolean).join(", ")}
            </div>
          ))}
        </div>
      </section>
    ),
    languages: () => (
      <section>
        <SH icon={LanguagesIcon}>Languages</SH>
        <ul className="space-y-1.5">
          {cv.languages.map((l) => (
            <li key={l.id} className="flex items-baseline justify-between text-[12.5px]">
              <span className="font-semibold text-ink">{l.name}</span>
              <span className="text-ink/60">{l.level}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    achievements: () => (
      <section>
        <SH icon={Award}>Achievements</SH>
        <ul className="space-y-1.5">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-[1.55] text-ink/85">
              <span className="relative shrink-0 top-[6px] h-1.5 w-1.5 rounded-full" style={{ background: accent as string }} />
              <span className="flex-1">{a}</span>
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section>
        <SH icon={BadgeCheck}>Certifications</SH>
        <ul className="space-y-1.5 text-[12.5px] text-ink/85">
          {cv.certifications.map((c) => (
            <li key={c.id} className="flex items-baseline justify-between gap-2">
              <div>
                <span className="font-semibold text-ink">{c.name}</span>
                {c.issuer && <span style={{ color: accent as string }}> — {c.issuer}</span>}
              </div>
              {c.date && <span className="text-ink/55">{c.date}</span>}
            </li>
          ))}
        </ul>
      </section>
    ),
    custom: () => (
      <>
        {cv.customSections.map((s) => (
          <section key={s.id} className="col-span-2">
            <SH icon={FileText}>{s.title || "Additional"}</SH>
            <ul className="space-y-1.5">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-[1.55] text-ink/85">
                  <span className="relative shrink-0 top-[6px] h-1.5 w-1.5 rounded-full" style={{ background: accent as string }} />
                  <span className="flex-1">{b}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    ),
  };

  // Split body: experience renders full-width; other reorderables go in a 2-col grid.
  const orderedKeys = getSectionOrder(cv).filter((k) => shouldRender(cv, k));
  const fullWidthKeys: SectionKey[] = ["experience", "custom"];
  const fullWidth = orderedKeys.filter((k) => fullWidthKeys.includes(k));
  const grid = orderedKeys.filter((k) => !fullWidthKeys.includes(k));

  return (
    <Page>
      {/* Header band */}
      <header
        className="relative overflow-hidden px-12 pt-10 pb-8 text-paper"
        style={{ background: `linear-gradient(125deg, ${accent} 0%, rgba(0,0,0,0.55) 130%)` }}
      >
        <span
          className="absolute -right-16 -top-10 h-48 w-48 rotate-12 bg-paper/10"
          style={{ borderRadius: "32% 68% 50% 50% / 60% 40% 60% 40%" }}
          aria-hidden
        />
        <span className="absolute -bottom-8 right-24 h-20 w-20 rotate-45 border-2 border-paper/15" aria-hidden />

        <div className="relative flex items-center gap-7">
          {photoUrl && (
            <div className="shrink-0 rounded-full bg-paper p-1.5 shadow-xl">
              <div className="h-28 w-28 overflow-hidden rounded-full">
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-syne text-[42px] font-bold leading-[1.02] tracking-[-0.025em] text-paper">
              {cv.contact.name || "Your name"}
            </h1>
            {cv.contact.jobTitle && (
              <p className="mt-1.5 font-dm text-[14px] font-medium uppercase tracking-[0.22em] text-paper/85">
                {cv.contact.jobTitle}
              </p>
            )}
          </div>
        </div>

        {shouldRender(cv, "contact") && contactItems.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2">
            {contactItems.map(([Icon, v], i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-paper/15 px-3 py-1 text-[11.5px] text-paper backdrop-blur-sm">
                <Icon className="h-3 w-3" strokeWidth={2.2} />
                <span>{v as string}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="px-12 pt-9 pb-12">
        {shouldRender(cv, "summary") && (
          <section className="mb-7">
            <SH icon={User}>About me</SH>
            <p className="relative pl-4 text-justify hyphens-auto text-[13px] leading-[1.7] text-ink/85">
              <span className="absolute left-0 top-0 h-full w-[3px] rounded-full" style={{ background: accent as string }} />
              {cv.summary}
            </p>
          </section>
        )}

        {fullWidth.filter((k) => k === "experience").map((k) => (
          <Fragment key={k}>{renderers[k]?.()}</Fragment>
        ))}

        {grid.length > 0 && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-7">
            {grid.map((k) => (
              <Fragment key={k}>{renderers[k]?.()}</Fragment>
            ))}
          </div>
        )}

        {fullWidth.filter((k) => k !== "experience").map((k) => (
          <div key={k} className="mt-7">
            {renderers[k]?.()}
          </div>
        ))}
      </div>
    </Page>
  );
}
