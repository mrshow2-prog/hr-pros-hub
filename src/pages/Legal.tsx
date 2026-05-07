import { Link } from "react-router-dom";
import PsLogo from "@/components/ui/PsLogo";
import SiteFooter from "@/components/ui/SiteFooter";
import SEO from "@/components/seo/SEO";
import { COMPANY_EMAIL } from "@/lib/contact";
import { T, pick, useLang } from "@/i18n/T";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

const LAST_UPDATED = { en: "2 May 2026", ar: "2 مايو 2026" };

const sections = [
  { id: "privacy", label: { en: "Privacy Policy", ar: "سياسة الخصوصية" } },
  { id: "terms", label: { en: "Terms of Service", ar: "شروط الخدمة" } },
  { id: "disclaimer", label: { en: "Disclaimer", ar: "إخلاء المسؤولية" } },
] as const;

export default function Legal() {
  const lang = useLang();
  const { localize } = useLocalizedPath();
  return (
    <div className="min-h-screen bg-paper font-dm text-ink">
      <SEO
        title="Legal & Privacy — People.Studio"
        description="Privacy policy, terms of service, and disclaimer for People.Studio — independent HR advisory and career coaching, Dubai UAE."
        path="/legal"
      />

      <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <PsLogo size="lg" />
        <nav
          aria-label="Utility"
          className="flex items-center gap-5 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/55 md:gap-6"
        >
          <Link to={localize("/")} className="transition-colors hover:text-ink"><T en="Home" ar="الرئيسية" /></Link>
          <a href={`mailto:${COMPANY_EMAIL}`} className="transition-colors hover:text-ink"><T en="Contact" ar="تواصل" /></a>
          <LanguageToggle tone="ink" />
        </nav>
      </header>

      <section className="px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-16 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-sienna before:block before:h-px before:w-7 before:bg-sienna">
            <span><T en="Legal" ar="قانوني" /></span>
          </div>
          <h1 className="font-serif text-[clamp(2.4rem,4.6vw,4.4rem)] font-normal leading-[1.0] text-ink text-balance">
            <T en={<>Legal &amp; <span className="italic text-sienna">Privacy</span></>} ar={<>القانون و<span className="italic text-sienna">الخصوصية</span></>} />
            <span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-sienna align-baseline" aria-hidden="true" />
          </h1>
          <p className="mt-6 font-dm text-sm font-medium uppercase tracking-widest2 text-ink/55">
            <T en={`Last updated: ${LAST_UPDATED.en} · People Studio HR · Dubai, UAE`} ar={`آخر تحديث: ${LAST_UPDATED.ar} · بيبول ستوديو للموارد البشرية · دبي، الإمارات`} />
          </p>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-y border-ink/10 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
        <div className="mx-auto max-w-3xl px-6 md:px-10 lg:px-24">
          <nav aria-label="Legal sections" className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            <span className="mr-3 hidden flex-shrink-0 font-dm text-[0.62rem] font-medium uppercase tracking-widest2 text-ink/40 sm:inline">
              <T en="Jump to" ar="الانتقال إلى" />
            </span>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-shrink-0 border-b-2 border-transparent px-3 py-3 font-dm text-[0.7rem] font-medium uppercase tracking-widest2 text-ink/55 transition-colors hover:border-sienna hover:text-ink"
              >
                {pick(s.label, lang)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <main className="px-6 pb-24 md:px-10 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <LegalSection
            id="privacy"
            number="01"
            eyebrow={<T en="Privacy" ar="الخصوصية" />}
            title={<T en="Privacy Policy" ar="سياسة الخصوصية" />}
          >
            <T
              en={
                <>
                  <p><strong>Who we are:</strong> People Studio HR is a Dubai-based HR consultancy led by Bishoy Mesiha. We currently operate under the trade license of Tajmeel Events Organizing and Managing Co. L.L.C (License No. 1335626, Dubai DED). All data responsibilities belong solely to People Studio HR.</p>
                  <p><strong>What we collect:</strong> Name, email, phone, job title, company name — submitted via contact forms or email. Usage data via analytics tools (aggregated and anonymised).</p>
                  <p><strong>How we use it:</strong> To respond to enquiries, deliver services, and improve the website. We do not sell or share your data with third parties for marketing.</p>
                  <p><strong>Legal basis:</strong> Consent, contract performance, or legitimate interest — in accordance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.</p>
                  <p><strong>Retention:</strong> Client data is kept for a minimum of 5 years after an engagement ends. Enquiry data is kept for 12 months.</p>
                  <p><strong>Your rights:</strong> Access, correct, or request deletion of your data at any time. Contact:{" "}<a href={`mailto:${COMPANY_EMAIL}`} className="text-sienna underline-offset-4 hover:underline">{COMPANY_EMAIL}</a></p>
                  <p><strong>Cookies:</strong> We use analytics cookies. You can disable them via your browser without affecting your ability to contact us.</p>
                </>
              }
              ar={
                <>
                  <p><strong>من نحن:</strong> بيبول ستوديو للموارد البشرية شركة استشارات موارد بشرية مقرّها دبي يقودها بيشوي مسيحه. نعمل حاليًا تحت الرخصة التجارية لشركة تجميل لتنظيم وإدارة الفعاليات ذ.م.م (رخصة رقم 1335626، دائرة الاقتصاد بدبي). كل المسؤوليات المتعلّقة بالبيانات تعود حصرًا إلى بيبول ستوديو للموارد البشرية.</p>
                  <p><strong>ما نجمعه:</strong> الاسم، البريد الإلكتروني، الهاتف، المسمّى الوظيفي، اسم الشركة — تُقدَّم عبر نماذج التواصل أو البريد. وبيانات الاستخدام عبر أدوات التحليلات (مجمّعة ومجهولة الهوية).</p>
                  <p><strong>كيف نستخدمها:</strong> للردّ على الاستفسارات وتقديم الخدمات وتحسين الموقع. لا نبيع بياناتك ولا نشاركها مع أطراف ثالثة لأغراض التسويق.</p>
                  <p><strong>الأساس القانوني:</strong> الموافقة، أو تنفيذ العقد، أو المصلحة المشروعة — وفقًا للمرسوم بقانون اتحادي إماراتي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية.</p>
                  <p><strong>الاحتفاظ:</strong> تُحفظ بيانات العملاء لمدّة لا تقلّ عن 5 سنوات بعد انتهاء التعاقد. وتُحفظ بيانات الاستفسارات لمدّة 12 شهرًا.</p>
                  <p><strong>حقوقك:</strong> الوصول إلى بياناتك أو تصحيحها أو طلب حذفها في أي وقت. التواصل:{" "}<a href={`mailto:${COMPANY_EMAIL}`} className="text-sienna underline-offset-4 hover:underline">{COMPANY_EMAIL}</a></p>
                  <p><strong>ملفات تعريف الارتباط:</strong> نستخدم ملفات تعريف ارتباط تحليلية. يمكنك تعطيلها من متصفّحك دون أن يؤثّر ذلك على قدرتك على التواصل معنا.</p>
                </>
              }
            />
          </LegalSection>

          <LegalSection
            id="terms"
            number="02"
            eyebrow={<T en="Terms" ar="الشروط" />}
            title={<T en="Terms of Service" ar="شروط الخدمة" />}
          >
            <T
              en={
                <>
                  <p>This website is for informational purposes only. Nothing here constitutes legal, financial, or regulatory advice.</p>
                  <p><strong>Intellectual property:</strong> All content — text, tools, frameworks, and design — belongs to People Studio HR and Bishoy Mesiha. Do not reproduce or distribute without written permission.</p>
                  <p><strong>Tools and calculators:</strong> The Emiratisation calculator and HR diagnostic are indicative only. They do not constitute a compliance assessment. People Studio HR accepts no liability for decisions made based on tool outputs.</p>
                  <p><strong>Limitation of liability:</strong> To the fullest extent permitted by UAE law, People Studio HR is not liable for any loss arising from use of or reliance on this website.</p>
                  <p><strong>Governing law:</strong> Laws of the Emirate of Dubai and the UAE. Disputes subject to Dubai Courts jurisdiction.</p>
                </>
              }
              ar={
                <>
                  <p>هذا الموقع لأغراض إعلامية فقط. ولا يشكّل أي شيء فيه استشارة قانونية أو مالية أو تنظيمية.</p>
                  <p><strong>الملكية الفكرية:</strong> كل المحتوى — النصوص والأدوات والأطر والتصميم — ملك لبيبول ستوديو للموارد البشرية ولبيشوي مسيحه. لا يُنسخ أو يُوزَّع دون إذن خطّي.</p>
                  <p><strong>الأدوات والحاسبات:</strong> حاسبة التوطين وتشخيص الموارد البشرية للاسترشاد فقط، ولا تشكّل تقييم امتثال. ولا يتحمّل بيبول ستوديو للموارد البشرية أي مسؤولية عن قرارات تُتّخذ بناءً على مخرجات الأدوات.</p>
                  <p><strong>تحديد المسؤولية:</strong> إلى أقصى حدّ يسمح به القانون الإماراتي، لا يتحمّل بيبول ستوديو للموارد البشرية المسؤولية عن أي خسارة ناتجة عن استخدام هذا الموقع أو الاعتماد عليه.</p>
                  <p><strong>القانون الحاكم:</strong> قوانين إمارة دبي ودولة الإمارات. تخضع النزاعات لاختصاص محاكم دبي.</p>
                </>
              }
            />
          </LegalSection>

          <LegalSection
            id="disclaimer"
            number="03"
            eyebrow={<T en="Disclaimer" ar="إخلاء المسؤولية" />}
            title={<T en="Disclaimer" ar="إخلاء المسؤولية" />}
          >
            <T
              en={
                <>
                  <p>People Studio HR provides HR advisory and consultancy services based on professional expertise and UAE and regional employment law as understood at the time of engagement. Our services are not legal advice. For legally binding matters, engage a UAE-licensed legal practitioner — we can facilitate introductions.</p>
                  <p>Deliverable accuracy depends on the information provided by the client. People Studio HR is not liable for regulatory penalties arising from a client's failure to implement recommendations, changes in law after delivery, or outcomes from a client's internal implementation of our work.</p>
                </>
              }
              ar={
                <>
                  <p>يقدّم بيبول ستوديو للموارد البشرية خدمات استشارية للموارد البشرية بناءً على خبرة مهنية وعلى قانون العمل الإماراتي والإقليمي كما هو مفهوم وقت التعاقد. خدماتنا ليست استشارة قانونية. للأمور الملزِمة قانونًا، يُستعان بمحامٍ مرخّص في الإمارات — ويمكننا تسهيل التواصل.</p>
                  <p>تعتمد دقّة المخرجات على المعلومات التي يقدّمها العميل. ولا يتحمّل بيبول ستوديو للموارد البشرية المسؤولية عن العقوبات التنظيمية الناتجة عن إخفاق العميل في تطبيق التوصيات، أو عن تغييرات القانون بعد التسليم، أو عن نتائج تطبيق العميل الداخلي لأعمالنا.</p>
                </>
              }
            />
          </LegalSection>
        </div>
      </main>

      <SiteFooter />

    </div>
  );
}

interface LegalSectionProps {
  id: string;
  number: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}

function LegalSection({ id, number, eyebrow, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-ink/10 py-14 first:border-t-0 md:py-20">
      <div className="mb-6 flex items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/55 before:block before:h-px before:w-7 before:bg-sienna">
        <span className="text-sienna">{number}</span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="mb-8 font-serif text-[clamp(1.9rem,3.4vw,2.8rem)] font-normal leading-[1.05] text-ink">
        {title}
      </h2>
      <div className="legal-prose space-y-4 font-dm text-base font-light leading-7 text-ink/80">
        {children}
      </div>
    </section>
  );
}
