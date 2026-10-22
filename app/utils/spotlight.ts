import type { ArchiveItem, CategorySet } from "~/types/content";
import { plainText } from "~/utils/plainText";
import { byDateDesc, categoryInSet, itemInSet, researchPath } from "~/utils/archive";

export interface SpotlightGroup {
  title: string;
  body: string;
  to: string;
}

export function spotlightGroups(
  posts: ArchiveItem[],
  publications: CategorySet,
  terminologyTo: string,
): SpotlightGroup[] {
  const groups: SpotlightGroup[] = [];
  const seen = new Set<string>();

  for (const item of byDateDesc(posts)) {
    const specific = (item.categories ?? []).find(
      (category) =>
        category.slug !== "workgroups" &&
        (category.slug.includes("کارگروه") || category.name.includes("کارگروه")),
    );
    if (!specific || seen.has(specific.slug)) continue;
    seen.add(specific.slug);

    let to = "/workgroups";
    if (specific.slug.includes("واژه") || specific.name.includes("واژه")) {
      to = terminologyTo;
    } else if (categoryInSet(specific.slug, publications)) {
      to = `/research/category/${specific.slug}`;
    } else if (itemInSet(item, publications)) {
      to = researchPath(item.slug);
    }

    groups.push({
      title: specific.name,
      body: plainText(item.excerpt || ""),
      to,
    });
  }

  return groups;
}
