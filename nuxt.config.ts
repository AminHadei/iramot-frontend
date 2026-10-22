import { withBase } from "./app/utils/withBase";

// Root-absolute font urls are not prefixed by Vite. Apply app.baseURL once here.
function prefixPublicFontUrls() {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env;
  const base = env?.NUXT_APP_BASE_URL || "/";
  return {
    name: "prefix-public-font-urls",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!id.includes(".css") || !code.includes('url("/fonts/')) return;
      return code.replace(/url\("(\/fonts\/[^"]+)"\)/g, (_match, path: string) => {
        return `url("${withBase(base, path)}")`;
      });
    },
  };
}

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
      link: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      ],
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
  },
  vite: {
    plugins: [prefixPublicFontUrls()],
  },
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.ts",
  },
  postcss: {
    plugins: {
      // Tailwind 3 exposes nesting only as a directory import, which Nuxt cannot load as ESM.
      "tailwindcss/nesting": false,
    },
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
