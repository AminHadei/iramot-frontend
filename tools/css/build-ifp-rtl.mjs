import { existsSync, readdirSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import rtlcss from "rtlcss";

/* cspell:ignore fffef fcfbeb fcfbe FFFDF */

const require = createRequire(
  join(
    import.meta.dirname,
    "../../node_modules/.pnpm",
    readdirSync(join(import.meta.dirname, "../../node_modules/.pnpm")).find((name) =>
      name.startsWith("rtlcss@"),
    ),
    "node_modules/rtlcss/package.json",
  ),
);
const postcss = require("postcss");

const root = join(import.meta.dirname, "../..");
const htmlDir = join(root, "ref/ifp/html");
const mainPath = join(root, "ref/ifp/css/main.css");
const outPath = join(root, "app/assets/css/ifp.rtl.css");

function stripCharset(css) {
  return css.replace(/@charset\s+["'][^"']+["']\s*;/gi, "");
}

function stripMappedFaces(css) {
  let output = "";
  let index = 0;
  while (index < css.length) {
    const start = css.indexOf("@font-face", index);
    if (start === -1) {
      output += css.slice(index);
      break;
    }
    output += css.slice(index, start);
    const open = css.indexOf("{", start);
    let depth = 0;
    let end = open;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      else if (css[end] === "}") {
        depth -= 1;
        if (depth === 0) {
          end += 1;
          break;
        }
      }
    }
    const block = css.slice(start, end);
    if (!/Söhne|Tiempos Text/.test(block)) output += block;
    index = end;
  }
  return output;
}

function mapFonts(css) {
  return css
    .replaceAll("Tiempos Text", '"Noto Naskh Arabic"')
    .replaceAll("Söhne", "Vazirmatn");
}

function neutralizePersianType(css) {
  return css
    .replace(/text-transform\s*:\s*uppercase/gi, "text-transform: none")
    .replace(/letter-spacing\s*:\s*[^;}{]+/gi, "letter-spacing: normal");
}

const palette = `:root {
  --color-paper: #fffdf5;
  --color-ink: #2b2b33;
  --color-hero: #2d317a;
  --color-emphasis: #6866ad;
  --color-emphasis-fill: #6a64ab;
  --color-band: #06011e;
  --color-meta: #999;
  --color-panel: #faf9f7;
  --color-category-1: #2d317a;
  --color-category-2: #6967ac;
  --color-category-3: #9a96ca;
  --color-category-4: #3f50a0;
  --color-on-category: var(--color-paper);
  --color-accent: var(--color-band);
  --color-hero-background: var(--color-hero);
}
.home-splash,
.hero-intro {
  --color-hero-background: var(--color-hero);
}
[data-post-category="metascience"],
.spotlight-category[href*="/metascience"] {
  --color-category: var(--color-category-1) !important;
  --color-on-category: var(--color-paper);
}
[data-post-category="high-skilled-immigration"],
.spotlight-category[href*="/high-skilled-immigration"] {
  --color-category: var(--color-category-2) !important;
  --color-on-category: var(--color-paper);
}
[data-post-category="biotechnology"],
.spotlight-category[href*="/biotechnology"] {
  --color-category: var(--color-category-3) !important;
  --color-on-category: var(--color-band);
}
[data-post-category="infrastructure"],
.spotlight-category[href*="/infrastructure"] {
  --color-category: var(--color-category-4) !important;
  --color-on-category: var(--color-paper);
}
[data-post-category="emerging-technology"],
.spotlight-category[href*="/emerging-technology"] {
  --color-category: var(--color-category-1) !important;
  --color-on-category: var(--color-paper);
}
.spotlight-category[href*="/biotechnology"] .spotlight-category__title,
.spotlight-category[href*="/biotechnology"] .spotlight-category__icon {
  color: var(--color-band);
}
.spotlight-category[href*="/biotechnology"] .spotlight-category__icon svg * {
  fill: var(--color-band);
}`;

function expandHex(hex) {
  const value = hex.toLowerCase();
  if (value.length === 3) return value.replace(/./g, (digit) => digit + digit);
  return value;
}

function mix(token, alpha) {
  const percent = Math.round(Number(alpha) * 1000) / 10;
  return `color-mix(in srgb, ${token} ${percent}%, transparent)`;
}

