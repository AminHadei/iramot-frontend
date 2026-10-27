function apiImageDomains(): string[] {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env;
  const raw = env?.NUXT_PUBLIC_API_BASE?.trim();
  if (!raw) return [];
  try {
    const hostname = new URL(raw).hostname;
    return hostname ? [hostname] : [];
  } catch {
    return [];
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-10-21",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "@nuxt/image"],
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
    "/auth/**": { ssr: false },
    "/panel/**": { ssr: false },
    "/admin/**": { ssr: false },
    "/payment/**": { ssr: false },
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
    "/opportunities/category/**": { redirect: "/opportunities" },
    "/آگهی-استخدام": { redirect: "/opportunities" },
    "/آگهی-استخدام-2": { redirect: "/opportunities" },
    "/استخدام-کارشناس-مدیریت-تکنولوژی-گروه": { redirect: "/opportunities" },
    "/category/جایزه-ملی-مدیریت-نوآوری": { redirect: "/award" },
    "/جایزه-ملی-مدیریت-فناوری-و-نوآوری": { redirect: "/award" },
  },
  runtimeConfig: {
    apiBaseInternal: "",
    public: {
      apiBase: "",
    },
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
    provider: "none",
    domains: apiImageDomains(),
    providers: {
      none: {
        name: "none",
        provider: "~/providers/none.ts",
      },
    },
  },
});
