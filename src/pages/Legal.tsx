import { Link } from "react-router-dom";
import PsLogo from "@/components/ui/PsLogo";
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
              People Studio ("we", "us", "our") respects your privacy. This policy explains what
              information we collect when you use our website, free tools, or engage us for advisory
              services, and how we handle it.
            </p>

            <h3>What we collect</h3>
            <ul>
              <li>Contact details you provide — name, email, phone, company.</li>
              <li>Information shared during enquiries, consultations, or tool submissions.</li>
              <li>Basic analytics — pages visited, device type, referrer.</li>
            </ul>

            <h3>How we use it</h3>
            <ul>
              <li>To respond to enquiries and deliver requested services.</li>
              <li>To send tool outputs (e.g. policies, JDs, diagnostics) you request by email.</li>
              <li>To improve our tools and content.</li>
            </ul>

            <h3>Sharing</h3>
            <p>
              We do not sell your data. We share information only with service providers required to
              run this site (hosting, email delivery), bound to confidentiality. We may disclose
              information where required by UAE law.
            </p>

            <h3>Retention &amp; your rights</h3>
            <p>
              We keep enquiry and engagement records for as long as needed to provide services and to
              meet legal obligations. You may request access, correction, or deletion of your data by
              writing to{" "}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-sienna underline-offset-4 hover:underline">
                {COMPANY_EMAIL}
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection
            id="terms"
            number="02"
            eyebrow="Terms"
            title="Terms of Service"
          >
            <p>
              By accessing this website or engaging People Studio, you agree to these terms. If you do
              not agree, please do not use the site or services.
            </p>

            <h3>Services</h3>
            <p>
              People Studio provides independent HR advisory, career coaching, and related
              consulting. Specific deliverables, fees, and timelines are agreed in writing for each
              engagement.
            </p>

            <h3>Use of free tools</h3>
            <p>
              Tools provided on this site (diagnostics, calculators, generators) are offered as
              starting points. They do not constitute legal advice and should be reviewed by a
              qualified professional before being relied upon.
            </p>

            <h3>Intellectual property</h3>
            <p>
              All content, frameworks, templates, and tool outputs remain the intellectual property of
              People Studio unless explicitly assigned in a signed agreement. You may use outputs
              within your own organisation; redistribution or resale is not permitted.
            </p>

            <h3>Liability</h3>
            <p>
              To the fullest extent permitted by law, People Studio is not liable for indirect or
              consequential losses arising from use of this website, free tools, or advisory outputs.
              Engagement-specific liability is governed by the relevant signed agreement.
            </p>

            <h3>Governing law</h3>
            <p>
              These terms are governed by the laws of the United Arab Emirates and the courts of
              Dubai have exclusive jurisdiction.
            </p>
          </LegalSection>

          <LegalSection
            id="disclaimer"
            number="03"
            eyebrow="Disclaimer"
            title="Disclaimer"
          >
            <p>
              Information on this website — including blog posts, tool outputs, calculators, and
              templates — is provided for general guidance only. It is not a substitute for tailored
              legal, regulatory, or professional advice.
            </p>

            <h3>UAE Labour Law &amp; Emiratisation</h3>
            <p>
              References to UAE Labour Law, MOHRE rules, Nitaqat, or Emiratisation quotas reflect our
              understanding at the time of writing. Regulations change. Always verify current
              requirements with the relevant authority or a licensed advisor before acting.
            </p>

            <h3>Tool outputs</h3>
            <p>
              Generated policies, job descriptions, and diagnostic results are starting drafts. They
              should be reviewed and adapted to your specific organisation, sector, and jurisdiction
              before use.
            </p>

            <h3>External links</h3>
            <p>
              Where we link to third-party websites or resources, we do not endorse and are not
              responsible for their content.
            </p>

            <p className="pt-2 text-ink/55">
              Questions? Write to{" "}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-sienna underline-offset-4 hover:underline">
                {COMPANY_EMAIL}
              </a>
              .
            </p>
          </LegalSection>
        </div>
      </main>

      <footer className="border-t border-ink/10 px-6 py-6 font-dm text-[0.66rem] font-medium uppercase tracking-wider2 text-ink/50 md:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} People.Studio · Dubai, UAE</span>
          <Link to="/" className="hover:text-ink">Back to home →</Link>
        </div>
      </footer>
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
