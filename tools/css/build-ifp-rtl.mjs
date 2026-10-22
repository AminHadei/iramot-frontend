import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import rtlcss from "rtlcss";

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

const source = stripMappedFaces(parts.join("\n"));
const flipped = rtlcss.process(source);
const css = `@layer base, ifp, components, utilities;\n@layer ifp {\n${neutralizePersianType(mapFonts(flipped))}\n}\n`;

await writeFile(outPath, css);
console.log(`wrote ${outPath} (${css.length} bytes, ${parts.length} sources)`);
