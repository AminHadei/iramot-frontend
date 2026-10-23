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

export function awardListingPath(page: number, order?: "asc" | "desc") {
  const path = page > 1 ? `/award/page/${page}` : "/award";
  const query = order === "asc" ? "?order=asc" : "";
  return `${path}${query}#filter`;
}

export function conferenceListingPath(page: number, order?: "asc" | "desc") {
  const path = page > 1 ? `/conference/page/${page}` : "/conference";
  const query = order === "asc" ? "?order=asc" : "";
  return `${path}${query}#filter`;
}
