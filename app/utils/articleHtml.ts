import { plainText } from "~/utils/plainText";

export interface ArticleHeading {
  id: string;
  label: string;
}

const blocked =
  /<(script|style|iframe|object|embed|noscript|form)\b[^>]*>[\s\S]*?<\/\1>/gi;
const blockedVoid = /<(script|style|iframe|object|embed|noscript|form)\b[^>]*\/?>/gi;

function cleanTag(tag: string) {
  return tag
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript:|data:)[^"']*\2/gi, "");
}

export function articleHtml(source: string): { html: string; toc: ArticleHeading[] } {
  const cleaned = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(blocked, "")
    .replace(blockedVoid, "")
    .replace(/\[\/?[a-zA-Z_:][^\]]*\]/g, "")
    .replace(/<[^>]+>/g, cleanTag);

  const toc: ArticleHeading[] = [];
  let index = 0;
  const html = cleaned.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      index += 1;
      const id = `section-${index}`;
      const label = plainText(inner);
      if (label) toc.push({ id, label });
      const withoutId = attrs.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/i, "");
      return `<h${level}${withoutId} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html, toc };
}
