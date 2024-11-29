import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F9FA",
        primary: "#636AE8",
        primaryHover: "#161D96",
        secondary: "#E8618C",
        secondaryHover: "#AC2B54",
        heading: "#171A1F",
        subHeading: "#424955",
        placeholder: "#BCC1CA",
        stroke: "#BCC1CA",
        success: "#10BC17",
        error: "#913838",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        archivo: ["Archivo"],
      },
      boxShadow: {
        button: "0 5px 10px 0 rgba(0, 0, 0, 0.15)",
        buttonHover: "0 3px 6px 0 rgba(0, 0, 0, 0.15)",
        card: "0 0 2px 0 rgba(23, 26, 31, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
