import { withBase } from "~/utils/withBase";

const storagePath = /^\/(?:uploads|storage|files|media\/files)(?:\/|$)/;
const filePath = /\.(?:png|jpe?g|webp|gif|svg|avif|pdf)(?:[?#].*)?$/i;
const mediaKeys = new Set([
  "image",
  "src",
  "photo",
  "poster",
  "logo",
  "cover",
  "url",
  "localPath",
]);

export interface MediaContext {
  apiBase?: string;
  siteBase: string;
}

export function isAbsoluteUrl(src: string): boolean {
  return src.startsWith("//") || /^[a-z][a-z\d+\-.]*:/i.test(src);
}

export function apiOrigin(apiBase: string): string {
  try {
    return new URL(apiBase).origin;
  } catch {
    return apiBase.replace(/\/$/, "");
  }
}

export function resolveContentFile(
  src: string | null | undefined,
  options: MediaContext,
): string | undefined {
  const value = src?.trim();
  if (!value) return undefined;
  if (isAbsoluteUrl(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  if (options.apiBase && storagePath.test(path)) {
    return `${apiOrigin(options.apiBase)}${path}`;
  }
  return withBase(options.siteBase, path);
}

function shouldResolve(value: string): boolean {
  if (isAbsoluteUrl(value)) return true;
  const path = value.startsWith("/") ? value : `/${value}`;
  return storagePath.test(path) || filePath.test(path);
}

export function rewriteMediaTree<T>(value: T, options: MediaContext): T {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteMediaTree(item, options)) as T;
  }
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    if (typeof child === "string" && mediaKeys.has(key) && shouldResolve(child)) {
      next[key] = resolveContentFile(child, options) ?? child;
    } else {
      next[key] = rewriteMediaTree(child, options);
    }
  }
  return next as T;
}

export function rewriteStorageHtml(html: string, apiBase: string): string {
  if (!html || !apiBase) return html;
  const origin = apiOrigin(apiBase);
  return html.replace(
    /(src|href)=(["'])(\/(?:uploads|storage|files|media\/files)\/[^"']*)\2/gi,
    (_match, attr: string, quote: string, path: string) =>
      `${attr}=${quote}${origin}${path}${quote}`,
  );
}
