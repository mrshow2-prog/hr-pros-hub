import { motion } from "framer-motion";
import { TIMELINE } from "@/data/profile";

export default function Timeline() {
  return (
    <div>
      {TIMELINE.map((t, i) => (
        <motion.div
          key={i}
          className="grid md:grid-cols-[140px_1fr] gap-6 md:gap-10 py-10"
          style={{
            paddingTop: i === 0 ? 0 : undefined,
            borderBottom: i < TIMELINE.length - 1 ? "1px solid hsl(var(--navy) / 0.12)" : "none",
          }}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.6 }}
        >
          <div>
            <span className="font-dm font-bold text-xs text-navy" style={{ letterSpacing: "0.04em" }}>
              {t.period}
            </span>
          </div>
          <div>
            <h3 className="font-serif font-semibold text-lg text-ink mb-1">{t.role}</h3>
            <p className="font-dm text-sm font-medium text-navy mb-3">{t.company}</p>
            <p className="font-dm text-sm leading-relaxed text-moss mb-3" style={{ fontWeight: 300 }}>
              {t.description}
            </p>
            <ul className="mb-4 space-y-1">
              {t.achievements.map((a, j) => (
                <li key={j} className="font-dm text-sm text-moss flex gap-2">
                  <span className="text-navy flex-shrink-0">—</span> {a}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-dm text-xs px-2.5 py-1 text-navy"
                  style={{ background: "hsl(var(--navy) / 0.08)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
