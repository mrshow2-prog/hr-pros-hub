import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Will my CV pass an ATS?",
    a: "Every template is built and tested against the parsers used by major ATS platforms (Workday, Taleo, SuccessFactors, Greenhouse, Lever). We avoid columns, text-in-images, and other elements that commonly break parsing.",
  },
  {
    q: "What file formats can I export?",
    a: "ATS-ready PDF and editable DOCX, both generated from the same source so they stay in sync. Cover letters export in the matching style.",
  },
  {
    q: "Is my data private?",
    a: "Your CV content is stored on your account only and never shared with third parties or used to train public models. You can delete your account and data at any time.",
  },
  {
    q: "Is it really built for the GCC market?",
    a: "Yes. People Studio HR has placed candidates across the UAE and KSA for years. We bake in region-specific norms — photo guidance, nationality and visa fields, bilingual names, and keyword scoring tuned to Gulf employers.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — see our refund policy. If an export doesn't work for you, we'll make it right.",
  },
  {
    q: "Can I generate a matching cover letter?",
    a: "Yes. Once your CV is in, generate a cover letter and interview-prep notes from the same workspace, tailored to a specific job description.",
  },
];

export default function Faq() {
  return (
    <section className="border-t border-ink/10 px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">FAQ</p>
        <h2 className="mt-3 font-syne text-3xl md:text-4xl tracking-tight">
          The answers people ask before they sign up.
        </h2>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-ink/10">
              <AccordionTrigger className="text-left font-syne text-base text-ink hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-ink/70">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
