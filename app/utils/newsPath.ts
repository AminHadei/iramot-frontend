export function newsListingPath(
  page: number,
  category?: string,
  order?: "asc" | "desc",
) {
  const root = category ? `/news/category/${category}` : "/news";
  const path = page > 1 ? `${root}/page/${page}` : root;
  const query = order === "asc" ? "?order=asc" : "";
  return `${path}${query}#filter`;
}
