const tones = [
  { category: "#2D317A", on: "#FFFDF5" },
  { category: "#6967AC", on: "#FFFDF5" },
  { category: "#9A96CA", on: "#06011E" },
] as const;

export function workgroupTone(colorIndex: number): Record<string, string> {
  const tone = tones[colorIndex] ?? tones[0];
  return {
    "--color-category": tone.category,
    "--color-on-category": tone.on,
  };
}
