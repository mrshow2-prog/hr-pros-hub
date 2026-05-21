import BusinessNav from "@/components/business/BusinessNav";
import BusinessHero from "@/components/business/BusinessHero";
import BusinessMarquee from "@/components/business/BusinessMarquee";
import BusinessAudience from "@/components/business/BusinessAudience";
import BusinessDiagnostic from "@/components/business/BusinessDiagnostic";
import BusinessFreeToolsPromo from "@/components/business/BusinessFreeToolsPromo";
import BusinessServices from "@/components/business/BusinessServices";
import BusinessRealCost from "@/components/business/BusinessRealCost";
import BusinessRetainers from "@/components/business/BusinessRetainers";
import BusinessAbout from "@/components/business/BusinessAbout";
import BusinessContact from "@/components/business/BusinessContact";
import BookCallBanner from "@/components/ui/BookCallBanner";
import SiteFooter from "@/components/ui/SiteFooter";
import SEO, { PERSON_SCHEMA } from "@/components/seo/SEO";

export default function Business() {
  return (
    <div className="font-dm bg-paper text-ink">
      <SEO
        title="HR Advisory UAE · Fractional HR · People.Studio"
        description="Senior HR advisory for UAE SMEs. Emiratisation, HR foundation, org design, and fractional HR director retainers. Fixed fees."
        path="/business"
        jsonLd={[PERSON_SCHEMA]}
      />
      <BusinessNav />
      <BusinessHero />
      <BusinessMarquee />
      <BusinessAudience />
      <BusinessDiagnostic />
      <BusinessFreeToolsPromo />
      <BusinessServices />
      <BusinessRealCost />
      <BusinessRetainers />
      <BusinessAbout />
      <BookCallBanner dark />
      <BusinessContact />
      <SiteFooter />

    </div>
  );
}
