import { useEffect, useRef, useState, useCallback } from "react";
import SEO from "@/components/seo/SEO";
import type { ProfileContent } from "@/hooks/useProfileContent";
import "./chef-m-khalil/theme.css";

interface Props { profile: ProfileContent; }

type LBItem = { src: string; cap: string };

export default function ChefMKhalilPage({ profile }: Props) {
  const c: any = profile.content || {};
  const rootRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [lb, setLb] = useState<{ items: LBItem[]; idx: number } | null>(null);

  // Fade-in observer + bar fills
  useEffect(() => {
    if (!rootRef.current) return;
    const els = rootRef.current.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            e.target.querySelectorAll<HTMLElement>(".bar-fill").forEach((b) => {
              const w = b.dataset.w;
              if (w) b.style.width = w + "%";
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [profile.id]);

  // Scroll handlers
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 70);
      if (heroBgRef.current && window.scrollY < window.innerHeight) {
        heroBgRef.current.style.transform = `scale(1.08) translateY(${window.scrollY * 0.28}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lightbox keyboard
  useEffect(() => {
    if (!lb) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      if (e.key === "ArrowLeft") setLb((s) => s && { ...s, idx: (s.idx - 1 + s.items.length) % s.items.length });
      if (e.key === "ArrowRight") setLb((s) => s && { ...s, idx: (s.idx + 1) % s.items.length });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lb]);

  const openLB = useCallback((items: LBItem[], idx: number) => setLb({ items, idx }), []);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${c.hero?.name_first ?? ""} ${c.hero?.name_last ?? ""}`.trim(),
    jobTitle: c.hero?.tagline,
    address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    email: c.contact?.email,
    telephone: c.contact?.phone,
  };

  const hero = c.hero || {};
  const nav = c.nav || {};
  const about = c.about || {};
  const specialties = c.specialties || {};
  const exp = c.experience || {};
  const dishes = c.dishes || {};
  const photos = c.photos || {};
  const awards = c.awards || {};
  const certs = c.certificates || {};
  const skills = c.skills || {};
  const edu = c.education || {};
  const contact = c.contact || {};
  const footer = c.footer || {};
  const stripStats = c.stats_strip || [];

  return (
    <div ref={rootRef} className="chef-mk-page">
      <SEO
        title={profile.seo_title}
        description={profile.seo_description}
        path={`/${profile.slug}`}
        image={profile.og_image_url ?? undefined}
        jsonLd={[personSchema]}
      />

      {/* NAV */}
      <nav id="navbar" className={scrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <div className="nav-logo">{nav.logo_first} <em>{nav.logo_em}</em></div>
          <ul className={`nav-links${navOpen ? " open" : ""}`}>
            {(nav.links || []).map((l: any, i: number) => (
              <li key={i}>
                <a href={l.href} onClick={() => setNavOpen(false)}>{l.label}</a>
              </li>
            ))}
            {nav.cta && (
              <li>
                <a href={nav.cta.href} className="nav-cta" onClick={() => setNavOpen(false)}>{nav.cta.label}</a>
              </li>
            )}
          </ul>
          <button className="hamburger" aria-label="Menu" onClick={() => setNavOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div ref={heroBgRef} className="hero-bg" style={{ backgroundImage: hero.background_image ? `url(${hero.background_image})` : undefined }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          {hero.eyebrow && <div className="hero-eyebrow fade-in">{hero.eyebrow}</div>}
          {(hero.name_first || hero.name_last) && (
            <h1 className="hero-name fade-in delay-1">
              {hero.name_first}<br /><em>{hero.name_last}</em>
            </h1>
          )}
          {hero.tagline && <p className="hero-tagline fade-in delay-2">{hero.tagline}</p>}
          {hero.ctas?.length > 0 && (
            <div className="hero-actions fade-in delay-3">
              {hero.ctas.map((cta: any, i: number) => (
                <a key={i} href={cta.href} className={`btn ${cta.style === "outline" ? "btn-outline" : "btn-primary"}`}>
                  {cta.label}
                </a>
              ))}
            </div>
          )}
          {hero.stats?.length > 0 && (
            <div className="hero-stats-row fade-in delay-4">
              {hero.stats.map((s: any, i: number) => (
                <div key={i} className="hero-stat">
                  <div className="hero-stat-num">{s.num}{s.sup && <sup>{s.sup}</sup>}</div>
                  <div className="hero-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="scroll-hint"><span>Explore</span><div className="scroll-line" /></div>
      </section>

      {/* ABOUT */}
      {about.title && (
        <section id="about">
          <div className="container">
            <div className="about-grid">
              <div className="about-image-wrap fade-in">
                {about.portrait_url && <img src={about.portrait_url} alt={`${hero.name_first} ${hero.name_last}`} className="about-img" />}
                <div className="about-img-frame" />
                {about.quote && <div className="about-quote">"{about.quote}"</div>}
              </div>
              <div className="about-text fade-in delay-2">
                <span className="section-label">{about.eyebrow}</span>
                <h2 className="section-title">{about.title}</h2>
                <div className="section-divider" />
                {(about.paragraphs || []).map((p: string, i: number) => <p key={i}>{p}</p>)}
                {about.highlights?.length > 0 && (
                  <div className="about-highlights">
                    {about.highlights.map((h: any, i: number) => (
                      <div className="highlight" key={i}>
                        <div className="highlight-lbl">{h.label}</div>
                        <div className="highlight-val">{h.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STATS STRIP */}
      {stripStats.length > 0 && (
        <div className="stats-strip">
          <div className="container">
            {stripStats.map((s: any, i: number) => (
              <div key={i} className={`stat-item fade-in delay-${i}`}>
                <div className="stat-num">{s.num}{s.sup && <span>{s.sup}</span>}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPECIALTIES */}
      {specialties.items?.length > 0 && (
        <section id="specialties">
          <div className="container">
            <span className="section-label fade-in">{specialties.eyebrow}</span>
            <h2 className="section-title fade-in">{specialties.title}</h2>
            <div className="section-divider" />
            <div className="specialties-grid">
              {specialties.items.map((s: any, i: number) => (
                <div key={i} className={`specialty-card fade-in delay-${Math.min(i,4)}`}>
                  <div className="specialty-emoji">{s.emoji}</div>
                  <div className="specialty-name">{s.name}</div>
                  <div className="specialty-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCE */}
      {exp.items?.length > 0 && (
        <section id="experience">
          <div className="container">
            <span className="section-label fade-in">{exp.eyebrow}</span>
            <h2 className="section-title fade-in">{exp.title}</h2>
            <div className="section-divider" />
            <div className="timeline">
              {exp.items.map((it: any, i: number) => (
                <div className="tl-item fade-in" key={i}>
                  <div className="tl-dot"><div className="tl-dot-inner" /></div>
                  <div className="tl-content">
                    <div className="tl-period">{it.period}</div>
                    <div className="tl-role">{it.role}</div>
                    <div className="tl-hotel">{it.hotel}</div>
                    <div className="tl-desc">{it.desc}</div>
                    {it.tags?.length > 0 && (
                      <div className="tl-tags">
                        {it.tags.map((t: string, j: number) => <span className="tag" key={j}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DISHES */}
      {dishes.items?.length > 0 && (
        <section id="gallery">
          <div className="container">
            <span className="section-label fade-in">{dishes.eyebrow}</span>
            <h2 className="section-title fade-in">{dishes.title}</h2>
            <div className="section-divider" />
            <div className="gallery-grid">
              {dishes.items.map((d: any, i: number) => (
                <div
                  key={i}
                  className="gallery-item fade-in"
                  style={{ transitionDelay: `${(i % 4) * 0.07}s` }}
                  onClick={() => openLB(dishes.items.map((x: any) => ({ src: x.url, cap: x.name })), i)}
                >
                  <img src={d.url} alt={d.name} loading="lazy" />
                  <div className="gallery-overlay"><div className="gallery-dish-name">{d.name}</div></div>
                  <div className="gallery-plus">+</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PHOTOS */}
      {photos.items?.length > 0 && (
        <section id="chef-photos">
          <div className="container">
            <span className="section-label fade-in">{photos.eyebrow}</span>
            <h2 className="section-title fade-in">{photos.title}</h2>
            <div className="section-divider" />
            <div className="photos-masonry">
              {photos.items.map((p: any, i: number) => (
                <div
                  key={i}
                  className={`photo-item fade-in${p.tall ? " tall" : ""}${p.wide ? " wide" : ""}`}
                  style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
                  onClick={() => openLB(photos.items.map((x: any) => ({ src: x.url, cap: `${hero.name_first ?? ""} ${hero.name_last ?? ""}`.trim() })), i)}
                >
                  <img src={p.url} alt="" loading="lazy" />
                  <div className="photo-overlay"><div className="photo-expand">⊕</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AWARDS */}
      {awards.items?.length > 0 && (
        <section id="awards">
          <div className="container">
            <span className="section-label fade-in">{awards.eyebrow}</span>
            <h2 className="section-title fade-in">{awards.title}</h2>
            <div className="section-divider" />
            <div className="awards-grid">
              {awards.items.map((a: any, i: number) => (
                <div key={i} className={`award-card fade-in${a.featured ? " guinness" : ""} delay-${i % 3}`}>
                  <div className="award-icon">{a.icon}</div>
                  <div>
                    <div className="award-year">{a.year}</div>
                    <div className="award-title">{a.title}</div>
                    <div className="award-desc" dangerouslySetInnerHTML={{ __html: a.desc }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CERTIFICATES */}
      {certs.items?.length > 0 && (
        <section id="certifications">
          <div className="container">
            <span className="section-label fade-in">{certs.eyebrow}</span>
            <h2 className="section-title fade-in">{certs.title}</h2>
            <div className="section-divider" />
            <div className="cert-grid">
              {certs.items.map((cert: any, i: number) => (
                <div
                  key={i}
                  className="cert-item fade-in"
                  style={{ transitionDelay: `${(i % 4) * 0.08}s` }}
                  onClick={() => openLB(certs.items.map((x: any) => ({ src: x.url, cap: x.name })), i)}
                >
                  <div className="cert-thumb">
                    <img src={cert.url} alt={cert.name} loading="lazy" />
                    <div className="cert-thumb-hover"><div className="cert-expand-btn">🔍</div></div>
                  </div>
                  <div className="cert-footer">
                    <div className="cert-name">{cert.name}</div>
                    <span className="cert-badge">Certificate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS */}
      {skills.groups?.length > 0 && (
        <section id="skills">
          <div className="container">
            <span className="section-label fade-in">{skills.eyebrow}</span>
            <h2 className="section-title fade-in">{skills.title}</h2>
            <div className="section-divider" />
            <div className="skills-grid">
              {skills.groups.map((g: any, i: number) => (
                <div key={i} className={`skills-group fade-in delay-${i}`}>
                  <h3>{g.name}</h3>
                  {g.type === "tags" ? (
                    <div className="soft-tags">
                      {g.items.map((t: string, j: number) => <span className="soft-tag" key={j}>{t}</span>)}
                    </div>
                  ) : (
                    g.items.map((it: any, j: number) => (
                      <div className="bar-item" key={j}>
                        <div className="bar-label">{it.label}</div>
                        <div className="bar-track"><div className="bar-fill" data-w={String(it.level)} /></div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      {(edu.degrees?.length || edu.certifications?.length) && (
        <section id="education">
          <div className="container">
            <span className="section-label fade-in">{edu.eyebrow}</span>
            <h2 className="section-title fade-in">{edu.title}</h2>
            <div className="section-divider" />
            <div className="edu-grid">
              <div className="edu-group fade-in">
                {edu.degrees?.length > 0 && <h3>Academic Degrees</h3>}
                {(edu.degrees || []).map((d: any, i: number) => (
                  <div className="edu-item" key={i}>
                    <div className="edu-year">{d.year}</div>
                    <div>
                      <div className="edu-degree">{d.degree}</div>
                      <div className="edu-school">{d.school}</div>
                    </div>
                  </div>
                ))}
                {edu.reference && (
                  <>
                    <h3 style={{ marginTop: "2.5rem" }}>Professional Reference</h3>
                    <div className="edu-item">
                      <div className="edu-year">REF</div>
                      <div>
                        <div className="edu-degree">{edu.reference.name}</div>
                        <div className="edu-school">
                          {edu.reference.role}<br />
                          {edu.reference.phone && <a href={`tel:${edu.reference.phone.replace(/\s/g, "")}`}>{edu.reference.phone}</a>}<br />
                          {edu.reference.email && <a href={`mailto:${edu.reference.email}`}>{edu.reference.email}</a>}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="edu-group fade-in delay-2">
                {edu.certifications?.length > 0 && <h3>Professional Certifications</h3>}
                {(edu.certifications || []).map((cert: any, i: number) => (
                  <div className="cert-list-row" key={i}>
                    <div className="cert-dot" />
                    <div className="cert-row-name">{cert.name}</div>
                    <div className="cert-row-year">{cert.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      {contact.email && (
        <section id="contact">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-info fade-in">
                <span className="section-label">{contact.eyebrow}</span>
                <h3>{contact.title}</h3>
                <div className="section-divider" />
                <p>{contact.intro}</p>
                {contact.phone && (
                  <div className="contact-row">
                    <div className="contact-icon-box">📞</div>
                    <div>
                      <div className="contact-lbl">Phone / WhatsApp</div>
                      <div className="contact-val"><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></div>
                    </div>
                  </div>
                )}
                <div className="contact-row">
                  <div className="contact-icon-box">✉️</div>
                  <div>
                    <div className="contact-lbl">Email</div>
                    <div className="contact-val"><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
                  </div>
                </div>
                {contact.location && (
                  <div className="contact-row">
                    <div className="contact-icon-box">📍</div>
                    <div>
                      <div className="contact-lbl">Based In</div>
                      <div className="contact-val">{contact.location}</div>
                    </div>
                  </div>
                )}
                {contact.nationality && (
                  <div className="contact-row">
                    <div className="contact-icon-box">🌐</div>
                    <div>
                      <div className="contact-lbl">Nationality</div>
                      <div className="contact-val">{contact.nationality}</div>
                    </div>
                  </div>
                )}
                {contact.cv_url && (
                  <div style={{ marginTop: "2rem" }}>
                    <a href={contact.cv_url} download className="btn btn-primary" style={{ gap: ".6rem" }}>⬇ Download Full CV (PDF)</a>
                  </div>
                )}
              </div>
              <div className="fade-in delay-2">
                <ContactForm contact={contact} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-logo">{footer.logo_first} <em>{footer.logo_em}</em></div>
          <div className="footer-rule" />
          <div className="footer-info">{footer.info}</div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {lb && (
        <div className="chef-mk-lightbox" onClick={(e) => { if (e.target === e.currentTarget) setLb(null); }}>
          <button className="lb-close" onClick={() => setLb(null)}>✕</button>
          <button className="lb-nav lb-prev" onClick={() => setLb((s) => s && { ...s, idx: (s.idx - 1 + s.items.length) % s.items.length })}>‹</button>
          <button className="lb-nav lb-next" onClick={() => setLb((s) => s && { ...s, idx: (s.idx + 1) % s.items.length })}>›</button>
          <img className="lb-img" src={lb.items[lb.idx].src} alt={lb.items[lb.idx].cap} />
          <div className="lb-counter">{lb.idx + 1} &nbsp;/&nbsp; {lb.items.length}</div>
          <div className="lb-caption">{lb.items[lb.idx].cap}</div>
        </div>
      )}
    </div>
  );
}

function ContactForm({ contact }: { contact: any }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        // Build mailto fallback so the form works without backend wiring
        const f = e.currentTarget;
        const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value || "";
        const subj = encodeURIComponent(`Inquiry from ${get("fname") || "website"}: ${get("ftype") || "General"}`);
        const body = encodeURIComponent(
          `Name: ${get("fname")}\nCompany: ${get("fcompany")}\nEmail: ${get("femail")}\nPhone: ${get("fphone")}\nType: ${get("ftype")}\n\n${get("fmessage")}`
        );
        window.location.href = `mailto:${contact.form_recipient || contact.email}?subject=${subj}&body=${body}`;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3500);
        f.reset();
      }}
    >
      <div className="fgroup"><label htmlFor="fname">Full Name</label><input name="fname" id="fname" type="text" placeholder="Your name" required /></div>
      <div className="fgroup"><label htmlFor="fcompany">Company / Property</label><input name="fcompany" id="fcompany" type="text" placeholder="Your organization" /></div>
      <div className="fgroup"><label htmlFor="femail">Email Address</label><input name="femail" id="femail" type="email" placeholder="your@email.com" required /></div>
      <div className="fgroup"><label htmlFor="fphone">Phone / WhatsApp</label><input name="fphone" id="fphone" type="tel" placeholder="+971 …" /></div>
      <div className="fgroup full">
        <label htmlFor="ftype">Inquiry Type</label>
        <select name="ftype" id="ftype" defaultValue="">
          <option value="">— Please select —</option>
          {(contact.inquiry_types || []).map((t: string, i: number) => <option key={i}>{t}</option>)}
        </select>
      </div>
      <div className="fgroup full"><label htmlFor="fmessage">Your Message</label><textarea name="fmessage" id="fmessage" placeholder="Tell about your project, event, or opportunity…" /></div>
      <div className="form-submit">
        <button type="submit" className="btn btn-primary" style={submitted ? { background: "#3d6b50" } : undefined}>
          {submitted ? "Message Sent ✓" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}
