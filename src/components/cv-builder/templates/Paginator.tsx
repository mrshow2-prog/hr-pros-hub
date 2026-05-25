import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Slices its children into A4-sized page cards so the live preview mirrors
 * how the PDF will paginate. The children are rendered once into a hidden
 * measurement node; we then render N visible page cards, each padded with
 * a top/bottom margin that matches the PDF (16mm ≈ 60px) and clipped to
 * its content area, with a vertical translate to show the right slice.
 *
 * Templates must NOT add their own vertical padding — the Paginator owns
 * the top/bottom margin so every page (not just page 1 and the last) has
 * identical whitespace, mirroring the PDF layout exactly.
 */
const A4_W = 794;
const A4_H = 1123;
// 16mm at 96dpi ≈ 60.47px — matches the pdfme builder's 16mm top/bottom margins.
const PDF_MARGIN_PX = 60;

export default function Paginator({
  children,
  pageWidth = A4_W,
  pageHeight = A4_H,
  marginTop = PDF_MARGIN_PX,
  marginBottom = PDF_MARGIN_PX,
  gap = 24,
}: {
  children: ReactNode;
  pageWidth?: number;
  pageHeight?: number;
  marginTop?: number;
  marginBottom?: number;
  gap?: number;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const contentH = Math.max(1, pageHeight - marginTop - marginBottom);

  const recompute = () => {
    const el = measureRef.current;
    if (!el) return;
    const h = el.scrollHeight;
    const n = Math.max(1, Math.ceil(h / contentH));
    setPages((prev) => (prev === n ? prev : n));
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);
    const imgs = el.querySelectorAll("img, iframe");
    const onLoad = () => recompute();
    imgs.forEach((n) => n.addEventListener("load", onLoad));
    const t1 = setTimeout(recompute, 120);
    const t2 = setTimeout(recompute, 500);
    return () => {
      ro.disconnect();
      imgs.forEach((n) => n.removeEventListener("load", onLoad));
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, contentH]);

  return (
    <div style={{ width: pageWidth }}>
      {/* Hidden measurement copy — single source of truth for height */}
      <div
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          width: pageWidth,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <div ref={measureRef} style={{ width: pageWidth }}>
          {children}
        </div>
      </div>

      {/* Visible page cards — each gets identical top/bottom margins. */}
      <div className="flex flex-col items-center" style={{ gap }}>
        {Array.from({ length: pages }).map((_, i) => (
          <div
            key={i}
            className="relative bg-white shadow-xl ring-1 ring-ink/10"
            style={{
              width: pageWidth,
              height: pageHeight,
              overflow: "hidden",
            }}
          >
            {/* Content viewport sits inside the page margins. */}
            <div
              style={{
                position: "absolute",
                top: marginTop,
                left: 0,
                width: pageWidth,
                height: contentH,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -i * contentH,
                  left: 0,
                  width: pageWidth,
                }}
              >
                {children}
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-ink/70 px-2 py-0.5 font-dm text-[10px] font-medium text-white">
              Page {i + 1} / {pages}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
