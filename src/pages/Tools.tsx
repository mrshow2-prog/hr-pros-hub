import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ToolsNav from "@/components/tools/ToolsNav";
import HRDiagnostic from "@/components/tools/HRDiagnostic";
import EmiratesCalculator from "@/components/tools/EmiratesCalculator";
import PolicyGenerator from "@/components/tools/PolicyGenerator";
import JDBuilder from "@/components/tools/JDBuilder";
import BookCallBanner from "@/components/ui/BookCallBanner";
import SiteFooter from "@/components/ui/SiteFooter";
import SEO from "@/components/seo/SEO";
import { T, pick, useLang } from "@/i18n/T";

const tabs = [
  { id: "diagnostic", label: { en: "HR Diagnostic", ar: "تشخيص الموارد البشرية" } },
  { id: "calculator", label: { en: "Emiratisation Calculator", ar: "حاسبة التوطين" } },
  { id: "policy", label: { en: "Policy Generator", ar: "مُولّد السياسات" } },
  { id: "jd", label: { en: "JD Builder", ar: "منشئ الوصف الوظيفي" } },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Tools() {
  const [activeTab, setActiveTab] = useState<TabId>("diagnostic");
  const lang = useLang();
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.replace("#", "") as TabId;
    if (tabs.some((t) => t.id === id)) {
      setActiveTab(id);
      // scroll to tabs after mount
      requestAnimationFrame(() => {
        document.getElementById("tools-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-paper font-dm text-ink">
      <SEO
        title="Free HR Tools UAE · Diagnostic, Emiratisation Calculator & Policy Generator — People.Studio"
        description="Free UAE HR tools — no signup required. HR health diagnostic, Emiratisation fine calculator, AI policy generator, and JD builder. Built for UAE and GCC businesses."
        path="/tools"
      />
      <ToolsNav />

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-10 pt-16 md:px-10 md:pb-12 md:pt-20">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 font-dm text-[0.68rem] font-bold uppercase tracking-widest2 text-sienna before:h-px before:w-5 before:bg-sienna">
              <T en="Free tools — no signup required" ar="أدوات مجانية — لا يلزم التسجيل" />
            </div>
            <h1 className="mb-5 font-serif text-5xl font-normal leading-[1.04] text-ink md:text-6xl">
              <T en={<>Use these.<br />No strings attached.</>} ar={<>استخدمها.<br />دون أي شروط.</>} />
            </h1>
            <p className="max-w-2xl font-dm text-base font-light leading-8 text-ink/60">
              <T
                en="Four practical HR tools for UAE and GCC business owners: a full HR diagnostic, Emiratisation calculator, starter policy generator, and job description builder."
                ar="أربع أدوات موارد بشرية عملية لأصحاب الأعمال في الإمارات والخليج: تشخيص شامل للموارد البشرية، وحاسبة توطين، ومُولّد سياسات للبدء، ومنشئ أوصاف وظيفية."
              />
            </p>
          </div>
        </section>

        <div id="tools-tabs" className="border-b border-ink/10 px-5 md:px-10 scroll-mt-24">
          <div className="no-scrollbar mx-auto flex max-w-5xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mb-[-1px] flex-shrink-0 border-b-2 px-5 py-4 font-dm text-[0.72rem] font-bold uppercase tracking-wider2 transition-colors ${
                  activeTab === tab.id
                    ? "border-sienna text-sienna"
                    : "border-transparent text-ink/40 hover:text-ink/75"
                }`}
              >
                {pick(tab.label, lang)}
              </button>
            ))}
          </div>
        </div>

        <section className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
          {activeTab === "diagnostic" && <HRDiagnostic />}
          {activeTab === "calculator" && <EmiratesCalculator />}
          {activeTab === "policy" && <PolicyGenerator />}
          {activeTab === "jd" && <JDBuilder />}
        </section>
      </main>

      <BookCallBanner />
      <SiteFooter />

    </div>
  );
}
