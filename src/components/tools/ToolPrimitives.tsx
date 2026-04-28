import { ReactNode, useState } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block font-dm text-[0.68rem] font-bold uppercase tracking-wider2 text-ink/55">{children}</label>;
}

export function ToolInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-sm border border-ink/12 bg-paper px-4 py-3 font-dm text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-sienna ${props.className ?? ""}`} />;
}

export function ToolSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-sm border border-ink/12 bg-paper px-4 py-3 font-dm text-sm text-ink outline-none transition-colors focus:border-sienna ${props.className ?? ""}`} />;
}

export function ToolTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-24 w-full resize-y rounded-sm border border-ink/12 bg-paper px-4 py-3 font-dm text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-sienna ${props.className ?? ""}`} />;
}

export function OutputBox({ label, text, children }: { label: string; text?: string; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mt-8 animate-fade-up border border-ink/10 bg-clay/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-4 font-dm text-[0.68rem] font-bold uppercase tracking-wider2 text-sienna">
        <span>{label}</span>
        {text && (
          <button onClick={copy} className="border border-sienna/25 bg-sienna/10 px-3 py-1.5 text-[0.62rem] text-sienna transition-colors hover:bg-sienna/20">
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>
      {children ?? <pre className="whitespace-pre-wrap font-dm text-sm leading-8 text-ink/75">{text}</pre>}
    </div>
  );
}

export function UpsellStrip({
  title,
  body,
  href,
  link,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  body: string;
  href?: string;
  link?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const isExternal = (h?: string) => !!h && /^https?:\/\//.test(h);
  return (
    <div className="mt-6 flex flex-col gap-4 border border-sienna/20 bg-sienna/10 p-5 md:flex-row md:items-center md:justify-between">
      <div className="max-w-xl">
        <strong className="mb-1 block font-medium text-ink">{title}</strong>
        <p className="font-dm text-sm leading-6 text-ink/60">{body}</p>
        {secondaryLabel && secondaryHref && (
          <a
            href={secondaryHref}
            target={isExternal(secondaryHref) ? "_blank" : undefined}
            rel={isExternal(secondaryHref) ? "noopener noreferrer" : undefined}
            className="mt-2 inline-block font-dm text-xs text-ink/55 underline-offset-2 hover:text-sienna hover:underline"
          >
            {secondaryLabel}
          </a>
        )}
      </div>
      {ctaLabel && ctaHref ? (
        <a
          href={ctaHref}
          target={isExternal(ctaHref) ? "_blank" : undefined}
          rel={isExternal(ctaHref) ? "noopener noreferrer" : undefined}
          className="inline-flex shrink-0 items-center justify-center bg-sienna px-6 py-3 font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-paper transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </a>
      ) : (
        href && link && (
          <a href={href} className="whitespace-nowrap font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-sienna hover:underline">
            {link}
          </a>
        )
      )}
    </div>
  );
}

export function SuggestionBox({ title, subtitle, placeholder }: { title: string; subtitle: string; placeholder: string }) {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="mt-12 border border-olive/20 bg-olive/10 p-6">
      <h3 className="mb-2 font-serif text-sm font-bold text-olive">{title}</h3>
      <p className="mb-4 font-dm text-sm leading-6 text-ink/55">{subtitle}</p>
      {sent ? (
        <p className="font-dm text-sm text-olive">Received. I’ll review it and respond if it needs a direct answer.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <ToolTextarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="min-h-16" />
          <button
            onClick={() => value.trim() && (setValue(""), setSent(true))}
            className="h-12 bg-olive px-6 font-dm text-[0.72rem] font-bold uppercase tracking-wider2 text-paper transition-opacity hover:opacity-90"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
