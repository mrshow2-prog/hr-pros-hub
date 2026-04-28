import BusinessNav from "@/components/business/BusinessNav";
import BusinessHero from "@/components/business/BusinessHero";
import BusinessMarquee from "@/components/business/BusinessMarquee";
import BusinessAudience from "@/components/business/BusinessAudience";
import BusinessDiagnostic from "@/components/business/BusinessDiagnostic";
import BusinessFreeToolsPromo from "@/components/business/BusinessFreeToolsPromo";
import BusinessServices from "@/components/business/BusinessServices";
import BusinessRetainers from "@/components/business/BusinessRetainers";
import BusinessAbout from "@/components/business/BusinessAbout";
import BusinessContact from "@/components/business/BusinessContact";
import BookCallBanner from "@/components/ui/BookCallBanner";
import SEO from "@/components/seo/SEO";

export default function Business() {
  return (
    <div className="font-dm bg-paper text-ink">
      <SEO
        title="HR Advisory UAE · Emiratisation, Compliance & Fractional HR — People.Studio"
        description="Senior HR advisory for UAE SMEs. Emiratisation compliance, HR foundation packs, org design, and fractional HR director retainers. Fixed fees. Direct access to Bishoy Mesiha."
        path="/business"
      />
      <BusinessNav />
      <BusinessHero />
      <BusinessMarquee />
      <BusinessAudience />
      <BusinessDiagnostic />
      <BusinessFreeToolsPromo />
      <BusinessServices />
      <BusinessRetainers />
      <BusinessAbout />
      <BookCallBanner dark />
      <BusinessContact />
    </div>
  );
}
