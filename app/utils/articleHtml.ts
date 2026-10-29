import { isUploadPath, resolveContentFile } from "~/utils/mediaUrl";
import { plainText } from "~/utils/plainText";
import { sanitizePublicHtml } from "~/utils/sanitizeHtml";
import { withBase } from "~/utils/withBase";

export interface ArticleHeading {
  id: string;
  label: string;
  level: 2 | 3;
}

const blocked =
  /<(script|style|iframe|object|embed|noscript|form)\b[^>]*>[\s\S]*?<\/\1>/gi;
const blockedVoid = /<(script|style|iframe|object|embed|noscript|form)\b[^>]*\/?>/gi;

function prefixMedia(siteBase: string, value: string, mediaBase: string): string {
  return value
    .split(",")
    .map((part) => {
      const bits = part.trim().split(/\s+/);
      const url = bits[0];
      if (!url || !isUploadPath(url)) return part.trim();
      bits[0] = resolveContentFile(url, { apiBase: mediaBase, siteBase }) ?? url;
      return bits.join(" ");
    })
    .join(", ");
}

function cleanTag(tag: string, siteBase: string, mediaBase: string) {
  return tag
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript:|data:)[^"']*\2/gi, "")
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(/\s+(srcset|sizes)\s*=\s*("[^"]*"|'[^']*')/gi, "")
    .replace(
      /\s+src\s*=\s*(["'])([^"']*)\1/gi,
      (match, quote: string, value: string) => {
        if (!isUploadPath(value)) return match;
        return ` src=${quote}${prefixMedia(siteBase, value, mediaBase)}${quote}`;
      },
    )
    .replace(
      /\s+href\s*=\s*(["'])([^"']*)\1/gi,
      (match, quote: string, value: string) => {
        if (!isUploadPath(value)) return match;
        const next =
          resolveContentFile(value, { apiBase: mediaBase, siteBase }) ?? value;
        return ` href=${quote}${next}${quote}`;
      },
    );
}

function newsHref(
  href: string,
  baseURL: string,
  slugs: ReadonlySet<string>,
): string | null {
  if (!/iramot\.ir/i.test(href)) return null;
  let pathname: string;
  try {
    pathname = new URL(href).pathname;
  } catch {
    return null;
  }
  const parts = pathname.split("/").filter(Boolean);
  const head = parts[0] ?? "";
  if (
    ["category", "tag", "author", "wp-content", "wp-json", "wp-admin"].includes(head)
  ) {
    return null;
  }
  const last = parts.at(-1);
  if (!last) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(last);
  } catch {
    slug = last;
  }
  if (!slugs.has(slug)) return null;
  return withBase(baseURL, `/news/${slug}`);
}

function rewriteIramotLinks(
  html: string,
  baseURL: string,
  slugs?: ReadonlySet<string>,
) {
  if (!slugs?.size) return html;
  return html.replace(
    /href=(["'])([^"']+)\1/gi,
    (match, quote: string, href: string) => {
      const next = newsHref(href, baseURL, slugs);
      return next ? `href=${quote}${next}${quote}` : match;
    },
  );
}

export function articleHtml(
  source: string,
  baseURL = "/",
  slugs?: ReadonlySet<string>,
  mediaBase = "",
): { html: string; toc: ArticleHeading[] } {
  const cleaned = rewriteIramotLinks(
    source
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(blocked, "")
      .replace(blockedVoid, "")
      .replace(/\[\/?[a-zA-Z_:][^\]]*\]/g, "")
      .replace(/<[^>]+>/g, (tag) => cleanTag(tag, baseURL, mediaBase)),
    baseURL,
    slugs,
  );

  const toc: ArticleHeading[] = [];
  let index = 0;
  const html = cleaned.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, depth: string, attrs: string, inner: string) => {
      index += 1;
      const id = `section-${index}`;
      const label = plainText(inner);
      const level = depth === "3" ? 3 : 2;
      if (label) toc.push({ id, label, level });
      const withoutId = attrs.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/i, "");
      return `<h${depth}${withoutId} id="${id}">${inner}</h${depth}>`;
    },
  );

  return { html: sanitizePublicHtml(html), toc };
}
