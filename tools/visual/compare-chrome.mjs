/**
 * Compare header, drawer, newsletter, and footer against ifp.org.
 *
 *   node tools/visual/compare-chrome.mjs
 */
import { chromium } from "playwright";

const ours = process.env.OURS ?? "http://localhost:3000";
const ifp = "https://ifp.org/";
const widths = [1440, 390];

async function readChrome(page) {
  return page.evaluate(() => {
    const styleOf = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        display: style.display,
        position: style.position,
        background: style.backgroundColor,
        color: style.color,
        borderTopColor: style.borderTopColor,
        borderBottomColor: style.borderBottomColor,
        opacity: style.opacity,
        padding: style.padding,
        gridTemplateColumns: style.gridTemplateColumns,
        textDecorationLine: style.textDecorationLine,
      };
    };
    const footer = document.querySelector(".site-footer");
    const columns = footer
      ? [...footer.children].map((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return {
            className: node.className,
            x: Math.round(rect.x),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            display: style.display,
            gridArea: style.gridArea,
          };
        })
      : [];
    const icons = [...document.querySelectorAll(".site-footer__social svg")].map(
      (node) => {
        const rect = node.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      },
    );
    const newsletterLink = document.querySelector(".newsletter-pre-footer__form a");
    const pattern = document.querySelector(".newsletter-pre-footer__graphic img");
    const address = document.querySelector(".site-footer__address");
    return {
      header: styleOf(".site-header"),
      inner: styleOf(".site-header__inner"),
      drawer: styleOf(".site-navigation"),
      newsletter: styleOf(".newsletter-pre-footer"),
      newsletterBody: styleOf(".newsletter-pre-footer__body"),
      graphic: styleOf(".newsletter-pre-footer__graphic"),
      footer: styleOf(".site-footer"),
      link: newsletterLink
        ? {
            text: newsletterLink.textContent?.trim() ?? "",
            decoration: getComputedStyle(newsletterLink).textDecorationLine,
            offset: getComputedStyle(newsletterLink).textUnderlineOffset,
          }
        : null,
      form: Boolean(document.querySelector(".newsletter-pre-footer form")),
      pattern: pattern ? pattern.getAttribute("src") : null,
      columns,
      icons,
      addressWidth: address ? Math.round(address.getBoundingClientRect().width) : null,
      opaque: document.querySelector(".site-header")?.className ?? "",
      navOpen: document.body.classList.contains("nav-open"),
    };
  });
}

function delta(label, expected, actual, tolerance) {
  if (expected == null || actual == null) {
    return `${label}: missing (${expected == null ? "ifp" : "ours"})`;
  }
  const difference = actual - expected;
  if (Math.abs(difference) <= tolerance) return null;
  return `${label}: ifp ${expected} ours ${actual} (${difference > 0 ? "+" : ""}${difference})`;
}

