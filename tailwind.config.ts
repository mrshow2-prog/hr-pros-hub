import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        serif: ['var(--cv-font-display, Fraunces)', 'Georgia', 'serif'],
        syne: ['var(--cv-font-display, "DM Sans")', 'system-ui', 'sans-serif'],
        dm: ['var(--cv-font-body, "DM Sans")', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['var(--cv-font-display, "DM Sans")', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        ink: { DEFAULT: "hsl(var(--ink))", elev: "hsl(var(--ink-elev))" },
        paper: "hsl(var(--paper))",
        clay: "hsl(var(--clay))",
        stone: "hsl(var(--stone))",
        blush: "hsl(var(--blush))",
        sienna: "hsl(var(--sienna))",
        umber: "hsl(var(--umber))",
        olive: "hsl(var(--olive))",
        surface: { DEFAULT: "hsl(var(--surface))", soft: "hsl(var(--surface-soft))" },
        risk: {
          red: "hsl(var(--risk-red))",
          amber: "hsl(var(--risk-amber))",
          blue: "hsl(var(--risk-blue))",
          purple: "hsl(var(--risk-purple))",
          green: "hsl(var(--risk-green))",
        },
        career: {
          bg: "hsl(var(--career-bg))",
          surface: "hsl(var(--career-surface))",
          deep: "hsl(var(--career-deep))",
          blue: "hsl(var(--career-blue))",
          sky: "hsl(var(--career-sky))",
          light: "hsl(var(--career-light))",
          border: "hsl(var(--career-border))",
        },

        /* backward-compat aliases — keeps existing components building */
        cream: { DEFAULT: "hsl(var(--paper))", warm: "hsl(var(--clay))" },
        terracotta: {
          DEFAULT: "hsl(var(--sienna))",
          deep: "hsl(var(--umber))",
          soft: "hsl(var(--blush))",
        },
        moss: "hsl(var(--olive))",
        navy: {
          DEFAULT: "hsl(var(--olive))",
          deep: "hsl(var(--umber))",
          soft: "hsl(var(--stone))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        wider2: "0.12em",
        widest2: "0.18em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        marquee: "marquee 38s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
