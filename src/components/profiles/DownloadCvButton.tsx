interface Props {
  /** Public URL of the CV PDF (from profile content.cv_url). */
  url?: string | null;
  /** File name suggested to the browser. */
  fileName?: string;
}

/**
 * Floating "Download CV" pill, bottom-left so it doesn't collide with the
 * site assistant launcher (bottom-right). Only renders when a URL is present.
 */
export default function DownloadCvButton({ url, fileName = "cv.pdf" }: Props) {
  if (!url) return null;
  return (
    <a
      href={url}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 md:bottom-6 md:left-6 z-[100] inline-flex items-center gap-2 rounded-full bg-[#c9a84c] hover:bg-[#e8d49a] text-[#0a0a0f] font-mono text-[11px] tracking-[0.2em] uppercase font-bold px-5 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.25)] transition-colors"
      aria-label="Download CV (PDF)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span>Download CV</span>
    </a>
  );
}
