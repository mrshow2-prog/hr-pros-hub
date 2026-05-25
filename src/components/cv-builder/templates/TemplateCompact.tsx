import { useEffect, useRef, useState } from "react";
import type { GeneratedCV } from "@/contexts/CVBuilderContext";
import { renderCompactHtml } from "@/lib/cv/templates/compact";

/**
 * Compact template preview — renders the same HTML used for PDF/DOCX export
 * inside a sandboxed iframe at natural A4 width (794px). The iframe height
 * auto-resizes to its body's scrollHeight so an outer Paginator/ScaledPreview
 * can measure and slice the content into A4 pages.
 */
export default function TemplateCompact({
  cv,
  photoUrl,
}: {
  cv: GeneratedCV;
  photoUrl: string | null;
}) {
  const A4_W = 794;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1123);
  const html = renderCompactHtml(cv, photoUrl, "preview");

  useEffect(() => {
    const f = iframeRef.current;
    if (!f) return;
    const measure = () => {
      try {
        const body = f.contentDocument?.body;
        if (body) {
          const h = Math.max(body.scrollHeight, body.offsetHeight, 1123);
          setHeight(h);
        }
      } catch {
        /* sandboxed cross-origin — fall back to default */
      }
    };
    const onLoad = () => {
      measure();
      // Re-measure shortly after in case fonts/images change layout
      setTimeout(measure, 50);
      setTimeout(measure, 250);
    };
    f.addEventListener("load", onLoad);
    return () => f.removeEventListener("load", onLoad);
  }, [html]);

  return (
    <div style={{ width: A4_W, height, background: "white" }}>
      <iframe
        ref={iframeRef}
        title="CV preview"
        srcDoc={html}
        sandbox="allow-same-origin"
        style={{
          width: A4_W,
          height,
          border: 0,
          background: "white",
          display: "block",
        }}
      />
    </div>
  );
}
