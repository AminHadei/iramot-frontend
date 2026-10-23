import { withBase } from "./app/utils/withBase";
import { eventPrerenderRoutes } from "./app/data/events/prerender-routes";
import { newsPrerenderRoutes } from "./app/data/news/prerender-routes";
import { termPrerenderRoutes } from "./app/data/terms/prerender-routes";
import { workgroupPrerenderRoutes } from "./app/data/workgroups/prerender-routes";

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
    "/statute": { redirect: "/about#statute" },
    "/contact": { redirect: "/about#contact" },
    "/research": { redirect: "/news" },
    "/committees": { redirect: "/workgroups" },
    "/کارگروه-واژه-گزینی": { redirect: "/workgroups/word-selection" },
    "/مدیریت-نوآوری": { redirect: "/workgroups/innovation-management-expertise" },
    "/category/quarterly-magazine": { redirect: "/news" },
    "/quarterlies/category/**": { redirect: "/quarterlies" },
    "/quarterlies/page/**": { redirect: "/quarterlies" },
    "/award/category/**": { redirect: "/award" },
    "/conference/category/**": { redirect: "/conference" },
    "/category/جایزه-ملی-مدیریت-نوآوری": { redirect: "/award" },
    "/جایزه-ملی-مدیریت-فناوری-و-نوآوری": { redirect: "/award" },
  },
  runtimeConfig: {
    public: {
      newsSource: "json",
      newsApiBase: "",
      termsSource: "json",
      termsApiBase: "",
      eventsSource: "json",
      eventsApiBase: "",
      partnersSource: "json",
      partnersApiBase: "",
      quarterliesSource: "json",
      quarterliesApiBase: "",
    },
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
        "/statute",
        "/contact",
        "/committees",
        "/کارگروه-واژه-گزینی",
        "/مدیریت-نوآوری",
        "/کارگروه-متناظر-استانداردسازی-مدیریت",
        "/category/quarterly-magazine",
        "/quarterlies/category/quarterly-magazine",
        "/quarterlies/category/فصلنامه-سیاست-علم-و-فناوری",
        "/quarterlies/page/2",
        "/award/category/جایزه-ملی-مدیریت-نوآوری",
        "/category/جایزه-ملی-مدیریت-نوآوری",
        "/جایزه-ملی-مدیریت-فناوری-و-نوآوری",
        ...newsPrerenderRoutes,
        ...termPrerenderRoutes,
        ...eventPrerenderRoutes,
        ...workgroupPrerenderRoutes,
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
