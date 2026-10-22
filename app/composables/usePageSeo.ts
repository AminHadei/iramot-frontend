export function usePageSeo(meta: {
  title: string;
  description?: string;
  type?: "website" | "article";
}) {
  const request = useRequestURL();
  const base = useRuntimeConfig().app.baseURL;
  const root = new URL(base.endsWith("/") ? base : `${base}/`, request.origin);
  const ogImage = new URL("brand/logo-horizontal.webp", root).href;

  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogLocale: "fa_IR",
    ogType: meta.type ?? "website",
    ogImage,
    ogImageWidth: 361,
    ogImageHeight: 92,
    ogImageAlt: "انجمن مدیریت فناوری و نوآوری ایران",
  });
}
