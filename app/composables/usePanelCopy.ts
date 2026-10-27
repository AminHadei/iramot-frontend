import type { PanelCopy } from "~/types/panel";

function readCopy(row: unknown): PanelCopy | null {
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  let nested: Record<string, unknown> | null = null;
  if (typeof record.meta === "string") {
    try {
      const parsed = JSON.parse(record.meta) as unknown;
      if (parsed && typeof parsed === "object")
        nested = parsed as Record<string, unknown>;
    } catch {
      nested = null;
    }
  } else if (record.meta && typeof record.meta === "object") {
    nested = record.meta as Record<string, unknown>;
  }
  const copy = (nested?.seo
    ? { ...record, ...nested }
    : record) as unknown as PanelCopy;
  if (!copy.seo || !copy.fields) return null;
  return copy;
}

export async function usePanelCopy() {
  const { data } = await useAsyncData("panel-copy", () =>
    queryCollection("panel").first(),
  );
  const copy = readCopy(data.value);
  if (!copy) {
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
