import { Link } from "react-router-dom";
import PsLogo from "@/components/ui/PsLogo";
import SiteFooter from "@/components/ui/SiteFooter";
import SEO from "@/components/seo/SEO";
import { COMPANY_EMAIL } from "@/lib/contact";

const LAST_UPDATED = "2 May 2026";

const sections = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "disclaimer", label: "Disclaimer" },
] as const;

export default function Legal() {
  return (
    <div className="min-h-screen bg-paper font-dm text-ink">
      <SEO
        title="Legal & Privacy — People.Studio"
        description="Privacy policy, terms of service, and disclaimer for People.Studio — independent HR advisory and career coaching, Dubai UAE."
        path="/legal"
      />

      {/* Header — matches Index */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10 md:py-6">
        <PsLogo size="lg" />
        <nav
          aria-label="Utility"
          className="flex items-center gap-5 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-ink/55 md:gap-6"
        >
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <a href={`mailto:${COMPANY_EMAIL}`} className="transition-colors hover:text-ink">Contact</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 pt-14 pb-12 md:px-10 md:pt-20 md:pb-16 lg:px-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center gap-3 font-dm text-[0.68rem] font-medium uppercase tracking-widest2 text-sienna before:block before:h-px before:w-7 before:bg-sienna">
            <span>Legal</span>
          </div>
          <h1 className="font-serif text-[clamp(2.4rem,4.6vw,4.4rem)] font-normal leading-[1.0] text-ink text-balance">
            Legal &amp; <span className="italic text-sienna">Privacy</span>
            <span className="inline-block h-[0.14em] w-[0.14em] rounded-full bg-sienna align-baseline" aria-hidden="true" />
          </h1>
          <p className="mt-6 font-dm text-sm font-medium uppercase tracking-widest2 text-ink/55">
            Last updated: {LAST_UPDATED} · People Studio HR · Dubai, UAE
          </p>
        </div>
      </section>

      {/* Sticky mini-nav */}
      <div className="sticky top-0 z-20 border-y border-ink/10 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
        <div className="mx-auto max-w-3xl px-6 md:px-10 lg:px-24">
          <nav aria-label="Legal sections" className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            <span className="mr-3 hidden flex-shrink-0 font-dm text-[0.62rem] font-medium uppercase tracking-widest2 text-ink/40 sm:inline">
              Jump to
            </span>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-shrink-0 border-b-2 border-transparent px-3 py-3 font-dm text-[0.7rem] font-medium uppercase tracking-widest2 text-ink/55 transition-colors hover:border-sienna hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pb-24 md:px-10 lg:px-24">
        <div className="mx-auto max-w-3xl">
          {/* Privacy */}
          <LegalSection
            id="privacy"
            number="01"
            eyebrow="Privacy"
            title="Privacy Policy"
          >
            <p>
              <strong>Who we are:</strong> People Studio HR is a Dubai-based HR consultancy led by Bishoy Mesiha. We currently operate under the trade license of Tajmeel Events Organizing and Managing Co. L.L.C (License No. 1335626, Dubai DED). All data responsibilities belong solely to People Studio HR.
            </p>
            <p>
              <strong>What we collect:</strong> Name, email, phone, job title, company name — submitted via contact forms or email. Usage data via analytics tools (aggregated and anonymised).
            </p>
            <p>
              <strong>How we use it:</strong> To respond to enquiries, deliver services, and improve the website. We do not sell or share your data with third parties for marketing.
            </p>
            <p>
              <strong>Legal basis:</strong> Consent, contract performance, or legitimate interest — in accordance with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection.
            </p>
            <p>
              <strong>Retention:</strong> Client data is kept for a minimum of 5 years after an engagement ends. Enquiry data is kept for 12 months.
            </p>
            <p>
              <strong>Your rights:</strong> Access, correct, or request deletion of your data at any time. Contact:{" "}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-sienna underline-offset-4 hover:underline">
                {COMPANY_EMAIL}
              </a>
            </p>
            <p>
              <strong>Cookies:</strong> We use analytics cookies. You can disable them via your browser without affecting your ability to contact us.
            </p>
          </LegalSection>

          <LegalSection
            id="terms"
            number="02"
            eyebrow="Terms"
            title="Terms of Service"
          >
            <p>
              This website is for informational purposes only. Nothing here constitutes legal, financial, or regulatory advice.
            </p>
            <p>
              <strong>Intellectual property:</strong> All content — text, tools, frameworks, and design — belongs to People Studio HR and Bishoy Mesiha. Do not reproduce or distribute without written permission.
            </p>
            <p>
              <strong>Tools and calculators:</strong> The Emiratisation calculator and HR diagnostic are indicative only. They do not constitute a compliance assessment. People Studio HR accepts no liability for decisions made based on tool outputs.
            </p>
            <p>
              <strong>Limitation of liability:</strong> To the fullest extent permitted by UAE law, People Studio HR is not liable for any loss arising from use of or reliance on this website.
            </p>
            <p>
              <strong>Governing law:</strong> Laws of the Emirate of Dubai and the UAE. Disputes subject to Dubai Courts jurisdiction.
            </p>
          </LegalSection>

          <LegalSection
            id="disclaimer"
            number="03"
            eyebrow="Disclaimer"
            title="Disclaimer"
          >
            <p>
              People Studio HR provides HR advisory and consultancy services based on professional expertise and UAE and regional employment law as understood at the time of engagement. Our services are not legal advice. For legally binding matters, engage a UAE-licensed legal practitioner — we can facilitate introductions.
            </p>
            <p>
              Deliverable accuracy depends on the information provided by the client. People Studio HR is not liable for regulatory penalties arising from a client's failure to implement recommendations, changes in law after delivery, or outcomes from a client's internal implementation of our work.
            </p>
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
  eyebrow: string;
  title: string;
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
