import { useEffect, useMemo, useRef, useState } from "react";
import SEO from "@/components/seo/SEO";
import type { ProfileContent } from "@/hooks/useProfileContent";
import {
  HERO as DEFAULT_HERO, MARQUEE as DEFAULT_MARQUEE, ACHIEVEMENTS as DEFAULT_ACHIEVEMENTS,
  TESTIMONIALS as DEFAULT_TESTIMONIALS, PHILOSOPHY as DEFAULT_PHILOSOPHY,
  CONTACT as DEFAULT_CONTACT, EDUCATION as DEFAULT_EDUCATION,
  SPECIALTIES as DEFAULT_SPECIALTIES, type Specialty,
} from "./bishoy-mesiha/data";
import "./bishoy-mesiha/theme.css";
import bishoyPhoto from "@/assets/bishoy-mesiha.jpg";
import { ProfileByPeopleStudioHeader, ProfileByPeopleStudioFooter } from "@/components/profiles/ProfileByPeopleStudio";

interface Props { profile: ProfileContent }

export default function BishoyMesihaPage({ profile }: Props) {
  const c: any = profile.content || {};
  const HERO = { ...DEFAULT_HERO, ...(c.hero || {}) };
  const MARQUEE: string[] = Array.isArray(c.marquee) && c.marquee.length ? c.marquee : DEFAULT_MARQUEE;
  const ACHIEVEMENTS = Array.isArray(c.achievements) && c.achievements.length ? c.achievements : DEFAULT_ACHIEVEMENTS;
  const TESTIMONIALS = Array.isArray(c.testimonials) && c.testimonials.length ? c.testimonials : DEFAULT_TESTIMONIALS;
  const PHILOSOPHY: string = typeof c.philosophy === "string" && c.philosophy ? c.philosophy : DEFAULT_PHILOSOPHY;
  const CONTACT = { ...DEFAULT_CONTACT, ...(c.contact || {}) };
  const EDUCATION = Array.isArray(c.education) && c.education.length ? c.education : DEFAULT_EDUCATION;
  const SPECIALTIES: Specialty[] = Array.isArray(c.specialties) && c.specialties.length ? c.specialties : DEFAULT_SPECIALTIES;
  const [activeId, setActiveId] = useState<string | null>(() =>
    typeof window !== "undefined" ? window.location.hash.replace("#", "") || null : null
  );

  // Sync with hash changes (browser back/forward)
  useEffect(() => {
    const onHash = () => setActiveId(window.location.hash.replace("#", "") || null);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const active = useMemo(
    () => SPECIALTIES.find((s) => s.id === activeId) ?? null,
    [activeId]
  );

  const openSpecialty = (id: string) => {
    history.pushState(null, "", `#${id}`);
    setActiveId(id);
    window.scrollTo(0, 0);
  };
  const goHome = () => {
    history.pushState(null, "", window.location.pathname);
    setActiveId(null);
    window.scrollTo(0, 0);
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${HERO.nameFirst} ${HERO.nameLast}`,
    jobTitle: "360° HR Leader",
    address: { "@type": "PostalAddress", addressLocality: CONTACT.location },
    email: CONTACT.email,
    telephone: CONTACT.phone,
    sameAs: [CONTACT.linkedin],
  };

  const rawPhoto = HERO.photo_url || (c as any)?.photo_url || "";
  // Ignore dev-only /src/* paths that don't exist in production builds.
  const photoUrl = rawPhoto && !rawPhoto.startsWith("/src/") ? rawPhoto : bishoyPhoto;
  const data = { HERO, MARQUEE, ACHIEVEMENTS, TESTIMONIALS, PHILOSOPHY, CONTACT, EDUCATION, SPECIALTIES };

  return (
    <div className="bm-root">
      <SEO
        title={active ? `${active.label.replace("\n", " ")} — ${HERO.nameFirst} ${HERO.nameLast}` : profile.seo_title}
        description={active ? active.summary : profile.seo_description}
        path={`/${profile.slug}${active ? `#${active.id}` : ""}`}
        image={profile.og_image_url ?? undefined}
        jsonLd={[personSchema]}
      />
      <div className="noise-overlay" />
      <ProfileByPeopleStudioHeader />
      {active ? (
        <SpecialtyView sp={active} photoUrl={photoUrl} onBack={goHome} data={data} />
      ) : (
        <Landing onSelect={openSpecialty} photoUrl={photoUrl} data={data} />
      )}
      <ProfileByPeopleStudioFooter />
    </div>
  );
}

type PageData = {
  HERO: any; MARQUEE: string[]; ACHIEVEMENTS: any[]; TESTIMONIALS: any[];
  PHILOSOPHY: string; CONTACT: any; EDUCATION: any[]; SPECIALTIES: Specialty[];
};

/* -------------------- LANDING -------------------- */

function Landing({ onSelect, photoUrl, data }: { onSelect: (id: string) => void; photoUrl: string; data: PageData }) {
  const { HERO, MARQUEE, ACHIEVEMENTS, TESTIMONIALS, PHILOSOPHY, CONTACT } = data;
  return (
    <>
      <section className="hero">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="hero-eyebrow">{HERO.eyebrow}</div>
        <div className="hero-photo-ring">
          {photoUrl ? <img src={photoUrl} alt={`${HERO.nameFirst} ${HERO.nameLast}`} /> : <span className="initials">BM</span>}
        </div>
        <h1 className="hero-name">
          {HERO.nameFirst}<br /><em>{HERO.nameLast}</em>
        </h1>
        <p className="hero-tagline">{HERO.tagline}</p>
        <p className="hero-hook" dangerouslySetInnerHTML={{ __html: HERO.hook.replace(/\n/g, "<br>") }} />
        <div className="hero-stats">
          {HERO.stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat-number">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="scroll-hint"><span>Explore my universe</span><div className="scroll-line" /></div>
      </section>

      <div className="award-marquee">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="marquee-item">{m}</span>
          ))}
        </div>
      </div>

      <Orbit onSelect={onSelect} photoUrl={photoUrl} data={data} />

      <section className="achievements-strip">
        <div className="achievements-grid">
          {ACHIEVEMENTS.map((a, i) => (
            <div key={i} className="achievement-card">
              <div className="achievement-number">{a.number}</div>
              <div className="achievement-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-label" style={{ textAlign: "center" }}>What People Say</div>
        <h2 className="section-title">Heard from Those<br />Who've Worked with Me</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card">
              <span className="testimonial-quote-mark">"</span>
              <p className="testimonial-text" dangerouslySetInnerHTML={{ __html: t.text }} />
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.author}</div>
                  <div className="testimonial-role">{t.role}</div>
                  <div className="testimonial-stars">★ ★ ★ ★ ★</div>
                </div>
              </div>
            </div>
          ))}
          <div className="testimonial-card" style={{ background: "rgba(201,168,76,.04)", borderColor: "rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 200 }}>
            <div>
              <div style={{ fontSize: 30, marginBottom: 10 }}>🔗</div>
              <div style={{ fontFamily: "Playfair Display,serif", fontSize: 17, color: "var(--cream)", marginBottom: 7 }}>See All Recommendations</div>
              <a href={CONTACT.linkedin} target="_blank" rel="noopener" style={{ fontFamily: "Space Mono,monospace", fontSize: 10, letterSpacing: 1, color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--gold)" }}>View on LinkedIn →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="philosophy-section">
        <div className="gold-divider" />
        <blockquote className="philosophy-quote" dangerouslySetInnerHTML={{ __html: PHILOSOPHY }} />
        <div className="philosophy-author">— {HERO.nameFirst} {HERO.nameLast}</div>
      </section>

      <div className="footer-cta">
        <h2>Let's build something remarkable.</h2>
        <p>Open to senior HR, People & Culture, and strategic transformation roles across MENAT and beyond.</p>
        <div className="contact-links">
          <a href={`mailto:${CONTACT.email}`} className="contact-link">📧 {CONTACT.email}</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener" className="contact-link">🔗 LinkedIn Profile</a>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="contact-link">📞 {CONTACT.phone}</a>
        </div>
      </div>
    </>
  );
}

/* -------------------- ORBIT -------------------- */

function Orbit({ onSelect, photoUrl, data }: { onSelect: (id: string) => void; photoUrl: string; data: PageData }) {
  const { HERO, SPECIALTIES } = data;
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const cx = size / 2, cy = size / 2, r = size * 0.42;

  return (
    <section className="orbit-section">
      <div className="section-label">The 360° Model</div>
      <h2 className="section-title">One Professional.<br />Eight Disciplines.</h2>
      <p className="section-subtitle">Click any specialty to explore a dedicated CV lens — crafted for how <em>you</em> hire.</p>
      <div className="orbit-container" ref={ref}>
        <div className="orbit-ring ring-3" />
        <div className="orbit-ring ring-2" />
        <div className="orbit-ring ring-1" />
        <div className="orbit-center">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="orbit-center-photo" />
          ) : (
            <div className="orbit-center-photo">BM</div>
          )}
          <div className="orbit-center-name">{HERO.nameFirst}<br />{HERO.nameLast}</div>
          <div className="orbit-center-title">360° HR LEADER</div>
        </div>
        {size > 0 && SPECIALTIES.map((sp) => {
          const rad = (sp.angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad);
          const dx = x - cx, dy = y - cy;
          const len = Math.sqrt(dx * dx + dy * dy) - 83;
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <div key={sp.id}>
              <div className="connector-line" style={{ width: `${len}px`, transform: `rotate(${ang}deg)`, top: `${cy}px`, left: `${cx}px`, marginTop: -0.5 }} />
              <div className="specialty-node" style={{ left: `${x}px`, top: `${y}px` }}>
                <button
                  className="node-circle"
                  style={{ borderColor: sp.color, color: sp.color }}
                  onClick={() => onSelect(sp.id)}
                  aria-label={sp.label.replace("\n", " ")}
                >
                  <div className="node-icon">{sp.icon}</div>
                  <div className="node-label">{sp.label}</div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="orbit-cta">
        <p>Each branch opens a full specialty profile</p>
        <strong>↑ Click any node to explore</strong>
      </div>
    </section>
  );
}

/* -------------------- SPECIALTY VIEW -------------------- */

function SpecialtyView({ sp, photoUrl, onBack, data }: { sp: Specialty; photoUrl: string; onBack: () => void; data: PageData }) {
  const { HERO, CONTACT, EDUCATION } = data;
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}#${sp.id}` : "";
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <>
      <div className="sp-mini-hero">
        <button className="sp-mini-back" onClick={onBack} aria-label="Back to full profile">←</button>
        {photoUrl && <img src={photoUrl} alt={`${HERO.nameFirst} ${HERO.nameLast}`} className="sp-mini-photo" />}
        <div className="sp-mini-id">
          <div className="sp-mini-name">{HERO.nameFirst} {HERO.nameLast}</div>
          <div className="sp-mini-tag">{HERO.tagline}</div>
        </div>
        <div className="sp-mini-contact">
          <a href={`mailto:${CONTACT.email}`} title={CONTACT.email}>✉ {CONTACT.email}</a>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>📞 {CONTACT.phone}</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener">in</a>
        </div>
      </div>
      <div className="sp-hero">
        <div className="sp-hero-bg" style={{ background: `linear-gradient(135deg,${sp.color} 0%,var(--ink) 70%)` }} />
        <div className="sp-hero-pattern" />
        <div className="sp-hero-content">
          <h1 className="sp-title" dangerouslySetInnerHTML={{ __html: `${sp.label.replace("\n", "<br>")} <span>— ${sp.tagline}</span>` }} />
          <p className="sp-summary">{sp.summary}</p>
        </div>
      </div>
      <div className="sp-body">
        <div className="sp-metrics">
          {sp.metrics.map((m, i) => (
            <div key={i} className="sp-metric">
              <span className="sp-metric-val">{m.val}</span>
              <span className="sp-metric-label">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="sp-section-heading">Core Competencies</div>
        <div className="skills-grid">{sp.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}</div>

        <div className="sp-section-heading">Full Experience Through This Lens</div>
        {sp.experience.map((e, i) => (
          <div key={i} className="exp-item">
            <div className="exp-meta">
              <div className="exp-company">{e.company}</div>
              <div className="exp-role">{e.role}</div>
              <div className="exp-period">{e.period}</div>
            </div>
            <div className="exp-content">
              <h4>{e.heading}</h4>
              <ul className="exp-bullets">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          </div>
        ))}

        <div className="sp-section-heading">Signature Projects</div>
        <div className="projects-grid">
          {sp.projects.map((p, i) => (
            <div key={i} className="project-card">
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
              <div className="project-result">→ {p.result}</div>
            </div>
          ))}
        </div>

        {sp.testimonials.length > 0 && (
          <>
            <div className="sp-section-heading">What Colleagues Say</div>
            {sp.testimonials.map((t, i) => (
              <div key={i} className="sp-testimonial">
                <div className="sp-testimonial-text">{t.text}</div>
                <div className="sp-testimonial-author">— {t.author}</div>
              </div>
            ))}
          </>
        )}

        <div className="sp-section-heading">Education & Credentials</div>
        <div className="education-block">
          {EDUCATION.map((e, i) => (
            <div key={i} className="edu-card">
              <div className="edu-degree">{e.degree}</div>
              <div className="edu-school">{e.school}</div>
              <div className="edu-year">{e.year}</div>
            </div>
          ))}
        </div>

        <div className="sp-share-bar">
          <div className="sp-share-text">
            <strong>Share this {sp.label.replace("\n", " ")} profile</strong><br />
            Direct link for employers looking for this specialty
          </div>
          <button className="sp-copy-btn" onClick={copy}>{copied ? "Copied!" : "Copy Link"}</button>
        </div>

        <div style={{ marginTop: 36, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontFamily: "Playfair Display,serif", fontSize: 20, color: "var(--cream)", marginBottom: 5 }}>Ready to connect?</div>
            <div style={{ fontSize: 12, color: "var(--mist)" }}>{CONTACT.phone} · {CONTACT.email} · {CONTACT.location}</div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <a href={`mailto:${CONTACT.email}`} style={{ fontFamily: "Space Mono,monospace", fontSize: 9.5, letterSpacing: 1, color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--gold)", paddingBottom: 2 }}>Email Me</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener" style={{ fontFamily: "Space Mono,monospace", fontSize: 9.5, letterSpacing: 1, color: "var(--gold)", textDecoration: "none", borderBottom: "1px solid var(--gold)", paddingBottom: 2 }}>LinkedIn</a>
            <button onClick={onBack} style={{ fontFamily: "Space Mono,monospace", fontSize: 9.5, letterSpacing: 1, color: "var(--mist)", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,.2)", paddingBottom: 2 }}>View Full Profile</button>
          </div>
        </div>
      </div>
    </>
  );
}
