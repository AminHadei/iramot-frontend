import type { Config } from "tailwindcss";

export default {
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        paper: "#FFFDF5",
        ink: "#2B2B33",
        primary: "#2D317A",
        secondary: "#6967AC",
        "secondary-soft": "#9A96CA",
        accent: "#6866AD",
        line: "#373737",
      },
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "sans-serif"],
        heading: ['"Noto Naskh Arabic"', "serif"],
      },
      maxWidth: {
        page: "76rem",
      },
      screens: {
        sm: "640px",
        wide: "720px",
        md: "768px",
        frame: "980px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
} satisfies Config;