async function settle(page) {
  await page.waitForSelector(".site-header", { timeout: 30000 });
  await page.evaluate(async () => {
    document.body.classList.add("loaded");
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const notes = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
      });
      const theirs = await context.newPage();
      const local = await context.newPage();
      await Promise.all([
        theirs.goto(ifp, { waitUntil: "domcontentloaded", timeout: 60000 }),
        local.goto(ours, { waitUntil: "domcontentloaded", timeout: 60000 }),
      ]);
      await settle(theirs);
      await settle(local);

      const topTheirs = await readChrome(theirs);
      const topLocal = await readChrome(local);
      notes.push(
        `${width} header top height ${delta("height", topTheirs.header?.height, topLocal.header?.height, 8) ?? "ok"}`,
      );
      notes.push(
        `${width} header top background ifp ${topTheirs.header?.background} ours ${topLocal.header?.background}`,
      );
      notes.push(
        `${width} header top border ifp ${topTheirs.header?.borderBottomColor} ours ${topLocal.header?.borderBottomColor}`,
      );

      await Promise.all([
        theirs.evaluate(() => window.scrollTo({ top: 480, behavior: "instant" })),
        local.evaluate(() => window.scrollTo({ top: 480, behavior: "instant" })),
      ]);
      await theirs.waitForTimeout(500);
      await local.waitForTimeout(500);
      const scrolledTheirs = await readChrome(theirs);
      const scrolledLocal = await readChrome(local);
      notes.push(
        `${width} header scrolled class ifp ${scrolledTheirs.opaque} ours ${scrolledLocal.opaque}`,
      );
      notes.push(
        `${width} header scrolled background ifp ${scrolledTheirs.header?.background} ours ${scrolledLocal.header?.background}`,
      );
      notes.push(
        `${width} header scrolled border ifp ${scrolledTheirs.header?.borderBottomColor} ours ${scrolledLocal.header?.borderBottomColor}`,
      );
      const height = delta(
        "height",
        scrolledTheirs.header?.height,
        scrolledLocal.header?.height,
        8,
      );
      if (height) notes.push(`${width} header scrolled ${height}`);

      if (width === 390) {
        await Promise.all([
          theirs.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })),
          local.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })),
        ]);
        await theirs.locator(".nav-toggle").click();
        await local.locator(".nav-toggle").click();
        await theirs.waitForTimeout(500);
        await local.waitForTimeout(500);
        const drawerTheirs = await readChrome(theirs);
        const drawerLocal = await readChrome(local);
        notes.push(
          `390 drawer ifp ${drawerTheirs.drawer?.width}x${drawerTheirs.drawer?.height} ${drawerTheirs.drawer?.background} open ${drawerTheirs.navOpen}`,
        );
        notes.push(
          `390 drawer ours ${drawerLocal.drawer?.width}x${drawerLocal.drawer?.height} ${drawerLocal.drawer?.background} open ${drawerLocal.navOpen}`,
        );
        const drawerWidth = delta(
          "width",
          drawerTheirs.drawer?.width,
          drawerLocal.drawer?.width,
          16,
        );
        if (drawerWidth) notes.push(`390 drawer ${drawerWidth}`);
      }

      await local.locator(".newsletter-pre-footer").scrollIntoViewIfNeeded();
      await theirs.locator(".newsletter-pre-footer").scrollIntoViewIfNeeded();
      await local.waitForTimeout(300);
      const newsTheirs = await readChrome(theirs);
      const newsLocal = await readChrome(local);
      notes.push(
        `${width} newsletter grid ifp ${newsTheirs.newsletter?.gridTemplateColumns} ours ${newsLocal.newsletter?.gridTemplateColumns}`,
      );
      notes.push(
        `${width} newsletter size ${delta("width", newsTheirs.newsletter?.width, newsLocal.newsletter?.width, 16) ?? "width ok"}; ${delta("height", newsTheirs.newsletter?.height, newsLocal.newsletter?.height, 24) ?? "height ok"}`,
      );
      notes.push(
        `${width} newsletter background ifp ${newsTheirs.newsletter?.background} ours ${newsLocal.newsletter?.background}`,
      );
      notes.push(
        `${width} newsletter link ours ${JSON.stringify(newsLocal.link)} form ${newsLocal.form} pattern ${newsLocal.pattern} graphic ${newsLocal.graphic?.display}`,
      );
      notes.push(
        `${width} newsletter link ifp ${JSON.stringify(newsTheirs.link)} graphic ${newsTheirs.graphic?.display}`,
      );

      await local.locator(".site-footer").scrollIntoViewIfNeeded();
      await theirs.locator(".site-footer").scrollIntoViewIfNeeded();
      const footTheirs = await readChrome(theirs);
      const footLocal = await readChrome(local);
      notes.push(
        `${width} footer grid ifp ${footTheirs.footer?.gridTemplateColumns} ours ${footLocal.footer?.gridTemplateColumns}`,
      );
      notes.push(`${width} footer columns ifp ${JSON.stringify(footTheirs.columns)}`);
      notes.push(`${width} footer columns ours ${JSON.stringify(footLocal.columns)}`);
      notes.push(
        `${width} footer icons ifp ${JSON.stringify(footTheirs.icons)} ours ${JSON.stringify(footLocal.icons)} address ${footLocal.addressWidth}`,
      );
      notes.push(
        `${width} footer background ifp ${footTheirs.footer?.background} ours ${footLocal.footer?.background}`,
      );
      await context.close();
    }

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${ours}/about`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);
    const about = await readChrome(page);
    notes.push(
      `about newsletter ${about.newsletter ? "present" : "missing"} link ${JSON.stringify(about.link)}`,
    );

    await page.goto(ours, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page);
    await page.waitForTimeout(1500);
    const splash = await page.evaluate(() => {
      const stage = document.querySelector(".home-splash__video");
      const svg = stage?.querySelector("svg");
      const icons = [...document.querySelectorAll(".spotlight-category__icon svg")].map(
        (node) => node.querySelector("path")?.getAttribute("d")?.length ?? 0,
      );
      return {
        svg: Boolean(svg),
        viewBox: svg?.getAttribute("viewBox") ?? "",
        icons,
      };
    });
    notes.push(`splash ${JSON.stringify(splash)}`);

    const step = await page.evaluate(() => {
      const scroller = document.querySelector(".home-latest__list .simple-swiper");
      const item = scroller?.querySelector(".simple-swiper__item");
      if (!scroller || !item) return null;
      const style = getComputedStyle(item);
      const gap =
        (Number.parseFloat(style.marginLeft) || 0) +
        (Number.parseFloat(style.marginRight) || 0);
      const amount = item.getBoundingClientRect().width + gap;
      const before = scroller.scrollLeft;
      return { before, amount: Math.round(amount), gap };
    });
    const button = page.locator(".simple-swiper-controller__button-right");
    const padding = await button.evaluate((node) => getComputedStyle(node).padding);
    await button.click();
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => {
      const scroller = document.querySelector(".home-latest__list .simple-swiper");
      return scroller ? Math.round(Math.abs(scroller.scrollLeft)) : null;
    });
    notes.push(
      `swiper step ${JSON.stringify(step)} scrolled ${after} button padding ${padding}`,
    );

    await page.goto(`${ours}/research`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await settle(page);
    const listing = await page.evaluate(() => {
      const label = document.querySelector(
        ".post-listing--featured-contain .post-listing__label",
      );
      const style = label ? getComputedStyle(label) : null;
      const sort = document.querySelector(".filter-toolbar__control--sort select");
      const author = document.querySelector(".filter-toolbar__control--author select");
      const bar = document.querySelector(".filter-toolbar--category");
      const barStyle = bar ? getComputedStyle(bar) : null;
      return {
        label: label?.textContent?.replace(/\s+/g, " ").trim() ?? null,
        labelBackground: style?.backgroundColor ?? null,
        labelColor: style?.color ?? null,
        sort: sort ? [...sort.options].map((option) => option.text) : null,
        author: author ? [...author.options].map((option) => option.text) : null,
        bar: barStyle
          ? {
              display: barStyle.display,
              grid: barStyle.gridTemplateColumns,
              height: barStyle.height,
            }
          : null,
      };
    });
    notes.push(`listing ${JSON.stringify(listing)}`);
    await context.close();
  } finally {
    for (const note of notes) console.log(note);
    await browser.close();
  }
}

await main();
