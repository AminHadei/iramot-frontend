export function formatAuthors(authors: string[] | undefined) {
  if (!authors?.length) {
    return "";
  }

  if (authors.length === 1) {
    return authors[0];
  }

  if (authors.length === 2) {
    return `${authors[0]} و ${authors[1]}`;
  }

  return `${authors.slice(0, -1).join("، ")} و ${authors.at(-1)}`;
}
