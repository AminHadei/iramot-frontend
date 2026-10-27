import type { PanelCopy } from "~/types/panel";

export async function usePanelCopy() {
  const { data } = await useAsyncData("panel-copy", () =>
    queryCollection("panel").first(),
  );
  const copy = data.value as PanelCopy | null;
  if (!copy?.seo || !copy.fields) {
    throw createError({ statusCode: 500, statusMessage: "Panel copy is missing" });
  }
  return copy;
}

export async function useAccountPage(titleKey: string, descriptionKey: string) {
  const copy = await usePanelCopy();
  usePageSeo({
    title: copy.seo[titleKey] ?? titleKey,
    description: copy.seo[descriptionKey] ?? "",
  });
  return copy;
}