function isDarkChrome(selector, prop) {
  const text = selector.replace(/\s+/g, " ");
  const bandOnly =
    /\.site-footer:before\b/.test(text) ||
    /\.newsletter-pre-footer:before\b/.test(text);
  if (bandOnly) return /background/i.test(prop);
  const darkHeader =
    /body\.nav-open \.site-header\b/.test(text) ||
    /\.site-navigation\b/.test(text) ||
    (/\.site-header__nav\b/.test(text) && /:hover ?> ?ul/.test(text)) ||
    /\.site-header--(?:focus|opaque|search-has-value)\b/.test(text) ||
    /\.site-header:hover\b/.test(text);
  return darkHeader;
}

function emphasisToken(selector, prop) {
  const surface = prop === "--color-accent" || /background/i.test(prop);
  const hairline = /\.simple-swiper__item:before\b/.test(selector);
  if (surface && !hairline) return "var(--color-emphasis-fill)";
  return "var(--color-emphasis)";
}

function tokenFor(hex, selector, prop) {
  const value = expandHex(hex);
  if (value === "fffef2") return "var(--color-paper)";
  if (value === "b17ada") return "var(--color-hero)";
  if (value === "ff9762") return emphasisToken(selector, prop);
  if (value === "fcfbeb" || value === "fcfbe8") return "var(--color-panel)";
  if (value === "999999") return "var(--color-meta)";
  if (value === "39d794") return "var(--color-category-3)";
  if (value === "bd4578") return "var(--color-category-4)";
  if (value === "41c4fc") return "var(--color-category-1)";
  if (value === "3368ce") return "var(--color-category-2)";
  if (value === "ff6565" && /color-category/.test(prop))
    return "var(--color-category-1)";
  if (value !== "373737") return null;
  if (prop === "--color-accent" && /\.project\b/.test(selector))
    return "var(--color-ink)";
  if (prop === "--color-accent") return "var(--color-band)";
  if (isDarkChrome(selector, prop)) return "var(--color-band)";
  return "var(--color-ink)";
}

