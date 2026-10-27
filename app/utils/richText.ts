const PLAIN_DESCRIPTION = new Set(["opportunity", "partner", "quarterly"]);

export function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(value);
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function htmlFromPlain(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return trimmed;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

export function plainFromSimpleHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^<p>([\s\S]*)<\/p>$/i);
  if (!match) return trimmed;
  const inner = match[1] ?? "";
  if (/<[a-z]/i.test(inner)) return trimmed;
  return decodeSimple(inner.replace(/<br\s*\/?>/gi, "\n")).trim();
}

export function htmlFromBlocks(value: unknown): string {
  if (typeof value === "string") return htmlFromPlain(value);
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => (typeof item === "string" ? htmlFromPlain(item) : ""))
    .filter(Boolean)
    .join("");
}

export function blocksFromHtml(html: string): string[] {
  const trimmed = html.trim();
  if (!trimmed) return [];
  const blocks: string[] = [];
  const pattern = /<([a-z0-9]+)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
  let found = false;
  for (const match of trimmed.matchAll(pattern)) {
    found = true;
    const block = match[0];
    const simple = block.match(/^<p>([\s\S]*)<\/p>$/i);
    if (simple && !/<[a-z]/i.test(simple[1] ?? "")) {
      const text = plainFromSimpleHtml(block);
      if (text) blocks.push(text);
      continue;
    }
    if (block.trim()) blocks.push(block);
  }
  if (found) return blocks;
  const text = plainFromSimpleHtml(trimmed);
  return text ? [text] : [];
}

export function htmlStorageKey(type: string, source: Record<string, unknown>): string {
  if (PLAIN_DESCRIPTION.has(type)) return "description";
  if (type === "term") return "text";
  if (type === "workgroup") return "body";
  if (
    type === "event" ||
    type === "project" ||
    type === "research" ||
    type === "award"
  ) {
    return "bodyHtml";
  }
  if (typeof source.bodyHtml === "string" && typeof source.contentHtml !== "string") {
    return "bodyHtml";
  }
  if (typeof source.body === "string" && typeof source.contentHtml !== "string") {
    return "body";
  }
  return "contentHtml";
}

function decodeSimple(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}
