import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        paper: "#FFFDF5",
        ink: "#2B2B33",
        primary: "#2D317A",
        secondary: "#6967AC",
        "secondary-soft": "#9A96CA",
        accent: "#CF4382",
        line: "#373737",
      },
      fontFamily: {
        sans: ["IRANYekan", "Tahoma", "sans-serif"],
        heading: ['"Noto Naskh Arabic"', "serif"],
      },
      maxWidth: {
        page: "76rem",
      },
    },
  },
} satisfies Config;
