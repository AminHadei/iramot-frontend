/**
 * Screenshot each saved IFP page and the matching local route, flip the IFP
 * capture horizontally, mask text, and compare with pixelmatch. Layout is
 * judged from mirrored getBoundingClientRect values. Palette and copy length
 * are reported, not treated as a layout failure.
 *
 *   node tools/visual/compare-ifp.mjs [home publications ...]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "tools/visual/out");
const base = process.env.OURS ?? "http://localhost:3000";
const widths = [1440, 980, 390];
const viewportHeight = 900;
const positionTolerance = 16;
const sizeTolerance = 16;
const chromeHeightTolerance = 8;

const maskCss = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  h1, h2, h3, h4, h5, h6, p, li, a, button, label, input, textarea,
  figcaption, blockquote, cite, time, span, small, strong, em, dt, dd {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    text-shadow: none !important;
  }
  ::placeholder { color: transparent !important; }
`;

const chrome = [".site-header", ".site-header__inner", ".site-main", ".site-footer"];

const pairs = [
  {
    id: "home",
    ifp: "ref/ifp/html/home.html",
    ours: "/",
    selectors: [
      ...chrome,
      ".home-splash",
      ".home-spotlight-intro",
      ".home-spotlight-posts",
      ".home-latest--featured-projects",
      ".project-list--layout-3-col",
      ".simple-swiper",
      ".newsletter-pre-footer",
    ],
    chromeHeights: [".site-header", ".home-splash"],
    alignY: [".site-header", ".site-header__inner", ".site-main", ".home-splash"],
  },
  {
    id: "publications",
    ifp: "ref/ifp/html/latest-publications.html",
    ours: "/research",
    selectors: [...chrome, ".post-listing-list", ".post-listing", ".post-pagination"],
  },
  {
    id: "category",
    ifp: "ref/ifp/html/category-metascience.html",
    ours: "/research/category/articles",
    selectors: [
      ...chrome,
      ".category-header",
      ".category-header__info",
      ".category-header__latest",
      ".post-listing-list",
    ],
  },
  {
    id: "article",
    ifp: "ref/ifp/html/article-how-the-permitting-deal-works.html",
    ours: "/research/اعلام-نتایج-انتخابات-دهمین-دوره-هیئت",
    selectors: [
      ...chrome,
      ".single-article",
      ".single-article__header",
      ".article__content",
    ],
  },
  {
    id: "about",
    ifp: "ref/ifp/html/about.html",
    ours: "/about",
    selectors: [...chrome, ".hero-intro", ".people-group-list", ".person-card"],
  },
  {
    id: "contact",
    ifp: "ref/ifp/html/contact.html",
    ours: "/contact",
    selectors: [
      ...chrome,
      ".contact-hero",
      ".contact-hero__title",
      ".contact-hero__address",
      ".contact-hero__links",
    ],
    presence: [".contact-hero__title"],
  },
  {
    id: "projects",
    ifp: "ref/ifp/html/projects.html",
    ours: "/projects",
    selectors: [...chrome, ".hero-intro", ".project-list--layout-3-col", ".project"],
  },
  {
    id: "opportunities",
    ifp: "ref/ifp/html/opportunities.html",
    ours: "/opportunities",
    selectors: [...chrome, ".hero-intro", ".opportunities", ".opportunities-posts"],
  },
  {
    id: "privacy",
    ifp: "ref/ifp/html/privacy-policy.html",
    ours: "/privacy",
    selectors: [...chrome, ".page-standard__content"],
  },
  {
    id: "course",
    ifp: "ref/ifp/html/economics-of-ideas.html",
    ours: "/economics-of-ideas",
    selectors: [...chrome, ".hero-intro"],
  },
  {
    id: "reading-list",
    ifp: "ref/ifp/html/the-launch-sequence.html",
    ours: "/the-launch-sequence",
    selectors: [
      ...chrome,
      ".hero-intro",
      ".reading-list__overview",
      ".reading-list__blocks",
    ],
  },
  {
    id: "playbook",
    ifp: "ref/ifp/html/transit-abundance-playbook.html",
    ours: "/transit-abundance-playbook",
    selectors: [
      ...chrome,
      ".hero-intro",
      ".reading-list__overview",
      ".reading-list__blocks",
    ],
  },
];

const requested = new Set(process.argv.slice(2));
const selected = requested.size
  ? pairs.filter((pair) => requested.has(pair.id))
  : pairs;

function flipHorizontal(png) {
  const out = new PNG({ width: png.width, height: png.height });
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const source = (png.width * y + x) << 2;
      const target = (png.width * y + (png.width - 1 - x)) << 2;
      out.data[target] = png.data[source];
      out.data[target + 1] = png.data[source + 1];
      out.data[target + 2] = png.data[source + 2];
      out.data[target + 3] = png.data[source + 3];
    }
  }
  return out;
}

function sideBySide(left, middle, right) {
  const width = left.width + middle.width + right.width;
  const height = Math.max(left.height, middle.height, right.height);
  const out = new PNG({ width, height });
  const paint = (source, origin) => {
    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        const from = (source.width * y + x) << 2;
        const to = (width * y + origin + x) << 2;
        out.data[to] = source.data[from];
        out.data[to + 1] = source.data[from + 1];
        out.data[to + 2] = source.data[from + 2];
        out.data[to + 3] = 255;
      }
    }
  };
  paint(left, 0);
  paint(middle, left.width);
  paint(right, left.width + middle.width);
  return out;
}

async function prepare(page) {
  await page.addStyleTag({ content: maskCss });
  await page.evaluate(async () => {
    document.body.classList.add("loaded");
    await document.fonts.ready;
  });
}

async function measure(page, selectors) {
  return page.evaluate((names) => {
    const boxes = {};
    for (const name of names) {
      const node = document.querySelector(name);
      if (!node) {
        boxes[name] = null;
        continue;
      }
      const rect = node.getBoundingClientRect();
      boxes[name] = {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }
    return boxes;
  }, selectors);
}

function compareBoxes(pair, width, ifpBoxes, ourBoxes) {
  const failures = [];
  for (const selector of pair.selectors) {
    const ifp = ifpBoxes[selector];
    const ours = ourBoxes[selector];
    if (!ifp || !ours) {
      failures.push({
        page: pair.id,
        width,
        selector,
        kind: !ifp ? "missing-ifp" : "missing-ours",
      });
      continue;
    }
    if (pair.presence?.includes(selector)) continue;
    if (!ifp.width && !ifp.height && !ours.width && !ours.height) continue;
    const mirroredX = width - ifp.x - ifp.width;
    const checks = [
      ["x", mirroredX, ours.x, positionTolerance],
      ["width", ifp.width, ours.width, sizeTolerance],
    ];
    const alignY = pair.alignY ?? [".site-header", ".site-header__inner", ".site-main"];
    if (
      alignY.includes(selector) &&
      ifp.y >= 0 &&
      ifp.y < viewportHeight &&
      ours.y >= 0 &&
      ours.y < viewportHeight
    ) {
      checks.push(["y", ifp.y, ours.y, positionTolerance]);
    }
    if (pair.chromeHeights?.includes(selector)) {
      checks.push(["height", ifp.height, ours.height, chromeHeightTolerance]);
    }
    for (const [kind, expected, actual, tolerance] of checks) {
      const delta = actual - expected;
      if (Math.abs(delta) > tolerance) {
        failures.push({
          page: pair.id,
          width,
          selector,
          kind,
          expected,
          actual,
          delta,
        });
      }
    }
  }
  return failures;
}

async function capture(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".site-header", { timeout: 30000 });
  await prepare(page);
  const buffer = await page.screenshot({ type: "png", animations: "disabled" });
  return PNG.sync.read(buffer);
}

async function main() {
  if (!selected.length) {
    console.error(
      `Unknown page. Choose from: ${pairs.map((pair) => pair.id).join(", ")}`,
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ channel: "chrome" });
  const failures = [];
  const pixels = [];

  try {
    for (const pair of selected) {
      for (const width of widths) {
        const context = await browser.newContext({
          viewport: { width, height: viewportHeight },
          deviceScaleFactor: 1,
        });
        const ifpPage = await context.newPage();
        const ourPage = await context.newPage();
        const ifpUrl = pathToFileURL(path.join(root, pair.ifp)).href;
        const [ifpShot, ourShot, ifpBoxes, ourBoxes] = await Promise.all([
          capture(ifpPage, ifpUrl).then(async (shot) => {
            const boxes = await measure(ifpPage, pair.selectors);
            return [shot, boxes];
          }),
          capture(ourPage, new URL(pair.ours, base).href).then(async (shot) => {
            const boxes = await measure(ourPage, pair.selectors);
            return [shot, boxes];
          }),
        ]).then(([ifp, ours]) => [ifp[0], ours[0], ifp[1], ours[1]]);

        const flipped = flipHorizontal(ifpShot);
        const diff = new PNG({ width: flipped.width, height: flipped.height });
        const mismatched = pixelmatch(
          flipped.data,
          ourShot.data,
          diff.data,
          flipped.width,
          flipped.height,
          {
            threshold: 0.1,
            includeAA: true,
          },
        );
        const ratio = mismatched / (flipped.width * flipped.height);
        pixels.push({
          page: pair.id,
          width,
          mismatched,
          ratio: Number(ratio.toFixed(4)),
        });
        failures.push(...compareBoxes(pair, width, ifpBoxes, ourBoxes));

        const dir = path.join(outDir, pair.id, String(width));
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, "ifp.png"), PNG.sync.write(flipped));
        await writeFile(path.join(dir, "ours.png"), PNG.sync.write(ourShot));
        await writeFile(path.join(dir, "diff.png"), PNG.sync.write(diff));
        await writeFile(
          path.join(dir, "side.png"),
          PNG.sync.write(sideBySide(flipped, ourShot, diff)),
        );
        await context.close();
        console.log(
          `${pair.id} ${width}px  pixels ${(ratio * 100).toFixed(1)}%  boxes ${
            compareBoxes(pair, width, ifpBoxes, ourBoxes).length
          }`,
        );
      }
    }
  } finally {
    await browser.close();
  }

  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "report.json"),
    JSON.stringify({ pixels, failures }, null, 2),
  );

  console.log("\nPixel mismatch (text masked; colour and media still differ):");
  for (const row of pixels) {
    console.log(`  ${row.page} ${row.width}px  ${(row.ratio * 100).toFixed(1)}%`);
  }
  console.log(`\nLayout failures: ${failures.length}`);
  for (const failure of failures) {
    if (failure.kind.startsWith("missing")) {
      console.log(
        `  ${failure.page} ${failure.width}px  ${failure.selector}  ${failure.kind}`,
      );
      continue;
    }
    console.log(
      `  ${failure.page} ${failure.width}px  ${failure.selector}  ${failure.kind}  expected ${failure.expected} actual ${failure.actual} (${failure.delta > 0 ? "+" : ""}${failure.delta})`,
    );
  }
  if (failures.length) process.exitCode = 1;
}

await main();
