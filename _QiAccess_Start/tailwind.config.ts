import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./docs/**/*.md"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#cbd5e1",
            "--tw-prose-headings": "#f8fafc",
            "--tw-prose-links": "#93c5fd",
            "--tw-prose-bold": "#f8fafc",
            "--tw-prose-counters": "#94a3b8",
            "--tw-prose-bullets": "#60a5fa",
            "--tw-prose-hr": "#243041",
            "--tw-prose-quotes": "#f8fafc",
            "--tw-prose-quote-borders": "#334155",
            "--tw-prose-captions": "#94a3b8",
            "--tw-prose-code": "#e2e8f0",
            "--tw-prose-pre-code": "#dbeafe",
            "--tw-prose-pre-bg": "#08111f",
            "--tw-prose-th-borders": "#334155",
            "--tw-prose-td-borders": "#243041",
          },
        },
      },
      fontFamily: {
        sans: ['"Outfit"', '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', "monospace"],
      },
      colors: {
        brand: {
          50: "#0f172a",
          100: "#13213b",
          200: "#1b335a",
          300: "#dbeafe",
          400: "#93c5fd",
          500: "#60a5fa",
          600: "#38bdf8",
          700: "#0ea5e9",
          900: "#eff6ff",
        },
        violet: {
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
        },
        surface: "#111827",
        "surface-2": "#0f172a",
        "surface-3": "#162133",
        border: "#243041",
        "border-strong": "#334155",
        heading: "#f8fafc",
        body: "#dbe4f0",
        muted: "#94a3b8",
        subtle: "#64748b",
        online: "#10b981",
        offline: "#f87171",
        unknown: "#f59e0b",
        accent: "#3b82f6",
      },
      boxShadow: {
        card: "0 10px 24px rgba(8,17,31,0.22)",
        "card-hover": "0 18px 40px rgba(8,17,31,0.42), 0 4px 18px rgba(37,99,235,0.18)",
        sidebar: "1px 0 0 rgba(36,48,65,0.95)",
        "ring-brand": "0 0 0 3px rgba(59,130,246,0.24)",
        "ring-focus": "0 0 0 3px rgba(59,130,246,0.34)",
      },
      animation: {
        "fade-up": "fade-up 380ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-in": "slide-in 280ms cubic-bezier(0.16,1,0.3,1) both",
        pulseSoft: "pulse-soft 2.8s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.86" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
