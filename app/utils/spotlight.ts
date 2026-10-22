import type { SpotlightGroupRecord } from "~/types/content";

export interface SpotlightGroup {
  title: string;
  body: string;
  to: string;
  icon?: string;
  color?: number;
}

export function spotlightGroups(groups: SpotlightGroupRecord[]): SpotlightGroup[] {
  return groups
    .filter((group) => group.enabled !== false)
    .map((group) => ({
      title: group.title,
      body: group.body,
      to: group.link,
      icon: group.icon,
      color: group.color,
    }));
}
