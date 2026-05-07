import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLang, useTr } from "@/i18n/T";
import { toast } from "@/components/ui/sonner";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "ps_site_assistant_v1";

export default function SiteAssistant() {
  const lang = useLang();
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (open) scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isStreaming]);

  const greeting =
    lang === "ar"
      ? "مرحبًا! أنا مساعد People.Studio. كيف يمكنني توجيهك اليوم — استشارات موارد بشرية لشركتك، أو دعم مسيرتك المهنية، أو أدوات مجانية؟"
      : "Hi! I'm the People.Studio assistant. How can I point you in the right direction today — HR for your business, support for your career, or our free tools?";

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setIsStreaming(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/site-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, lang }),
      });

      if (!resp.ok || !resp.body) {
        const data = await resp.json().catch(() => ({}));
        toast.error(data.error || tr("Assistant unavailable", "المساعد غير متاح"));
        setIsStreaming(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const { delta } = JSON.parse(payload);
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(tr("Network error. Please try again.", "خطأ في الشبكة. حاول مرة أخرى."));
    } finally {
      setIsStreaming(false);
    }
  };

  const clear = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <>
      {/* Floating launcher — sits above WhatsApp button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={tr("Open assistant", "افتح المساعد")}
        className="fixed bottom-[88px] right-5 md:bottom-[96px] md:right-6 z-[100] flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-terracotta hover:bg-terracotta-deep text-cream"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>

      {open && (
        <div
          dir={dir}
          className="fixed bottom-[150px] right-5 md:bottom-[160px] md:right-6 z-[100] flex w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-200px))] flex-col rounded-lg border border-ink/10 bg-paper shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 bg-ink text-cream">
            <div className="font-serif text-sm">
              <div className="font-bold leading-tight">{tr("People.Studio assistant", "مساعد People.Studio")}</div>
              <div className="font-dm text-[11px] opacity-70">{tr("Powered by Gemini", "بدعم من Gemini")}</div>
            </div>
            <button
              onClick={clear}
              className="font-dm text-[11px] uppercase tracking-wider opacity-70 hover:opacity-100"
              aria-label={tr("Clear conversation", "مسح المحادثة")}
            >
              {tr("Clear", "مسح")}
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper">
            {messages.length === 0 && (
              <div className="font-dm text-sm text-ink/75 leading-relaxed">{greeting}</div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 font-dm text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ms-auto bg-terracotta text-cream"
                    : "me-auto bg-ink/5 text-ink"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&_a]:text-terracotta [&_a]:underline [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <div className="me-auto rounded-lg bg-ink/5 px-3 py-2 font-dm text-sm text-ink/60">…</div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-ink/10 bg-paper p-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tr("Ask anything…", "اسأل أي شيء…")}
              className="flex-1 rounded-md border border-ink/15 bg-paper px-3 py-2 font-dm text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-terracotta"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="rounded-md bg-terracotta hover:bg-terracotta-deep disabled:opacity-40 px-4 py-2 font-dm text-xs font-bold uppercase tracking-wider text-cream"
            >
              {tr("Send", "إرسال")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
