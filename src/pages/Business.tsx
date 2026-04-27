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

export default function Business() {
  return (
    <div className="font-dm bg-paper text-ink">
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
