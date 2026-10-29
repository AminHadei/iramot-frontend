import panelFile from "~/copy/panel.json";
import type { PanelCopy } from "~/types/panel";

const panelCopy = panelFile as PanelCopy;

export async function usePanelCopy() {
  return panelCopy;
}

export async function useAccountPage(titleKey: string, descriptionKey: string) {
  const copy = await usePanelCopy();
  usePageSeo({
    title: copy.seo[titleKey] ?? titleKey,
    description: copy.seo[descriptionKey] ?? "",
  });
  return copy;
}
