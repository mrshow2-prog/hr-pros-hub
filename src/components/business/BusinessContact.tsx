import { useState, FormEvent } from "react";
import { COMPANY_EMAIL } from "@/lib/contact";
import { supabase } from "@/integrations/supabase/client";
import { T, useTr, useLang } from "@/i18n/T";

export default function BusinessContact() {
  const tr = useTr();
  const lang = useLang();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-enquiry", {
        body: { source: "Business", name: form.name, email: form.email, phone: form.phone, message: form.message },
      });
      if (error || !data?.success) {
        const ctx = (error as { context?: { error?: string } })?.context;
        setErrorMsg(ctx?.error || error?.message || tr("Couldn't send your enquiry. Please email us directly.", "تعذّر إرسال طلبك. يرجى مراسلتنا عبر البريد مباشرة."));
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (err) {
      console.error("send-contact-enquiry threw:", err);
      setErrorMsg(err instanceof Error ? err.message : tr("Couldn't send your enquiry. Please email us directly.", "تعذّر إرسال طلبك. يرجى مراسلتنا عبر البريد مباشرة."));
      setStatus("error");
    }
  };

  const contacts: { label: { en: string; ar: string }; val: string; href: string | null }[] = [
    { label: { en: "Email", ar: "البريد الإلكتروني" }, val: COMPANY_EMAIL, href: `mailto:${COMPANY_EMAIL}` },
    { label: { en: "Phone", ar: "الهاتف" }, val: "+971 58 178 4948", href: "tel:+971581784948" },
    { label: { en: "LinkedIn", ar: "لينكدإن" }, val: "linkedin.com/in/bmesiha", href: "https://www.linkedin.com/in/bmesiha/" },
    { label: { en: "Markets", ar: "الأسواق" }, val: lang === "ar" ? "الإمارات · السعودية · قطر · الكويت · البحرين" : "UAE · KSA · Qatar · Kuwait · Bahrain", href: null },
  ];

  const fields = [
    { id: "name" as const, label: tr("Your Name", "اسمك"), type: "text", required: true },
    { id: "email" as const, label: tr("Email", "البريد الإلكتروني"), type: "email", required: true },
    { id: "phone" as const, label: tr("Phone (optional)", "الهاتف (اختياري)"), type: "tel", required: false },
  ];

  const sending = status === "sending";

  return (
    <section id="contact" className="px-6 md:px-20 py-24 bg-terracotta">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <span className="font-dm font-bold text-xs uppercase block mb-5 text-cream/70" style={{ letterSpacing: "0.18em" }}>
              <T en="Contact" ar="تواصل" />
            </span>
            <h2 className="font-serif font-bold mb-6 text-cream" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
              <T en="Let's talk about" ar="لنتحدّث" />
              <br />
              <T en="your business." ar="عن عملك." />
            </h2>
            <p className="font-dm text-cream/80 mb-10 max-w-md leading-relaxed" style={{ fontWeight: 300 }}>
              <T
                en="Free 30-minute discovery call. No obligation. We'll discuss your situation, identify the most urgent risks, and tell you exactly what we'd recommend."
                ar="مكالمة استكشافية مجانية مدّتها 30 دقيقة. بلا التزام. سنناقش وضعك ونحدّد أكثر المخاطر إلحاحًا ونخبرك بالضبط بما نوصي به."
              />
            </p>

            <div className="space-y-5">
              {contacts.map((c, i) => (
                <div key={i}>
                  <div className="font-dm font-bold text-xs uppercase mb-1 text-cream/55" style={{ letterSpacing: "0.12em" }}>
                    {c.label[lang]}
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
            {status !== "sent" ? (
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
                      disabled={sending}
                      maxLength={320}
                      className="w-full px-4 py-3 font-dm text-sm text-cream"
                      style={{ background: "hsl(var(--cream) / 0.12)", border: "1px solid hsl(var(--cream) / 0.2)", outline: "none" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.7)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.2)")}
                    />
                  </div>
                ))}
                <div>
                  <label className="font-dm font-bold text-xs uppercase block mb-2 text-cream/70" style={{ letterSpacing: "0.1em" }}>
                    <T en="Tell me about your situation" ar="اشرح لي وضعك" />
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    disabled={sending}
                    maxLength={5000}
                    className="w-full px-4 py-3 font-dm text-sm resize-none text-cream"
                    style={{ background: "hsl(var(--cream) / 0.12)", border: "1px solid hsl(var(--cream) / 0.2)", outline: "none" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.7)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(var(--cream) / 0.2)")}
                  />
                </div>
                {status === "error" && errorMsg && <p className="font-dm text-sm text-cream bg-ink/30 px-4 py-3">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="font-dm font-bold text-sm uppercase w-full py-4 rounded-sm transition-colors duration-200 bg-cream text-terracotta hover:bg-ink hover:text-cream disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ letterSpacing: "0.1em" }}
                >
                  {sending ? tr("Sending…", "جاري الإرسال…") : tr("Send Enquiry →", "أرسل الطلب ←")}
                </button>
              </form>
            ) : (
              <div className="h-full flex items-center">
                <div>
                  <div className="font-serif font-bold text-2xl mb-3 text-cream"><T en="Message sent." ar="تم إرسال الرسالة." /></div>
                  <p className="font-dm text-cream/75" style={{ fontWeight: 300 }}>
                    {lang === "ar"
                      ? `شكرًا ${form.name || "—"}، طلبك في صندوق بريدنا. سنردّ على ${form.email} خلال يوم عمل واحد.`
                      : `Thanks ${form.name || "—"}, your enquiry is in our inbox. We'll reply to ${form.email} within one business day.`}
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
