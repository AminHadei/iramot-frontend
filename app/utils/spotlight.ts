import type { SpotlightGroupRecord } from "~/types/content";

export interface SpotlightGroup {
  title: string;
  body: string;
  to: string;
  color?: number;
}

export function spotlightGroups(
  groups: SpotlightGroupRecord[],
  pathFor: (title: string) => string | undefined,
): SpotlightGroup[] {
  return groups.map((group) => ({
    title: group.title,
    body: group.body,
    to: pathFor(group.title) ?? "/workgroups",
    color: group.color,
  }));
}
