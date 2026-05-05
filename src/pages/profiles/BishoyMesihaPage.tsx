import SEO from "@/components/seo/SEO";
import type { ProfileContent } from "@/hooks/useProfileContent";

interface Props {
  profile: ProfileContent;
}

export default function BishoyMesihaPage({ profile }: Props) {
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
    <div className="min-h-screen bg-[#0f0e0c] text-[#e8e4dc]">
      <SEO
        title={profile.seo_title}
        description={profile.seo_description}
        path={`/${profile.slug}`}
        image={profile.og_image_url ?? undefined}
        jsonLd={[personSchema]}
      />

      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-[1fr_2fr] gap-12 items-start">
        <div>
          {c.photo_url && (
            <img
              src={c.photo_url}
              alt={c.name}
              className="w-full aspect-square object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          )}
          <div className="mt-6 space-y-2 text-sm font-mono">
            {c.contact_email && (
              <a href={`mailto:${c.contact_email}`} className="block text-[#c9a84c] hover:underline break-all">
                {c.contact_email}
              </a>
            )}
            {c.contact_phone && <p className="text-[#a8a29a]">{c.contact_phone}</p>}
            {c.linkedin_url && (
              <a href={c.linkedin_url} target="_blank" rel="noopener" className="block text-[#c9a84c] hover:underline">
                LinkedIn →
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="uppercase tracking-[0.3em] text-xs text-[#c9a84c] mb-4 font-mono">
            {c.location}
          </p>
          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            {c.name}
          </h1>
          <p
            className="text-2xl md:text-3xl italic text-[#c9a84c] mb-10"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            {c.headline}
          </p>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-line text-[#c8c4bc]">{c.bio}</p>
          </div>

          {achievements.length > 0 && (
            <div className="mt-12">
              <h2 className="uppercase tracking-[0.3em] text-xs text-[#c9a84c] mb-6 font-mono">
                Highlights
              </h2>
              <ul className="space-y-3">
                {achievements.map((a, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-[#c9a84c] font-mono text-sm mt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[#c8c4bc]">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-[#c9a84c]/20 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#a8a29a] font-mono">
          Profile by people·STUDIO
        </p>
      </footer>
    </div>
  );
}
