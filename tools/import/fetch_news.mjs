#!/usr/bin/env node
// Pull every iramot.ir news post (category «اخبار» id 119 + all child categories) via the WP REST API
// and write normalized JSON. Node >= 18, no dependencies.
// Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 node fetch_news.mjs [out.json]
//   env: WP_BASE (default https://iramot.ir), NEWS_CAT (default 119), PER_PAGE (default 50)
import { writeFile } from "node:fs/promises";

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BASE = (process.env.WP_BASE || "https://iramot.ir").replace(/\/$/, "");
const ROOT_CAT = Number(process.env.NEWS_CAT || 119);
const PER_PAGE = Number(process.env.PER_PAGE || 50); // 100 works, but _embed responses get large
const OUT = process.argv[2] || "news.json";
const api = (p) => `${BASE}/wp-json/wp/v2/${p}`;

async function get(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "irmot-migrate/1.0" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return { json: await r.json(), headers: r.headers };
    } catch (e) {
      if (i >= tries) throw e;
      await new Promise((s) => setTimeout(s, 1000 * i));
    }
  }
}
const decode = (s = "") =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&hellip;/g, "…")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const stripTags = (h = "") =>
  decode(h.replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
const safeDecodeURI = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function main() {
  // 1. categories: root + descendants
  const { json: cats } = await get(
    api("categories?per_page=100&_fields=id,slug,name,parent,count"),
  );
  const byId = new Map(
    cats.map((c) => [
      c.id,
      { id: c.id, slug: safeDecodeURI(c.slug), name: decode(c.name), parent: c.parent },
    ]),
  );
  const newsIds = new Set([ROOT_CAT]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of cats)
      if (newsIds.has(c.parent) && !newsIds.has(c.id)) {
        newsIds.add(c.id);
        grew = true;
      }
  }

  // 2. posts, paginated via X-WP-TotalPages
  const q = `posts?per_page=${PER_PAGE}&categories=${[...newsIds].join(",")}&orderby=date&order=desc&_embed=author,wp:featuredmedia,wp:term`;
  const first = await get(api(`${q}&page=1`));
  const total = Number(first.headers.get("x-wp-total"));
  const pages = Number(first.headers.get("x-wp-totalpages"));
  let raw = first.json;
  for (let p = 2; p <= pages; p++) {
    raw = raw.concat((await get(api(`${q}&page=${p}`))).json);
    process.stderr.write(`page ${p}/${pages}\n`);
  }

  // 3. normalize
  const items = raw.map((p) => {
    const media = p._embedded?.["wp:featuredmedia"]?.[0];
    const okMedia = media && !media.code && media.source_url;
    const terms = (p._embedded?.["wp:term"] || []).flat();
    const author = p._embedded?.author?.[0];
    return {
      id: p.id,
      slug: safeDecodeURI(p.slug),
      title: decode(p.title?.rendered || ""),
      date: p.date, // site-local (Asia/Tehran)
      dateGmt: p.date_gmt,
      modified: p.modified,
      link: p.link,
      excerpt: stripTags(p.excerpt?.rendered),
      contentHtml: p.content?.rendered || "",
      image: okMedia
        ? {
            url: media.source_url,
            width: media.media_details?.width ?? null,
            height: media.media_details?.height ?? null,
            alt: decode(media.alt_text || ""),
          }
        : null,
      categories: p.categories
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map(({ slug, name }) => ({ slug, name })),
      tags: terms
        .filter((t) => t.taxonomy === "post_tag")
        .map((t) => ({ slug: safeDecodeURI(t.slug), name: decode(t.name) })),
      author:
        author && !author.code
          ? { id: author.id, name: decode(author.name), slug: author.slug }
          : { id: p.author, name: null, slug: null },
    };
  });

  const out = {
    source: `${BASE}/wp-json/wp/v2/posts`,
    fetchedAt: new Date().toISOString(),
    categories: [...newsIds].map((id) => byId.get(id)).filter(Boolean),
    total,
    items,
  };
  await writeFile(OUT, JSON.stringify(out, null, 2));
  const noImg = items.filter((i) => !i.image).length;
  console.log(
    JSON.stringify({
      total,
      pages,
      fetched: items.length,
      unique: new Set(items.map((i) => i.id)).size,
      withoutImage: noImg,
      out: OUT,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
