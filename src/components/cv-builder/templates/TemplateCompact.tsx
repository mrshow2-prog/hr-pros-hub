import { useEffect, useRef, useState } from "react";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { renderCompactHtml } from "@/lib/cv/templates/compact";

/**
 * Compact template preview — renders the same HTML used for PDF/DOCX export
 * inside a sandboxed iframe scaled to fit the wizard's preview pane.
 * This guarantees what-you-see-is-what-you-get.
 */
export default function TemplateCompact({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // A4 width in CSS pixels at 96dpi = 794
  const A4_W = 794;
  const A4_H = 1123;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setScale(Math.min(1, w / A4_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const html = renderCompactHtml(cv, photoUrl, "preview");

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden bg-clay/30"
      style={{ height: A4_H * scale }}
    >
      <iframe
        title="CV preview"
        srcDoc={html}
        sandbox="allow-same-origin"
        style={{
          width: A4_W,
          height: A4_H,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: "white",
          display: "block",
        }}
      />
    </div>
  );
}
