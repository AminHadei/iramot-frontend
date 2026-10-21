export function usePageSeo(meta: {
  title: string;
  description?: string;
  type?: "website" | "article";
}) {
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogLocale: "fa_IR",
    ogType: meta.type ?? "website",
  });
}
