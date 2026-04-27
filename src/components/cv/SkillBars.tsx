import { motion } from "framer-motion";
import { SKILLS } from "@/data/profile";

export default function SkillBars() {
  return (
    <div className="max-w-md">
      {SKILLS.map((s, i) => (
        <motion.div
          key={s.name}
          className="mb-5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07 }}
        >
          <div className="flex justify-between mb-2">
            <span className="font-dm font-bold text-xs uppercase text-ink" style={{ letterSpacing: "0.06em" }}>
              {s.name}
            </span>
            <span className="font-serif font-bold text-xs text-navy">{s.pct}%</span>
          </div>
          <div className="h-px w-full relative overflow-hidden" style={{ background: "hsl(var(--navy) / 0.1)" }}>
            <motion.div
              className="h-full absolute top-0 left-0 bg-navy"
              initial={{ width: 0 }}
              whileInView={{ width: `${s.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: "easeOut", delay: i * 0.07 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
