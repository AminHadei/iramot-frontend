#!/usr/bin/env node
// Split the fetched news JSON into public/data/news and resize referenced images.
// Usage: node tools/import/build_news_data.mjs [news.json] [articles.json]
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const publicDir = path.join(root, "public");
const raster = /\.(jpe?g|png|gif|webp|avif|bmp|tiff?)$/i;
const newsFile = process.argv[2] || "/tmp/iramot-news.json";
const articlesFile = process.argv[3] || "/tmp/iramot-articles.json";
const filterOrder = [
  "اخبار-فناوری",
  "اخبار-آموزش",
  "اخبار-باشگاه",
  "conference-news",
  "اخبار-کارگروه-زنان",
  "articles",
];

function decodePath(value) {
  const clean = value.split("?")[0] ?? value;
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

function mediaPath(url) {
  if (!url) return null;
  let pathname = url;
  try {
    if (/^https?:/i.test(url)) pathname = new URL(url).pathname;
  } catch {
    return null;
  }
  pathname = decodePath(pathname);
  const uploads = pathname.match(/\/wp-content\/uploads\/(.+)$/);
  const media = pathname.match(/\/media\/(.+)$/);
  const relative = uploads
    ? `/media/${uploads[1]}`
    : media
      ? `/media/${media[1]}`
      : null;
  if (!relative) return null;
  const absolute = path.join(publicDir, relative.replace(/^\//, ""));
  if (existsSync(absolute)) return absolute;
  const unsized = absolute.replace(/-\d+x\d+(?=\.[^.]+$)/, "");
  if (unsized !== absolute && existsSync(unsized)) return unsized;
  return null;
}

const converted = new Map();

async function toWebp(absolute) {
  if (converted.has(absolute)) return converted.get(absolute);
  const pending = (async () => {
    const hash = createHash("sha1").update(absolute).digest("hex").slice(0, 16);
    const url = `/media/news/${hash}.webp`;
    const output = path.join(publicDir, "media/news", `${hash}.webp`);
    await mkdir(path.dirname(output), { recursive: true });
    await exec("magick", [
      absolute,
      "-auto-orient",
      "-resize",
      "1200x>",
      "-quality",
      "82",
      output,
    ]);
    const { stdout } = await exec("magick", ["identify", "-format", "%w %h", output]);
    const [width, height] = stdout.trim().split(/\s+/).map(Number);
    return { url, width, height };
  })().catch((error) => {
    console.error(
      `skip ${absolute}: ${error instanceof Error ? error.message : error}`,
    );
    return null;
  });
  converted.set(absolute, pending);
  return pending;
}

async function pool(items, limit, worker) {
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

function imageSources(html) {
  return [...html.matchAll(/<img\b[^>]*\ssrc=(["'])([^"']+)\1/gi)].map(
    (match) => match[2],
  );
}

function authorOf(author) {
  if (!author || author.name == null) {
    return author?.id
      ? { id: author.id, name: author.name ?? null, slug: author.slug ?? null }
      : null;
  }
  return { id: author.id, name: author.name, slug: author.slug ?? null };
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function summaryOf(item, image) {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    date: item.date,
    excerpt: item.excerpt || "",
    image,
    categories: (item.categories || []).map((category) => ({
      slug: category.slug,
      name: category.name,
    })),
    author: authorOf(item.author),
  };
}

async function main() {
  const news = JSON.parse(await readFile(newsFile, "utf8"));
  const articles = existsSync(articlesFile)
    ? JSON.parse(await readFile(articlesFile, "utf8"))
    : { items: [] };
  const posts = JSON.parse(
    await readFile(path.join(root, "content/posts.json"), "utf8"),
  );
  const archived = new Map(posts.map((post) => [post.id, post]));
  const feedSlugs = new Set((news.categories || []).map((category) => category.slug));
  const names = new Map();
  for (const category of news.categories || []) names.set(category.slug, category.name);

  const merged = [...news.items];
  const seenIds = new Set(merged.map((item) => item.id));
  let articlesOnly = 0;
  for (const item of articles.items || []) {
    if (seenIds.has(item.id)) continue;
    const inFeed = (item.categories || []).some((category) =>
      feedSlugs.has(category.slug),
    );
    const isArticle = (item.categories || []).some(
      (category) => category.slug === "articles",
    );
    if (!inFeed && !isArticle) continue;
    merged.push(item);
    seenIds.add(item.id);
    if (!inFeed) articlesOnly += 1;
  }

  const slugs = new Set();
  for (const item of merged) {
    for (const category of item.categories || [])
      names.set(category.slug, category.name);
    if (slugs.has(item.slug)) item.slug = `${item.slug}-${item.id}`;
    slugs.add(item.slug);
  }

  const locals = new Set();
  const featuredLocal = new Map();
  for (const item of merged) {
    const fromArchive = archived.get(item.id)?.featuredImage?.localPath;
    const featured = mediaPath(fromArchive) || mediaPath(item.image?.url);
    if (featured && raster.test(featured)) {
      featuredLocal.set(item.id, featured);
      locals.add(featured);
    }
    for (const src of imageSources(item.contentHtml || "")) {
      const local = mediaPath(src);
      if (local && raster.test(local)) locals.add(local);
    }
  }

  let done = 0;
  await pool([...locals], 4, async (absolute) => {
    await toWebp(absolute);
    done += 1;
    if (done % 50 === 0) console.error(`images ${done}/${locals.size}`);
  });
  console.error(`images ${done}/${locals.size}`);
  const ready = new Map();
  for (const [absolute, pending] of converted) ready.set(absolute, await pending);

  const outDir = path.join(publicDir, "data/news/posts");
  await mkdir(outDir, { recursive: true });
  const indexItems = [];
  let missingImage = 0;

  for (const item of merged) {
    const fromNews = news.items.some((entry) => entry.id === item.id);
    const featuredSource = featuredLocal.get(item.id);
    const featured = featuredSource ? ready.get(featuredSource) : null;
    if (!featured) missingImage += 1;
    let html = item.contentHtml || "";
    html = html.replace(/<img\b[^>]*>/gi, (tag) => {
      const src = tag.match(/\ssrc=(["'])([^"']+)\1/i)?.[2];
      const local = src ? mediaPath(src) : null;
      const image = local ? ready.get(local) : null;
      if (!image) return "";
      return `<img src="${image.url}" width="${image.width}" height="${image.height}" alt="">`;
    });
    if (featured && !html.includes(featured.url)) {
      const alt = escapeAttr(item.image?.alt || "");
      const caption = alt
        ? `<figcaption class="wp-element-caption">${alt}</figcaption>`
        : "";
      html = `<figure class="wp-block-image"><img src="${featured.url}" width="${featured.width}" height="${featured.height}" alt="${alt}">${caption}</figure>\n${html}`;
    }
    const image = featured
      ? {
          url: featured.url,
          width: featured.width,
          height: featured.height,
          alt: item.image?.alt || "",
        }
      : null;
    const summary = { ...summaryOf(item, image), feed: fromNews };
    indexItems.push(summary);
    const post = { ...summary };
    delete post.feed;
    await writeFile(
      path.join(outDir, `${item.id}.json`),
      JSON.stringify({ ...post, contentHtml: html }),
    );
  }

  indexItems.sort(
    (left, right) => right.date.localeCompare(left.date) || right.id - left.id,
  );
  const filters = filterOrder
    .filter((slug) => names.has(slug))
    .map((slug) => ({ slug, name: names.get(slug) }));
  await writeFile(
    path.join(publicDir, "data/news/index.json"),
    JSON.stringify({ filters, items: indexItems }),
  );
  await writePrerenderRoutes({ filters, items: indexItems });

  const removed = await pruneMedia();
  const kept = indexItems.filter((item) => item.feed).length;
  console.log(
    JSON.stringify({
      total: indexItems.length,
      feed: kept,
      articlesOnly,
      missingImage,
      removedFiles: removed.files,
      removedBytes: removed.bytes,
      has1520: indexItems.some((item) => item.id === 1520),
    }),
  );
}

function referencedMedia(text, ignoreSrcset) {
  const source = ignoreSrcset
    ? text.replace(/\ssrcset\s*=\s*("[^"]*"|'[^']*')/gi, "")
    : text;
  const refs = new Set();
  for (const match of source.matchAll(/\/media\/[^\s"'<>\\)]+/g)) {
    refs.add(decodePath(match[0]).replace(/[),.;]+$/, ""));
  }
  return refs;
}

async function walk(dir, files) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute, files);
    else files.push(absolute);
  }
}

async function pruneMedia() {
  const keep = new Set();
  async function scan(dir, ignoreSrcset) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".output" ||
          entry.name === ".nuxt"
        )
          continue;
        await scan(absolute, ignoreSrcset || entry.name === "posts.json");
        continue;
      }
      if (!/\.(vue|ts|js|mjs|yml|yaml|json|md|css|html)$/.test(entry.name)) continue;
      if (absolute.includes(`${path.sep}public${path.sep}media${path.sep}`)) continue;
      const text = await readFile(absolute, "utf8");
      const dropSrcset = ignoreSrcset || entry.name.endsWith(".json");
      for (const ref of referencedMedia(text, dropSrcset)) keep.add(ref);
    }
  }
  await scan(path.join(root, "content"), false);
  await scan(path.join(root, "app"), false);
  await scan(path.join(root, "public/data"), false);
  if (![...keep].some((ref) => ref.includes("/media/about/"))) {
    console.error("refuse to prune media: about images are not referenced");
    return { files: 0, bytes: 0 };
  }
  const files = [];
  await walk(path.join(publicDir, "media"), files);
  let removedFiles = 0;
  let removedBytes = 0;
  for (const absolute of files) {
    const relative = `/media/${path.relative(path.join(publicDir, "media"), absolute).split(path.sep).join("/")}`;
    if (keep.has(relative) || relative.startsWith("/media/news/")) continue;
    const info = await stat(absolute);
    await rm(absolute);
    removedFiles += 1;
    removedBytes += info.size;
  }
  return { files: removedFiles, bytes: removedBytes };
}

async function writePrerenderRoutes(data) {
  const perPage = 16;
  const routes = new Set(["/news", "/research"]);
  const addPages = (count, prefix) => {
    const pages = Math.ceil(count / perPage);
    for (let page = 2; page <= pages; page += 1) routes.add(`${prefix}/page/${page}`);
  };
  addPages(data.items.filter((item) => item.feed).length, "/news");
  addPages(data.items.filter((item) => item.feed).length, "/research");
  for (const filter of data.filters) {
    const count = data.items.filter((item) =>
      item.categories.some((category) => category.slug === filter.slug),
    ).length;
    routes.add(`/news/category/${filter.slug}`);
    routes.add(`/research/category/${filter.slug}`);
    addPages(count, `/news/category/${filter.slug}`);
    addPages(count, `/research/category/${filter.slug}`);
  }
  for (const item of data.items) {
    routes.add(`/news/${item.slug}`);
    routes.add(`/research/${item.slug}`);
  }
  await mkdir(path.join(root, "app/data/news"), { recursive: true });
  await writeFile(
    path.join(root, "app/data/news/prerender-routes.ts"),
    `export const newsPrerenderRoutes = ${JSON.stringify([...routes], null, 2)};\n`,
  );
}

async function relink() {
  const mediaDir = path.join(publicDir, "media");
  const files = [];
  await walk(mediaDir, files);
  const pairs = [];
  for (const absolute of files) {
    if (!raster.test(absolute) || absolute.includes(`${path.sep}news${path.sep}`))
      continue;
    const hash = createHash("sha1").update(absolute).digest("hex").slice(0, 16);
    const url = `/media/news/${hash}.webp`;
    if (!existsSync(path.join(publicDir, url.replace(/^\//, "")))) continue;
    const relative = `/media/${path.relative(mediaDir, absolute).split(path.sep).join("/")}`;
    pairs.push({ relative, url });
  }
  pairs.sort((left, right) => right.relative.length - left.relative.length);
  let rewritten = 0;
  async function rewrite(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", ".output", ".nuxt", "media"].includes(entry.name))
          continue;
        await rewrite(absolute);
        continue;
      }
      if (!/\.(vue|ts|js|mjs|yml|yaml|json|md|css|html)$/.test(entry.name)) continue;
      let text = await readFile(absolute, "utf8");
      const original = text;
      for (const pair of pairs) text = text.split(pair.relative).join(pair.url);
      if (text !== original) {
        await writeFile(absolute, text);
        rewritten += 1;
      }
    }
  }
  await rewrite(path.join(root, "content"));
  await rewrite(path.join(root, "app"));
  await rewrite(path.join(root, "public/data"));
  const removed = await pruneMedia();
  console.log(JSON.stringify({ pairs: pairs.length, rewritten, ...removed }));
}

if (process.argv.includes("--relink")) {
  relink().catch((error) => {
    console.error(error);
    process.exit(1);
  });
} else {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
