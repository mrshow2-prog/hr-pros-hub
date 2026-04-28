import { Helmet } from "react-helmet-async";

// TODO: update when custom domain is connected.
const BASE_URL = "https://people-studio.lovable.app";

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
  jsonLd?: object[];
}

export default function SEO({ title, description, path, jsonLd }: SEOProps) {
  const url = `${BASE_URL}${path}`;
  const schemas = [LOCAL_BUSINESS_SCHEMA, ...(jsonLd ?? [])];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
