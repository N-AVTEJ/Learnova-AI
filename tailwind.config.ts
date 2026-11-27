import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.025em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.01em", fontWeight: "500" }],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          violet: "var(--accent-violet)",
          blue: "var(--accent-blue)",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
      },
      boxShadow: {
        surface: "0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        glow: "0 0 24px -4px rgba(124, 58, 237, 0.45), 0 0 12px -2px rgba(59, 130, 246, 0.3)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
        "brand-gradient-hover": "linear-gradient(135deg, #8B5CF6 0%, #60A5FA 100%)",
        "radial-spotlight":
          "radial-gradient(600px circle at 50% 0%, rgba(124, 58, 237, 0.14), rgba(59, 130, 246, 0.06) 45%, transparent 75%)",
      },
    },
  },
  plugins: [],
};

export default config;
