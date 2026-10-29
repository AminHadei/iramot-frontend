import type { GuideContent } from "~/types/content";
import { createApiGuideRepository } from "~/data/guides/api";

export async function useGuide(key: string) {
  const { data } = await useAsyncData(`guide-${key}`, () =>
    createApiGuideRepository(useContentApiBase()).get(key),
  );

  if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: "پیدا نشد" });
  }

  return data.value as GuideContent;
}
