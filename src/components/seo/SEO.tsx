import { Helmet } from "react-helmet-async";

// TODO: update when custom domain is connected.
const BASE_URL = "https://people-studio.lovable.app";
// TODO: replace with branded 1200×630 OG card
const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c1c94bce-cab3-4e13-9216-06ef8f51ff27";

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "People Studio",
  alternateName: "People.Studio",
  description:
    "Independent HR advisory and career coaching for UAE and GCC businesses and professionals.",
  url: BASE_URL,
  telephone: "+971581784948",
  email: "bmesiha@outlook.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  areaServed: ["UAE", "KSA", "Qatar", "Kuwait", "Bahrain"],
  founder: {
    "@type": "Person",
    name: "Bishoy Mesiha",
    jobTitle: "Senior HR Consultant",
    sameAs: "https://www.linkedin.com/in/bmesiha/",
  },
  priceRange: "AED 3,500–25,000",
};

export const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bishoy Mesiha",
  jobTitle: "Senior HR Consultant & Career Coach",
  worksFor: {
    "@type": "Organization",
    name: "People Studio",
  },
  knowsAbout: [
    "UAE Labour Law",
    "Emiratisation",
    "HR Advisory",
    "Career Coaching",
    "CV Writing",
    "LinkedIn Optimisation",
    "Organisation Design",
  ],
  areaServed: "UAE, GCC, MENAT",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object[];
  ogTitle?: string;
  ogDescription?: string;
}

export default function SEO({ title, description, path, image, jsonLd, ogTitle, ogDescription }: SEOProps) {
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const schemas = [LOCAL_BUSINESS_SCHEMA, ...(jsonLd ?? [])];
  const finalOgTitle = ogTitle ?? title;
  const finalOgDescription = ogDescription ?? description;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="People.Studio" />
      <meta property="og:locale" content="en_AE" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@peoplestudioae" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
