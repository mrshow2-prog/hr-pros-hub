import { Link } from "react-router-dom";

export default function PricingStrip() {
  return (
    <section className="border-t border-ink/10 px-6 md:px-10 py-16">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-dm text-xs uppercase tracking-wider2 text-ink/55">Pricing</p>
          <h2 className="mt-2 font-syne text-2xl md:text-3xl tracking-tight">
            Free to draft. Pay only when you export.
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            No subscription. No card to start.{" "}
            <Link to="/refunds" className="text-sienna hover:underline">
              Refund policy
            </Link>
            .
          </p>
        </div>
        <Link
          to="/login"
          className="rounded-sm bg-ink px-6 py-3 text-paper hover:opacity-90 whitespace-nowrap"
        >
          Start free draft
        </Link>
      </div>
    </section>
  );
}
