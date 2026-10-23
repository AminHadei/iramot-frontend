export function categoryColor(index: number): Record<string, string> {
  const slot = (index % 4) + 1;
  const darkLabel = slot === 3;
  return {
    "--color-category": `var(--color-category-${slot})`,
    "--color-on-category": darkLabel ? "var(--color-band)" : "var(--color-paper)",
  };
}

const newsColorIndexBySlug: Record<string, number> = {
  "اخبار-فناوری": 0,
  "اخبار-آموزش": 1,
  "conference-news": 2,
  "اخبار-باشگاه": 0,
  "اخبار-کارگروه-زنان": 1,
  articles: 2,
  news: 0,
};

const newsCategoryOrder = [
  "اخبار-فناوری",
  "اخبار-آموزش",
  "اخبار-باشگاه",
  "conference-news",
  "اخبار-کارگروه-زنان",
  "articles",
];

export function newsColorIndex(slug: string): number {
  const fixed = newsColorIndexBySlug[slug];
  if (fixed !== undefined) return fixed;
  let sum = 0;
  for (const char of slug) sum += char.codePointAt(0) ?? 0;
  return sum % 3;
}

export function awardTopicColor(): Record<string, string> {
  return {
    "--color-category": "#3F50A0",
    "--color-on-category": "#FFFDF5",
    "--color-category-rgb": "63, 80, 160",
  };
}

export function newsCategoryColor(slug: string): Record<string, string> {
  const index = newsColorIndex(slug);
  const color = index === 1 ? "#6967AC" : index === 2 ? "#9A96CA" : "#2D317A";
  const rgb =
    index === 1 ? "105, 103, 172" : index === 2 ? "154, 150, 202" : "45, 49, 122";
  return {
    "--color-category": color,
    "--color-on-category": index === 2 ? "#06011E" : "#FFFDF5",
    "--color-category-rgb": rgb,
  };
}

export function primaryNewsCategory<T extends { slug: string }>(
  categories: T[],
  preferred?: string,
): T | undefined {
  if (preferred) {
    const match = categories.find((category) => category.slug === preferred);
    if (match) return match;
  }
  for (const slug of newsCategoryOrder) {
    const found = categories.find((category) => category.slug === slug);
    if (found) return found;
  }
  return categories.find((category) => category.slug === "news") ?? categories[0];
}

export function newsCategoryPath(slug?: string): string {
  if (slug === "conference-news") return "/conference";
  if (slug && newsCategoryOrder.includes(slug)) return `/news/category/${slug}`;
  return "/news";
}
