export function plainText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\/?[a-zA-Z_:][^\]]*\]/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
