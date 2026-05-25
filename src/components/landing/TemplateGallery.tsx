import { Link } from "react-router-dom";

type Variant = "modern" | "classic" | "executive" | "compact" | "skills" | "sidebar";

function Thumb({ variant }: { variant: Variant }) {
  const bar = (w: string, key: string | number) => (
    <div key={key} className="h-1 rounded-full bg-ink/15" style={{ width: w }} />
  );

  if (variant === "sidebar") {
    return (
      <div className="absolute inset-0 flex bg-paper">
        <div className="w-[38%] bg-ink p-3 text-paper">
          <div className="mx-auto mb-3 h-8 w-8 rounded-full bg-paper/20" />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-full bg-paper/40" />
            <div className="h-1 w-4/5 rounded-full bg-paper/30" />
            <div className="h-1 w-3/5 rounded-full bg-paper/30" />
          </div>
          <div className="mt-4 h-2 w-2/3 rounded-full bg-sienna" />
          <div className="mt-2 space-y-1">
            <div className="h-1 w-full rounded-full bg-paper/30" />
            <div className="h-1 w-4/5 rounded-full bg-paper/30" />
          </div>
        </div>
        <div className="flex-1 p-3">
          <div className="h-2 w-3/4 rounded-full bg-ink/80" />
          <div className="mt-1 h-1 w-1/2 rounded-full bg-sienna" />
          <div className="mt-3 space-y-1">
            {[..."abcde"].map((c, i) => bar(`${95 - i * 8}%`, c))}
          </div>
          <div className="mt-4 h-1.5 w-1/3 rounded-full bg-ink/70" />
          <div className="mt-2 space-y-1">
            {[..."fgh"].map((c, i) => bar(`${90 - i * 10}%`, c))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "executive") {
    return (
      <div className="absolute inset-0 bg-paper p-4">
        <div className="text-center">
          <div className="mx-auto h-2.5 w-2/3 rounded-full bg-ink/85" />
          <div className="mx-auto mt-1.5 h-1 w-1/3 rounded-full bg-sienna" />
        </div>
        <div className="mt-3 border-t border-ink/20 pt-3 space-y-1.5">
          {[..."abcde"].map((c, i) => bar(`${95 - i * 6}%`, c))}
        </div>
        <div className="mt-4 h-1.5 w-1/4 rounded-full bg-ink/70" />
        <div className="mt-2 space-y-1">
          {[..."fghi"].map((c, i) => bar(`${90 - i * 8}%`, c))}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="absolute inset-0 bg-paper p-3">
        <div className="h-2 w-1/2 rounded-full bg-ink/80" />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-0.5">
              <div className="h-1 w-full rounded-full bg-ink/30" />
              <div className="h-0.5 w-3/4 rounded-full bg-ink/15" />
              <div className="h-0.5 w-2/3 rounded-full bg-ink/15" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "skills") {
    return (
      <div className="absolute inset-0 bg-paper p-4">
        <div className="h-2.5 w-2/3 rounded-full bg-ink/85" />
        <div className="mt-3 h-1.5 w-1/3 rounded-full bg-sienna" />
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-3 w-10 rounded-sm bg-ink/10" />
          ))}
        </div>
        <div className="mt-4 space-y-1">
          {[..."abcd"].map((c, i) => bar(`${90 - i * 8}%`, c))}
        </div>
      </div>
    );
  }

  if (variant === "classic") {
    return (
      <div className="absolute inset-0 bg-paper p-4">
        <div className="text-center border-b border-ink/30 pb-2">
          <div className="mx-auto h-2.5 w-1/2 rounded-full bg-ink/85" />
          <div className="mx-auto mt-1 h-0.5 w-1/4 rounded-full bg-ink/40" />
        </div>
        <div className="mt-3 space-y-1.5">
          {[..."abcdef"].map((c, i) => bar(`${95 - i * 5}%`, c))}
        </div>
      </div>
    );
  }

  // modern
  return (
    <div className="absolute inset-0 bg-paper p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-2.5 w-3/4 rounded-full bg-ink/85" />
          <div className="mt-1 h-1 w-1/2 rounded-full bg-ink/40" />
        </div>
        <div className="h-6 w-6 rounded-full bg-ink/15" />
      </div>
      <div className="mt-3 h-1.5 w-1/4 rounded-full bg-sienna" />
      <div className="mt-2 space-y-1">
        {[..."abc"].map((c, i) => bar(`${95 - i * 8}%`, c))}
      </div>
      <div className="mt-3 h-1.5 w-1/3 rounded-full bg-ink/70" />
      <div className="mt-2 space-y-1">
        {[..."defg"].map((c, i) => bar(`${90 - i * 7}%`, c))}
      </div>
    </div>
  );
}

const ITEMS: { name: string; tag: string; variant: Variant }[] = [
  { name: "Dubai", tag: "Most picked", variant: "modern" },
  { name: "London", tag: "Recruiter favourite", variant: "classic" },
  { name: "Zurich", tag: "Executive", variant: "executive" },
  { name: "Singapore", tag: "Information-dense", variant: "compact" },
  { name: "Berlin", tag: "Career change", variant: "skills" },
  { name: "Riyadh", tag: "New · Bold", variant: "sidebar" },
];

export default function TemplateGallery() {
  return (
    <section className="border-t border-ink/10 px-6 md:px-10 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">Templates</p>
            <h2 className="mt-3 font-syne text-3xl md:text-4xl tracking-tight">
              Seven templates. Every one ATS-tested.
            </h2>
          </div>
          <Link to="/login" className="text-sm text-sienna hover:underline">
            Browse all templates →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ name, tag, variant }) => (
            <div
              key={name}
              className="group rounded-sm border border-ink/10 bg-paper p-4 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm ring-1 ring-ink/10">
                <Thumb variant={variant} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="font-syne text-lg tracking-tight">{name}</div>
                <span className="text-[10px] uppercase tracking-wider2 text-sienna">{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
