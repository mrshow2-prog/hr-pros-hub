import SEO from "@/components/seo/SEO";
import type { ProfileContent } from "@/hooks/useProfileContent";

interface Props {
  profile: ProfileContent;
}

export default function ChefMKhalilPage({ profile }: Props) {
  const c = profile.content || {};
  const achievements: string[] = Array.isArray(c.achievements) ? c.achievements : [];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.name,
    jobTitle: c.headline,
    address: { "@type": "PostalAddress", addressLocality: c.location },
    email: c.contact_email || undefined,
    telephone: c.contact_phone || undefined,
    sameAs: c.linkedin_url ? [c.linkedin_url] : undefined,
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#2c2018] font-serif">
      <SEO
        title={profile.seo_title}
        description={profile.seo_description}
        path={`/${profile.slug}`}
        image={profile.og_image_url ?? undefined}
        jsonLd={[personSchema]}
      />

      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        {c.photo_url && (
          <img
            src={c.photo_url}
            alt={c.name}
            className="w-40 h-40 rounded-full object-cover mx-auto mb-8 border-4 border-[#9b7240]/30 shadow-lg"
          />
        )}
        <p className="uppercase tracking-[0.3em] text-xs text-[#9b7240] mb-4 font-sans">
          {c.location}
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
          {c.name}
        </h1>
        <p className="text-xl md:text-2xl italic text-[#5a4a3c]">{c.headline}</p>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-lg leading-relaxed whitespace-pre-line">{c.bio}</p>
      </section>

      {achievements.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl mb-8 text-center" style={{ fontFamily: "Playfair Display, Georgia, serif" }}>
            Highlights
          </h2>
          <ul className="space-y-4">
            {achievements.map((a, i) => (
              <li key={i} className="border-l-2 border-[#9b7240] pl-6 py-2">
                {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="max-w-3xl mx-auto px-6 py-16 text-center border-t border-[#9b7240]/20 mt-12">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {c.contact_email && (
            <a href={`mailto:${c.contact_email}`} className="text-[#9b7240] hover:underline">
              {c.contact_email}
            </a>
          )}
          {c.contact_phone && <span className="text-[#5a4a3c]">{c.contact_phone}</span>}
          {c.linkedin_url && (
            <a href={c.linkedin_url} target="_blank" rel="noopener" className="text-[#9b7240] hover:underline">
              LinkedIn
            </a>
          )}
          {c.cv_url && (
            <a href={c.cv_url} target="_blank" rel="noopener" className="text-[#9b7240] hover:underline">
              Download CV
            </a>
          )}
        </div>
        <p className="mt-8 text-xs uppercase tracking-[0.3em] text-[#9a8678] font-sans">
          Profile by people·STUDIO
        </p>
      </footer>
    </div>
  );
}
