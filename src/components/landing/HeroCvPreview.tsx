// Static visual approximation of a Dubai-template CV. Pure JSX, no PDF render.
export default function HeroCvPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -top-3 -left-3 z-10 rounded-sm bg-ink px-3 py-1 text-[11px] uppercase tracking-wider2 text-paper">
        ATS 92
      </div>
      <div className="absolute -top-3 -right-3 z-10 rounded-sm bg-sienna px-3 py-1 text-[11px] uppercase tracking-wider2 text-paper">
        UAE-ready
      </div>
      <div
        className="rotate-[-1.5deg] rounded-sm bg-paper p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)] ring-1 ring-ink/10"
        aria-hidden="true"
      >
        <div className="border-b border-ink/15 pb-3">
          <div className="font-syne text-xl tracking-tight text-ink">Layla Al-Mansoori</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider2 text-ink/55">
            Senior Marketing Manager · Dubai, UAE
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider2 text-sienna">
            Professional Summary
          </div>
          <div className="mt-1.5 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-ink/10" />
            <div className="h-1.5 w-[92%] rounded-full bg-ink/10" />
            <div className="h-1.5 w-[78%] rounded-full bg-ink/10" />
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[10px] font-semibold uppercase tracking-wider2 text-sienna">
            Experience
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <div className="font-syne text-[13px] text-ink">Head of Brand</div>
              <div className="text-[10px] text-ink/55">2022 — Present</div>
            </div>
            <div className="text-[11px] text-ink/65">Majid Al Futtaim · Dubai</div>
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-[95%] rounded-full bg-ink/10" />
              <div className="h-1.5 w-[80%] rounded-full bg-ink/10" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <div className="font-syne text-[13px] text-ink">Marketing Lead</div>
              <div className="text-[10px] text-ink/55">2019 — 2022</div>
            </div>
            <div className="text-[11px] text-ink/65">Emaar · Dubai</div>
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-[88%] rounded-full bg-ink/10" />
              <div className="h-1.5 w-[72%] rounded-full bg-ink/10" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider2 text-sienna">
              Skills
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["Brand", "GTM", "Arabic", "Analytics"].map((s) => (
                <span key={s} className="rounded-sm bg-ink/5 px-1.5 py-0.5 text-[9px] text-ink/70">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider2 text-sienna">
              Education
            </div>
            <div className="mt-1.5 text-[10px] text-ink/70">MBA, INSEAD</div>
            <div className="text-[10px] text-ink/55">BA, AUS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
