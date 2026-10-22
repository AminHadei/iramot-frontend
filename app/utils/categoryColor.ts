export function categoryColor(index: number): Record<string, string> {
  const slot = (index % 5) + 1;
  const darkLabel = slot === 3 || slot === 5;
  return {
    "--color-category": `var(--color-category-${slot})`,
    "--color-on-category": darkLabel ? "var(--color-band)" : "var(--color-paper)",
  };
}
