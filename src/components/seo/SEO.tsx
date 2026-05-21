import { Helmet } from "react-helmet-async";

// TODO: update when custom domain is connected.
const BASE_URL = "https://www.peoplestudiohr.com";
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
  email: "bmesiha@PeopleStudioHR.com",
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
  titleAr?: string;
  descriptionAr?: string;
  ogTitleAr?: string;
  ogDescriptionAr?: string;
}

const PROFILE_OR_ADMIN = [/^\/admin(\/|$)/, /^\/bishoy-mesiha(\/|$)/, /^\/chef-m-khalil(\/|$)/];

function isLangNeutral(path: string) {
  return PROFILE_OR_ADMIN.some((re) => re.test(path));
}

export default function SEO({ title, description, path, image, jsonLd, ogTitle, ogDescription, titleAr, descriptionAr, ogTitleAr, ogDescriptionAr }: SEOProps) {
  const isArabic = typeof window !== "undefined" && (window.location.pathname === "/ar" || window.location.pathname.startsWith("/ar/"));
  const lang: "en" | "ar" = isArabic ? "ar" : "en";
  const arPath = !isLangNeutral(path) && !path.startsWith("/ar")
    ? (path === "/" ? "/ar" : `/ar${path}`)
    : path;
  const finalPath = lang === "ar" ? arPath : path;
  const url = `${BASE_URL}${finalPath}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const schemas = [LOCAL_BUSINESS_SCHEMA, ...(jsonLd ?? [])];
  const finalTitle = lang === "ar" && titleAr ? titleAr : title;
  const finalDescription = lang === "ar" && descriptionAr ? descriptionAr : description;
  const finalOgTitle = lang === "ar" && ogTitleAr ? ogTitleAr : (ogTitle ?? finalTitle);
  const finalOgDescription = lang === "ar" && ogDescriptionAr ? ogDescriptionAr : (ogDescription ?? finalDescription);
  return (
    <Helmet htmlAttributes={{ lang, dir: lang === "ar" ? "rtl" : "ltr" }}>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="People.Studio" />
      <meta property="og:locale" content={lang === "ar" ? "ar_AE" : "en_AE"} />
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
