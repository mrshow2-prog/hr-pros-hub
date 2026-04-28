import { ABOUT_CREDENTIALS } from "@/data/business";

const ENDORSEMENTS = [
  {
    quote:
      "His professionalism, collaborative spirit, and positive approach made a meaningful impact — and he will certainly be missed.",
    attribution: "Regional Director · MCN KSA",
  },
  {
    quote:
      "I wanted you to know how much I enjoyed working with you and to thank you for the advice you gave me.",
    attribution: "Managing Director · MCN",
  },
];

export default function BusinessAbout() {
  return (
    <section id="about" className="px-6 md:px-20 py-24 bg-cream">
      <div className="max-w-5xl mx-auto">
        <span className="font-dm font-bold text-xs uppercase block mb-8 text-terracotta" style={{ letterSpacing: "0.18em" }}>
          About
        </span>
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="font-serif font-bold mb-6 text-ink" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", letterSpacing: "-0.02em" }}>
              16 years of HR expertise,
              <br />
              <em>applied with purpose.</em>
            </h2>
            <p className="font-dm leading-relaxed mb-5 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              I've spent 16 years making HR decisions that affected real people — across 11 MENAT markets, in companies from 25 to 1,300 employees, in eight industries. I've hired and let people go, restructured organisations, navigated MoHRE labour claims, built compliance frameworks from scratch, and sat in rooms where the people decisions were the hardest ones being made.
            </p>
            <p className="font-dm leading-relaxed mb-5 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              People Studio exists because most UAE SMEs are running without the HR infrastructure their headcount demands — and the consequences are expensive. I work directly with founders and operators to close that gap: not with reports and frameworks, but with decisions and implementations.
            </p>
            <p className="font-dm leading-relaxed mb-8 text-moss" style={{ fontWeight: 300, fontSize: "1rem" }}>
              When you work with me, you work with me. No juniors, no subcontractors, no eighty-page handbooks.
            </p>
            <a
              href="#contact"
              className="font-dm font-bold text-sm uppercase px-7 py-3.5 rounded-sm inline-block transition-colors duration-200 bg-terracotta hover:bg-terracotta-deep text-cream"
              style={{ letterSpacing: "0.06em" }}
            >
              About the Founder →
            </a>
          </div>

          <div className="space-y-4">
            {ABOUT_CREDENTIALS.map((b) => (
              <div
                key={b.n}
                className="flex items-center gap-5 p-4 bg-white"
                style={{ borderLeft: "2px solid hsl(var(--terracotta) / 0.2)" }}
              >
                <div className="font-serif font-bold text-lg text-terracotta" style={{ minWidth: "7rem" }}>
                  {b.n}
                </div>
                <div className="font-dm text-sm text-moss" style={{ fontWeight: 300 }}>
                  {b.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
