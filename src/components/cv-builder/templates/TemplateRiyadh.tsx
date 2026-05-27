import { Fragment } from "react";
import { MapPin, Phone, Mail, Linkedin, Globe } from "lucide-react";
import type { GeneratedCV, SectionKey } from "@/contexts/CVBuilderContext";
import { visibleBullets, stripUrlPrefix } from "./shared";
import { getSectionOrder, shouldRender } from "@/lib/cv/sectionVisibility";

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

  // Sidebar-only sections in this layout
  const SIDEBAR_KEYS: SectionKey[] = ["skills", "languages", "education"];

  const sidebarRenderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    skills: () => (
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
    ),
    languages: () => (
      <section className="mb-7">
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
    ),
    education: () => (
      <section className="mb-7">
        <SidebarHeading>Education</SidebarHeading>
        <ul className="space-y-3">
          {cv.education.map((ed) => (
            <li key={ed.id} className="text-[12px] leading-snug text-paper">
              <p className="font-semibold">{ed.qualification}</p>
              <p className="text-paper/80">{ed.institution}</p>
              {ed.period && <p className="text-[10.5px] text-paper/60">{ed.period}</p>}
            </li>
          ))}
        </ul>
      </section>
    ),
  };

  const mainRenderers: Partial<Record<SectionKey, () => JSX.Element>> = {
    experience: () => (
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
                  {visibleBullets(exp).map((b) => (
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
    ),
    competencies: () => (
      <section className="mb-7">
        <MainHeading>Core Competencies</MainHeading>
        <div className="space-y-2">
          {cv.competencyClusters.map((c) => (
            <div key={c.id}>
              {c.title && (
                <p className="mb-0.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-sienna">
                  {c.title}
                </p>
              )}
              <p className="text-[12.5px] leading-[1.6] text-ink/85">
                {c.items.filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
    achievements: () => (
      <section className="mb-7">
        <MainHeading>Achievements</MainHeading>
        <ul className="space-y-1">
          {cv.achievements.filter(Boolean).map((a, i) => (
            <li key={i} className="relative pl-4 text-[12.5px] leading-[1.55] text-ink/85">
              <span className="absolute left-0 top-[2px] font-bold text-sienna">•</span>
              {a}
            </li>
          ))}
        </ul>
      </section>
    ),
    certifications: () => (
      <section className="mb-7">
        <MainHeading>Certifications</MainHeading>
        <div className="space-y-1.5">
          {cv.certifications.map((c) => (
            <div key={c.id} className="flex items-baseline justify-between gap-3 text-[12.5px] text-ink/85">
              <div>
                <span className="font-semibold text-ink">{c.name}</span>
                {c.issuer && <span className="text-sienna"> — {c.issuer}</span>}
              </div>
              {c.date && <span className="whitespace-nowrap text-ink/55 text-[11.5px]">{c.date}</span>}
            </div>
          ))}
        </div>
      </section>
    ),
    custom: () => (
      <>
        {cv.customSections.map((s) => (
          <section key={s.id} className="mb-7">
            <MainHeading>{s.title || "Additional"}</MainHeading>
            <ul className="space-y-1">
              {s.bullets.filter(Boolean).map((b, i) => (
                <li key={i} className="relative pl-4 text-[12.5px] leading-[1.55] text-ink/85">
                  <span className="absolute left-0 top-[2px] font-bold text-sienna">•</span>
                  {b}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </>
    ),
  };

  const order = getSectionOrder(cv);
  const sidebarOrder = order.filter((k) => SIDEBAR_KEYS.includes(k) && shouldRender(cv, k));
  const mainOrder = order.filter((k) => !SIDEBAR_KEYS.includes(k) && shouldRender(cv, k));

  return (
    <div className="mx-auto flex w-[794px] max-w-full bg-white text-ink font-dm text-left">
      {/* Sidebar */}
      <aside
        className="w-[252px] shrink-0 px-7 py-10 text-paper"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent, #9c5643) 78%, #0a0a0a)" }}
      >
        {photoUrl && (
          <div className="mx-auto mb-7 h-28 w-28 overflow-hidden border border-paper/30">
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        {shouldRender(cv, "contact") && (
          <section className="mb-7">
            <SidebarHeading>Contact</SidebarHeading>
            <ul className="space-y-2">
              {([
                [MapPin, cv.contact.location],
                [Phone, cv.contact.phone],
                [Mail, cv.contact.email],
                [Linkedin, stripUrlPrefix(cv.contact.linkedinUrl)],
                [Globe, stripUrlPrefix(cv.contact.website)],
              ] as const)
                .filter(([, v]) => Boolean(v))
                .map(([Icon, v], i) => (
                  <li key={i} className="flex items-start gap-2 text-[11.5px] leading-snug text-paper">
                    <Icon className="mt-[2px] h-3 w-3 shrink-0 opacity-80" strokeWidth={2} />
                    <span className="break-words">{v as string}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {sidebarOrder.map((k) => (
          <Fragment key={k}>{sidebarRenderers[k]?.()}</Fragment>
        ))}
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

        {shouldRender(cv, "summary") && (
          <section className="mb-7">
            <MainHeading>Profile</MainHeading>
            <p className="text-justify hyphens-auto text-[13px] leading-[1.65] text-ink/85">{cv.summary}</p>
          </section>
        )}

        {mainOrder.map((k) => (
          <Fragment key={k}>{mainRenderers[k]?.()}</Fragment>
        ))}
      </main>
    </div>
  );
}
