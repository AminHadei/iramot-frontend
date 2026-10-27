import type { GuideContent } from "~/types/content";
import { createApiGuideRepository } from "~/data/guides/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export async function useGuide(key: string) {
  const config = useRuntimeConfig();
  const { data } = await useAsyncData(`guide-${key}`, async () => {
    return withJsonFallback(
      sectionMode(config.public, "guides"),
      () => createApiGuideRepository(sectionApiBase(config.public, "guides")).get(key),
      async () => {
        const guides = await queryCollection("guides").all();
        return guides.find((guide) => guide.key === key) ?? null;
      },
    );
  });

  if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: "پیدا نشد" });
  }

  return data.value as GuideContent;
}
