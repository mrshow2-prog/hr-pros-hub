import { useLocation } from "react-router-dom";
import { useTr } from "@/i18n/T";
import { getProfileSlugFromPath } from "@/lib/profileRoutes";

/**
 * Floating WhatsApp contact button.
 * Fixed bottom-right on every page, opens WA chat in a new tab.
 */
export default function WhatsAppButton() {
  const tr = useTr();
  return (
    <a
      href="https://wa.me/971581784948"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tr("Chat with us on WhatsApp", "تواصل معنا عبر واتساب")}
      className="group fixed bottom-5 right-5 z-[100] flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:bottom-6 md:right-6"
      style={{ backgroundColor: "#25D366" }}
    >
      <span
        className="pointer-events-none absolute right-[64px] hidden whitespace-nowrap rounded-md bg-black/85 px-3 py-1.5 font-dm text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 md:block md:group-hover:opacity-100"
      >
        {tr("Chat with us", "تواصل معنا")}
      </span>
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#ffffff"
          d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.58-1.72A12.74 12.74 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16.001 3.2Zm0 23.36a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.9 1.02 1.04-3.8-.25-.39A10.55 10.55 0 1 1 26.56 16c0 5.83-4.73 10.56-10.56 10.56Zm5.78-7.9c-.32-.16-1.88-.93-2.17-1.04-.29-.1-.5-.16-.71.16-.21.32-.81 1.03-.99 1.24-.18.21-.36.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.36.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.07-1.1 2.61s1.13 3.03 1.29 3.24c.16.21 2.22 3.39 5.39 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    </a>
  );
}
