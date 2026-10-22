import type { ArchiveItem, CategorySet, ContentLink } from "~/types/content";
import { plainText } from "~/utils/plainText";
import { byDateDesc, itemInSet, researchPath } from "~/utils/archive";

export interface SpotlightGroup {
  title: string;
  body: string;
  to: string;
}

export function spotlightGroups(
  posts: ArchiveItem[],
  workgroups: CategorySet,
  publications: CategorySet,
  terminology: ContentLink & { body: string },
): SpotlightGroup[] {
  const groups: SpotlightGroup[] = [];
  const seen = new Set<string>();

  for (const item of byDateDesc(
    posts.filter((entry) => itemInSet(entry, workgroups)),
  )) {
    const specific = (item.categories ?? []).find(
      (category) =>
        category.slug !== "workgroups" &&
        (category.slug.includes("کارگروه") || category.name.includes("کارگروه")),
    );
    const key = specific?.slug ?? String(item.id);
    if (seen.has(key)) continue;
    seen.add(key);
    groups.push({
      title: specific?.name ?? item.title,
      body: plainText(item.excerpt || ""),
      to: itemInSet(item, publications) ? researchPath(item.slug) : "/workgroups",
    });
  }

  if (!groups.some((group) => group.to === terminology.to)) {
    groups.push({
      title: terminology.label,
      body: terminology.body,
      to: terminology.to,
    });
  }

  return groups;
}
