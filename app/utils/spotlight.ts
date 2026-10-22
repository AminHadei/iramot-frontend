import type { SpotlightGroupRecord } from "~/types/content";

export interface SpotlightGroup {
  title: string;
  body: string;
  to: string;
  color?: number;
}

export function spotlightGroups(groups: SpotlightGroupRecord[]): SpotlightGroup[] {
  return groups.map((group) => ({
    title: group.title,
    body: group.body,
    to: group.link,
    color: group.color,
  }));
}
