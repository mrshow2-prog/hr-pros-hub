import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Globe,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages as LanguagesIcon,
  Sparkles,
} from "lucide-react";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { isVisible, visibleBullets, stripUrlPrefix } from "./shared";

/**
 * Casablanca — Modern two-column template with a rich coloured sidebar.
 * Sidebar carries the photo, contact, skills with progress bars, languages
 * with dots, and education. The right column hosts a timeline of experience.
 * Inspired by Enhancv / Resume.io top-rated layouts.
 */
export default function TemplateCasablanca({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  // Use a deep tinted overlay so the sidebar looks rich even when accent is light.
  const sidebarBg = "#1f2933";
  const accentBg = "var(--accent, #c9a36a)";

  const SideH = ({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) => (
    <div className="mb-3 flex items-center gap-2">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: accentBg as string }}
      >
        <Icon className="h-3 w-3 text-paper" strokeWidth={2.4} />
      </span>
      <h2 className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-paper">
        {children}
      </h2>
    </div>
  );

  const MainH = ({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) => (
    <header className="mb-4 flex items-center gap-2.5">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md"
        style={{ background: "var(--accent, #c9a36a)" }}
      >
        <Icon className="h-3.5 w-3.5 text-paper" strokeWidth={2.4} />
      </span>
      <h2 className="font-dm text-[15px] font-bold uppercase tracking-[0.18em] text-ink">
        {children}
      </h2>
      <span className="ml-1 h-px flex-1 bg-ink/10" />
    </header>
  );

  const contactRows = ([
    [MapPin, cv.contact.location],
    [Phone, cv.contact.phone],
    [Mail, cv.contact.email],
    [Linkedin, stripUrlPrefix(cv.contact.linkedinUrl)],
    [Globe, stripUrlPrefix(cv.contact.website)],
  ] as const).filter(([, v]) => Boolean(v));

  return (
    <div className="mx-auto flex w-[794px] max-w-full bg-white text-ink font-dm text-left">
      {/* ───── Sidebar ───── */}
      <aside
        className="relative w-[272px] shrink-0 px-7 pt-10 pb-12 text-paper"
        style={{ background: sidebarBg }}
      >
        {/* Decorative top accent bar */}
        <span
          className="absolute left-0 right-0 top-0 h-1.5"
          style={{ background: accentBg as string }}
          aria-hidden
        />

        {/* Photo — tied to contact visibility for consistency with other templates */}
        {photoUrl && isVisible(cv, "contact") && (
          <div className="mb-7 flex justify-center">
            <div
              className="rounded-full p-[3px]"
              style={{ background: accentBg as string }}
            >
              <div className="h-32 w-32 overflow-hidden rounded-full border-[3px] border-paper/10">
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        )}

        {isVisible(cv, "contact") && contactRows.length > 0 && (
          <section className="mb-7">
            <SideH icon={User}>Contact</SideH>
            <ul className="space-y-2.5">
              {contactRows.map(([Icon, v], i) => (
                <li key={i} className="flex items-start gap-2.5 text-[11.5px] leading-snug text-paper/90">
                  <Icon className="mt-[2px] h-3 w-3 shrink-0" style={{ color: accentBg as string }} strokeWidth={2.2} />
                  <span className="break-words">{v as string}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isVisible(cv, "skills") && cv.skills.length > 0 && (
          <section className="mb-7">
            <SideH icon={Sparkles}>Skills</SideH>
            <ul className="space-y-2.5">
              {cv.skills.map((s, i) => {
                // Visual variety: alternate "Expert / Advanced / Proficient" bar widths
                const widths = [92, 88, 96, 84, 90, 86, 94, 82, 88, 90];
                return (
                  <li key={`${s}-${i}`}>
                    <div className="mb-1 flex items-center justify-between text-[11.5px] text-paper">
                      <span className="font-medium">{s}</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-paper/15">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${widths[i % widths.length]}%`, background: accentBg as string }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {isVisible(cv, "languages") && cv.languages.length > 0 && (
          <section className="mb-7">
            <SideH icon={LanguagesIcon}>Languages</SideH>
            <ul className="space-y-2">
              {cv.languages.map((l) => {
                const lvl = (l.level || "").toLowerCase();
                const filled =
                  lvl.includes("native") ? 5 :
                  lvl.includes("fluent") ? 5 :
                  lvl.includes("professional") ? 4 :
                  lvl.includes("conversational") ? 3 :
                  lvl.includes("basic") ? 2 : 4;
                return (
                  <li key={l.id} className="flex items-center justify-between gap-2 text-[12px] text-paper">
                    <div>
                      <span className="font-semibold">{l.name}</span>
                      {l.level && (
                        <span className="ml-1 text-[10.5px] text-paper/65">{l.level}</span>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: i < filled ? (accentBg as string) : "rgba(255,255,255,0.18)" }}
                        />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {isVisible(cv, "education") && cv.education.length > 0 && (
          <section>
            <SideH icon={GraduationCap}>Education</SideH>
            <ul className="space-y-3">
              {cv.education.map((ed) => (
                <li key={ed.id} className="text-[11.5px] leading-snug">
                  <p className="font-semibold text-paper">{ed.qualification}</p>
                  <p className="text-paper/80">{ed.institution}</p>
                  {ed.period && <p className="mt-0.5 text-[10.5px] text-paper/55">{ed.period}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      {/* ───── Main column ───── */}
      <main className="relative flex-1 px-10 pt-10 pb-12">
        {/* Decorative corner accent */}
        <span
          className="absolute right-0 top-0 h-20 w-20"
          style={{
            background: `linear-gradient(135deg, transparent 50%, ${accentBg} 50%)`,
            opacity: 0.18,
          }}
          aria-hidden
        />

        <header className="mb-6 relative">
          <h1 className="font-syne text-[40px] font-bold leading-[1.02] tracking-[-0.02em] text-ink">
            {cv.contact.name || "Your name"}
          </h1>
          {cv.contact.jobTitle && (
            <div className="mt-2 inline-flex items-center gap-2">
              <span
                className="h-[3px] w-8 rounded-full"
                style={{ background: accentBg as string }}
              />
              <p className="font-dm text-[13px] font-semibold uppercase tracking-[0.22em]" style={{ color: accentBg as string }}>
                {cv.contact.jobTitle}
              </p>
            </div>
          )}
        </header>

        {isVisible(cv, "summary") && cv.summary && (
          <section className="mb-7">
            <MainH icon={User}>Profile</MainH>
            <p className="text-[13px] leading-[1.7] text-ink/85">{cv.summary}</p>
          </section>
        )}

        {isVisible(cv, "experience") && cv.experience.length > 0 && (
          <section className="mb-7">
            <MainH icon={Briefcase}>Experience</MainH>
            <div className="relative space-y-5 pl-5">
              <span
                className="absolute left-[5px] top-2 bottom-2 w-px"
                style={{ background: "rgba(0,0,0,0.12)" }}
                aria-hidden
              />
              {cv.experience.map((exp) => (
                <article key={exp.id} className="relative">
                  <span
                    className="absolute -left-[18px] top-[7px] h-2.5 w-2.5 rounded-full ring-2 ring-paper"
                    style={{ background: accentBg as string }}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[14.5px] font-bold text-ink">{exp.role}</p>
                    <p
                      className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold text-paper"
                      style={{ background: accentBg as string }}
                    >
                      {[exp.startDate, exp.endDate].filter(Boolean).join(" – ") || exp.period}
                    </p>
                  </div>
                  <p className="mb-2 text-[12.5px] font-semibold text-ink/70">
                    {[exp.company, exp.location].filter(Boolean).join(" · ")}
                  </p>
                  {visibleBullets(exp).length > 0 && (
                    <ul className="space-y-1.5">
                      {visibleBullets(exp).map((b) => (
                        <li
                          key={b.id}
                          className="relative pl-4 text-[12.5px] leading-[1.6] text-ink/85"
                        >
                          <span
                            className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full"
                            style={{ background: accentBg as string }}
                          />
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

        {isVisible(cv, "achievements") && cv.achievements.length > 0 && (
          <section>
            <MainH icon={Award}>Achievements</MainH>
            <ul className="space-y-1.5">
              {cv.achievements.map((a, i) => (
                <li key={i} className="relative pl-4 text-[12.5px] leading-[1.6] text-ink/85">
                  <Award
                    className="absolute left-0 top-[3px] h-3 w-3"
                    style={{ color: accentBg as string }}
                  />
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
