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
        canvas: "#FDFCF8",
        surface: "#FFFFFF",
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
        secondary: {
          DEFAULT: "#FF8C78", // Soft Coral
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4", // Borders
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c", // Text Muted
          600: "#57534e",
          700: "#44403c",
          800: "#292524", // Text Main
          900: "#1c1917",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem", // 12px
        button: "0.5rem", // 8px
      },
      boxShadow: {
        "soft-sm": "0 1px 2px 0 rgb(231 229 228 / 0.5)", // stone-200
        "soft-md":
          "0 4px 6px -1px rgb(231 229 228 / 0.5), 0 2px 4px -2px rgb(231 229 228 / 0.5)",
        "soft-lg":
          "0 10px 15px -3px rgb(231 229 228 / 0.5), 0 4px 6px -4px rgb(231 229 228 / 0.5)",
      },
    },
  },
  plugins: [],
};
