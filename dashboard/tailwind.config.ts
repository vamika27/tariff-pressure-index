import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E8",
        oat: "#FBF7F0",
        coffee: "#5C4632",
        latte: "#D8C3A5",
        sage: "#A8BFA0",
        honey: "#E0A85F",
        terracotta: "#C1654A"
      },
      fontFamily: {
        display: ["var(--font-quicksand)", "ui-rounded", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        cozy: "0 20px 45px rgba(92, 70, 50, 0.12)",
        soft: "0 12px 30px rgba(92, 70, 50, 0.09)"
      },
      borderRadius: {
        cozy: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
