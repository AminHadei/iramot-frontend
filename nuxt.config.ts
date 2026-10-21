// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-10-21",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "@nuxt/content", "@nuxt/image"],
  eslint: {
    config: {
      stylistic: false,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "fa",
        dir: "rtl",
      },
      title: "انجمن مدیریت فناوری و نوآوری ایران",
      titleTemplate: "%s | انجمن مدیریت فناوری و نوآوری ایران",
    },
  },
  routeRules: {
    "/**": { prerender: true },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        "/styleguide",
        "/the-launch-sequence",
        "/transit-abundance-playbook",
        "/economics-of-ideas",
        "/economics-of-ideas/syllabus",
        "/economics-of-ideas/apply",
        "/independent-filmmaker-project",
      ],
    },
    publicAssets: [
      {
        baseURL: "/fonts/iranyekan",
        dir: "app/assets/fonts/iranyekan",
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
  },
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.ts",
  },
  image: {
    providers: {
      none: {
        name: "none",
        provider: "~/providers/none.ts",
      },
    },
  },
});
