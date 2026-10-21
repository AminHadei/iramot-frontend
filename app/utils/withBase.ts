export function withBase(baseURL: string, src: string): string {
  if (src.startsWith("//") || /^[a-z][a-z\d+\-.]*:/i.test(src)) {
    return src;
  }

  const base = baseURL === "/" ? "" : baseURL.replace(/\/$/, "");
  const path = src.startsWith("/") ? src : `/${src}`;
  if (base && (path === base || path.startsWith(`${base}/`))) {
    return path;
  }

  return `${base}${path}`;
}
