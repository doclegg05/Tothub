/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F9FAFB", // Cool Gray 50
        surface: "#FFFFFF", // Pure White
        primary: {
          DEFAULT: "#0F766E", // Deep Teal
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb", // Borders
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280", // Text Muted
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827", // Headings
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem", // 16px (rounded-2xl)
        button: "0.5rem", // 8px
      },
      boxShadow: {
        "soft-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "soft-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "soft-lg":
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
