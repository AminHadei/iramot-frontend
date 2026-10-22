export const aboutHashAliases: Record<string, string> = {
  aboutAssociation: "about",
  members: "board",
  team: "board",
  Statute: "statute",
};

export function aboutHashId(hash: string): string {
  const raw = decodeURIComponent(hash.replace(/^#/, ""));
  if (!raw) return "";
  return aboutHashAliases[raw] ?? raw;
}