function replaceColors(value, selector, prop) {
  let next = value.replace(
    /rgba\(\s*var\(--color-category-rgb,\s*#ff9762\s*\)\s*,\s*([0-9.]+)\s*\)/gi,
    "rgba(var(--color-category-rgb, 104, 102, 173), $1)",
  );
  next = next.replace(
    /rgba\(\s*255\s*,\s*254\s*,\s*242\s*,\s*([0-9.]+)\s*\)/gi,
    (_, alpha) => mix("var(--color-paper)", alpha),
  );
  next = next.replace(
    /rgba\(\s*55\s*,\s*55\s*,\s*55\s*,\s*([0-9.]+)\s*\)/gi,
    (_, alpha) => mix("var(--color-ink)", alpha),
  );
  next = next.replace(
    /rgba\(\s*255\s*,\s*151\s*,\s*98\s*,\s*([0-9.]+)\s*\)/gi,
    (_, alpha) => mix("var(--color-emphasis)", alpha),
  );
  next = next.replace(
    /rgba\(\s*51\s*,\s*104\s*,\s*206\s*,\s*([0-9.]+)\s*\)/gi,
    "var(--color-category-2)",
  );
  next = next.replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi, (full, hex) => {
    if (hex.length === 8) {
      const token = tokenFor(hex.slice(0, 6), selector, prop);
      if (!token) return full;
      return mix(token, parseInt(hex.slice(6), 16) / 255);
    }
    return tokenFor(hex, selector, prop) || full;
  });
  return next;
}

function isCategoryInk(selector, prop) {
  if (prop !== "color" && prop !== "fill") return false;
  return /\.post-listing__category\b/.test(selector);
}

function applyPalette(css) {
  const root = postcss.parse(css);
  root.walkDecls((decl) => {
    if (!decl.parent || !decl.parent.selector) return;
    const selector = decl.parent.selector;
    decl.value = replaceColors(decl.value, selector, decl.prop);
    if (
      /\.newsletter-pre-footer:before\b/.test(selector) &&
      /background/i.test(decl.prop)
    ) {
      decl.value = "var(--color-band)";
    }
    if (
      /\.page-template-template-newsletters \.hero-intro:before\b/.test(selector) &&
      /background/i.test(decl.prop)
    ) {
      decl.value = "var(--color-hero)";
    }
    if (selector.trim() === ":root" && decl.prop === "--color-accent") {
      decl.value = "var(--color-band)";
    }
    if (
      /body\.nav-open \.site-header\b/.test(selector) &&
      !/\.site-header__/.test(selector) &&
      /background/i.test(decl.prop) &&
      !decl.parent.nodes?.some((node) => node.prop === "border-color")
    ) {
      decl.parent.append({ prop: "border-color", value: "var(--color-band)" });
    }
    if (
      isCategoryInk(selector, decl.prop) &&
      /color-paper|color-body-background|fffef2/i.test(decl.value)
    ) {
      decl.value =
        decl.prop === "fill"
          ? "currentColor"
          : "var(--color-on-category, var(--color-paper))";
    }
  });
  root.walkRules((rule) => {
    if (!rule.selector || /:before\b|:after\b|checkbox/.test(rule.selector)) return;
    const decls = rule.nodes?.filter((node) => node.type === "decl") ?? [];
    const paintsFill = decls.some(
      (decl) =>
        /background/i.test(decl.prop) &&
        decl.value.includes("var(--color-emphasis-fill)"),
    );
    if (!paintsFill) return;
    const light = "var(--color-on-category, var(--color-paper))";
    const colorDecl = decls.find((decl) => decl.prop === "color");
    if (!colorDecl) {
      rule.append({ prop: "color", value: light });
      return;
    }
    if (/color-ink|color-band|#373737|#2b2b33|#06011e/i.test(colorDecl.value)) {
      colorDecl.value = light;
    }
  });
  root.prepend(postcss.parse(palette));
  return root
    .toString()
    .replace(/%23(?:373737|fffef2|b17ada|ff9762|fcfbeb|fcfbe8)/gi, (encoded) => {
      const hex = encoded.slice(3).toLowerCase();
      const mapped = {
        373737: "2B2B33",
        fffef2: "FFFDF5",
        b17ada: "2D317A",
        ff9762: "6866AD",
        fcfbeb: "FAF9F7",
        fcfbe8: "FAF9F7",
      };
      return `%23${mapped[hex]}`;
    });
}

async function styleBlocks(file) {
  const text = await readFile(file, "utf8");
  const blocks = [];
  for (const match of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = match[1]
      .replace(/<!--|-->/g, "")
      .replace(/<\/?[a-z][^>]*>/gi, "")
      .trim();
    if (css.includes("{")) blocks.push(css);
  }
  return blocks;
}

const seen = new Set();
const parts = [];

function add(css) {
  const cleaned = stripCharset(css).trim();
  if (!cleaned || seen.has(cleaned)) return;
  seen.add(cleaned);
  parts.push(cleaned);
}

add(await readFile(mainPath, "utf8"));

const htmlFiles = (await readdir(htmlDir))
  .filter((name) => name.endsWith(".html"))
  .sort((left, right) => left.localeCompare(right, "en"));
const ordered = ["home.html", ...htmlFiles.filter((name) => name !== "home.html")];

for (const name of ordered) {
  for (const block of await styleBlocks(join(htmlDir, name))) add(block);
}

function dropMissingImages(css) {
  const images = join(root, "app/assets/images");
  return css.replace(
    /url\((['"]?)(\.\.\/images\/[^'")]+)\1\)/g,
    (full, _quote, relative) => {
      const file = join(images, relative.slice("../images/".length));
      return existsSync(file) ? full : "none";
    },
  );
}

function fixSpotlightClip(css) {
  return css.replace(
    /(\.home-spotlight-intro__title\s*\{[^}]*?clip-path\s*:\s*)inset\(0 0 0 -100vw\)/g,
    "$1inset(0 -100vw 0 0)",
  );
}

const source = stripMappedFaces(parts.join("\n"));
const flipped = fixSpotlightClip(rtlcss.process(source));
const themed = dropMissingImages(
  applyPalette(neutralizePersianType(mapFonts(flipped))),
);
const css = `@layer base, ifp, components, utilities;\n@layer ifp {\n${themed}\n}\n`;

await writeFile(outPath, css);
console.log(`wrote ${outPath} (${css.length} bytes, ${parts.length} sources)`);
