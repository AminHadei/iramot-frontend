import type { GuideContent } from "~/types/content";

export async function useGuide(key: string) {
  const { data } = await useAsyncData(`guide-${key}`, async () => {
    const guides = await queryCollection("guides").all();
    return guides.find((guide) => guide.key === key) ?? null;
  });

  if (!data.value) {
    throw createError({ statusCode: 404, statusMessage: "پیدا نشد" });
  }

  return data.value as GuideContent;
}
