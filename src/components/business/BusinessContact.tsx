import { useState, FormEvent } from "react";
import { COMPANY_EMAIL } from "@/lib/contact";

export default function BusinessContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Business Enquiry — People Studio");
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const contacts = [
    { label: "Email", val: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
    { label: "Phone", val: "+971 58 178 4948", href: "tel:+971581784948" },
    { label: "LinkedIn", val: "linkedin.com/in/peoplestudio", href: "https://linkedin.com" },
    { label: "Markets", val: "UAE · KSA · Qatar · Kuwait · Bahrain", href: null as string | null },
  ];

  const fields = [
    { id: "name" as const, label: "Your Name", type: "text", required: true },
    { id: "email" as const, label: "Email", type: "email", required: true },
    { id: "phone" as const, label: "Phone (optional)", type: "tel", required: false },
  ];

  return (
    <section id="contact" className="px-6 md:px-20 py-24 bg-terracotta">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <span className="font-dm font-bold text-xs uppercase block mb-5 text-cream/70" style={{ letterSpacing: "0.18em" }}>
              Contact
            </span>
            <h2 className="font-serif font-bold mb-6 text-cream" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
              Let's talk about
              <br />
              your business.
            </h2>
            <p className="font-dm text-cream/80 mb-10 max-w-md leading-relaxed" style={{ fontWeight: 300 }}>
              Free 30-minute discovery call. No obligation. We'll discuss your situation, identify the most urgent risks, and
              tell you exactly what we'd recommend.
            </p>

            <div className="space-y-5">
              {contacts.map((c) => (
                <div key={c.label}>
                  <div className="font-dm font-bold text-xs uppercase mb-1 text-cream/55" style={{ letterSpacing: "0.12em" }}>
                    {c.label}
                  </div>
                  {c.href ? (
                    <a href={c.href} className="font-dm text-cream hover:underline">
                      {c.val}
                    </a>
                  ) : (
                    <span className="font-dm text-cream/85">{c.val}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((f) => (
                  <div key={f.id}>
                    <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/70" style={{ letterSpacing: "0.1em" }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.id]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                      className="w-full px-4 py-3 font-dm text-sm text-cream"
                      style={{
                        background: "hsl(var(--cream) / 0.12)",
                        border: "1px solid hsl(var(--cream) / 0.2)",
                        outline: "none",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.7)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.2)")}
                    />
                  </div>
                ))}
                <div>
                  <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/70" style={{ letterSpacing: "0.1em" }}>
                    Tell me about your situation
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 font-dm text-sm resize-none text-cream"
                    style={{
                      background: "hsl(var(--cream) / 0.12)",
                      border: "1px solid hsl(var(--cream) / 0.2)",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.7)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.2)")}
                  />
                </div>
                <button
                  type="submit"
                  className="font-dm font-bold text-sm uppercase w-full py-4 rounded-sm transition-colors duration-200 bg-cream text-terracotta hover:bg-ink hover:text-cream"
                  style={{ letterSpacing: "0.1em" }}
                >
                  Send Enquiry →
                </button>
              </form>
            ) : (
              <div className="h-full flex items-center">
                <div>
                  <div className="font-serif font-bold text-2xl mb-3 text-cream">Message sent.</div>
                  <p className="font-dm text-cream/75" style={{ fontWeight: 300 }}>
                    Your email client should open. If not, email {COMPANY_EMAIL} directly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
