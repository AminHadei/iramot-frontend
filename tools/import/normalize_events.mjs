import { readFile, writeFile } from "node:fs/promises";

const programs = {
  workshops: "کارگاه",
  reading: "رویداد-3",
  thesis: "رویداد-2",
  film: "رویداد",
};

const categoryProgram = Object.fromEntries(
  Object.entries(programs).map(([program, slug]) => [slug, program]),
);

const eventProgram = {
  8349: "reading",
  8340: "reading",
  8309: "reading",
  8301: "reading",
  8345: "thesis",
  8339: "thesis",
  8327: "film",
  8304: "film",
  3116: "workshops",
};

const excluded = new Set([10346, 6865, 8314]);
const descriptions = new Set([8339, 7417, 10260]);

const mergeInto = {
  8301: [6748],
  8309: [7775],
  6774: [7812, 8844],
  9313: [7850],
  8345: [9021],
  8327: [7430],
  8304: [6779],
};

const months = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const reserved = new Set(["workshops", "reading", "thesis", "film", "page"]);

function fold(value) {
  return value
    .replace(/[\u200c\u200d]/g, "")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/\s+/g, " ")
    .trim();
}

function decode(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&zwnj;|&#8204;/g, "\u200c")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&hellip;/g, "…");
}

function linesFrom(html) {
  const text = decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|figcaption)>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const labelRules = [
  ["time", /زمان\s*:/],
  ["held", /تاریخ\s*برگزاری\s*:/],
  ["clock", /ساعت\s*برگزاری\s*:/],
  ["location", /(?:آدرس\s*)?(?:مکان|محل)(?:\s*برگزاری)?\s*:/],
  ["mode", /نحوه\s*برگزاری\s*:/],
  ["expert", /صاحب\s*نظر(?:ان)?\s*:/],
  ["presenter", /ارائه\s*دهنده(?:ها|گان)?\s*:/],
  ["lead", /راهبر(?:\s*برنامه)?\s*:/],
  ["instructor", /مدرس(?:ان|ین)?\s*:/],
  ["register", /(?:لینک\s*)?(?:ایوند\s*)?(?:جهت\s*)?ثبت\s*نام\s*:/],
];

function marked(value) {
  return value
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/：/g, ":");
}

function labelsIn(line) {
  const source = marked(line);
  const hits = [];
  for (const [key, pattern] of labelRules) {
    for (const match of source.matchAll(new RegExp(pattern.source, "g"))) {
      hits.push({ key, index: match.index ?? 0, length: match[0].length });
    }
  }
  hits.sort((left, right) => left.index - right.index);
  const unique = [];
  for (const hit of hits) {
    const previous = unique.at(-1);
    if (previous && hit.index < previous.index + previous.length) continue;
    unique.push(hit);
  }
  return unique.map((hit, index) => {
    const start = hit.index + hit.length;
    const end = unique[index + 1]?.index ?? line.length;
    const value = line
      .slice(start, end)
      .replace(/^[\s:：/]+|[\s/]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return [hit.key, value];
  });
}

function labelAt(line) {
  return labelsIn(line)[0] ?? null;
}

function jalaliToGregorian(jy, jm, jd) {
  const year = jy - 979;
  const month = jm - 1;
  const day = jd - 1;
  let julian =
    365 * year + Math.floor(year / 33) * 8 + Math.floor(((year % 33) + 3) / 4);
  const days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (let index = 0; index < month; index += 1) julian += days[index];
  julian += day;
  let gregorianDay = julian + 79;
  let gy = 1600 + 400 * Math.floor(gregorianDay / 146097);
  gregorianDay %= 146097;
  let leap = true;
  if (gregorianDay >= 36525) {
    gregorianDay -= 1;
    gy += 100 * Math.floor(gregorianDay / 36524);
    gregorianDay %= 36524;
    if (gregorianDay >= 365) gregorianDay += 1;
    else leap = false;
  }
  gy += 4 * Math.floor(gregorianDay / 1461);
  gregorianDay %= 1461;
  if (gregorianDay >= 366) {
    leap = false;
    gregorianDay -= 1;
    gy += Math.floor(gregorianDay / 365);
    gregorianDay %= 365;
  }
  const gregorianDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 12 && gregorianDay >= gregorianDays[gm]) {
    gregorianDay -= gregorianDays[gm];
    gm += 1;
  }
  return { year: gy, month: gm + 1, day: gregorianDay + 1 };
}

function isoDate(year, month, day, hour, minute) {
  const date = [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
  if (hour === undefined) return date;
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}:00+03:30`;
}

function parseWhen(raw) {
  const folded = fold(raw);
  const monthNames = months.map((month) => fold(month)).join("|");
  const spanned = folded.match(
    new RegExp(`\\d{1,2}\\s+(?:${monthNames})\\s+تا\\s+\\d{1,2}\\s+(?:${monthNames})`),
  );
  if (spanned) return {};
  const match = folded.match(
    new RegExp(
      `(?:(?:شنبه|یکشنبه|دوشنبه|سه شنبه|چهارشنبه|پنج شنبه|جمعه)\\s+)?(\\d{1,2})\\s+(${monthNames})(?:\\s+(\\d{4}))?`,
    ),
  );
  if (!match) return {};
  const day = Number(match[1]);
  const month = months.findIndex((name) => fold(name) === match[2]) + 1;
  const year = match[3] ? Number(match[3]) : undefined;
  const time = folded.match(/ساعت\s+(\d{1,2})(?::(\d{2}))?/);
  const phrase = raw.replace(/\s+/g, " ").trim();
  if (!year || month < 1 || day < 1 || day > 31) return { dateText: phrase };
  const gregorian = jalaliToGregorian(year, month, day);
  const startsAt = isoDate(
    gregorian.year,
    gregorian.month,
    gregorian.day,
    time ? Number(time[1]) : undefined,
    time?.[2] ? Number(time[2]) : 0,
  );
  return { startsAt, dateText: phrase };
}

function datedPhrase(text) {
  const digit = "[0-9۰-۹٠-٩]";
  const monthNames = months.join("|");
  const clock = `(?:\\s*،?\\s*(?:از\\s*)?ساعت\\s*(${digit}{1,2})(?::(${digit}{2}))?(?:\\s*(?:تا|الی)\\s*(${digit}{1,2})(?:[:.]${digit}{2})?)?)?`;
  const pattern = new RegExp(
    `در\\s+تاریخ\\s*(${digit}{1,2})\\s*(${monthNames})(?:\\s*(${digit}{4}))?${clock}`,
  );
  const preferred = text.match(pattern);
  const fallback = preferred
    ? null
    : text.match(
        new RegExp(
          `از\\s+تاریخ\\s*(${digit}{1,2})\\s*(${monthNames})(?:\\s*(${digit}{4}))?`,
        ),
      );
  const match = preferred || fallback;
  if (!match) return {};
  const clockText = match[0].match(/ساعت[\s\S]*$/);
  const phrase = [
    [match[1], match[2], match[3]].filter(Boolean).join(" "),
    clockText?.[0],
  ]
    .filter(Boolean)
    .join(" ");
  return parseWhen(phrase);
}

function modesOf(value) {
  const folded = fold(value);
  const mode = [];
  if (folded.includes("حضوری")) mode.push("in-person");
  if (/آنلاین|انلاین|مجازی/.test(folded)) mode.push("online");
  return mode.length ? mode : undefined;
}

function namesOf(value) {
  return value
    .split(/[،,]/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part && !/^https?:/i.test(part));
}

function posterOf(record) {
  const local = record.featuredImage?.localPath;
  if (typeof local === "string" && /^\/media\/.+\.(jpe?g|png|webp|gif)$/i.test(local)) {
    return local;
  }
  return undefined;
}

function registrationOf(html, labeledUrl) {
  if (labeledUrl && /^https?:\/\//i.test(labeledUrl))
    return labeledUrl.split(/[\s<]/)[0];
  const anchors = html.matchAll(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  );
  for (const anchor of anchors) {
    const href = anchor[1] ?? "";
    const text = fold(decode(anchor[2] ?? "").replace(/<[^>]+>/g, " "));
    if (/ثبت نام/.test(text) || /evand\.com|evnd\.co/i.test(href)) {
      return href;
    }
  }
  const bare = html.match(/https?:\/\/(?:www\.)?(?:evand\.com|evnd\.co)\/[^\s"'<]+/i);
  return bare?.[0];
}

function videoOf(html) {
  const match = html.match(/aparat\.com\/(?:embed|v)\/([A-Za-z0-9]+)/i);
  return match ? `https://www.aparat.com/v/${match[1]}` : undefined;
}

function excerptOf(record) {
  const excerpt = decode(record.excerpt || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (excerpt) return excerpt.replace(/…+$/, "").trim();
  const paragraph = linesFrom(record.content || "").find((line) => !labelAt(line));
  return paragraph ? paragraph.slice(0, 220) : "";
}

function bodyOf(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<iframe\b[^>]*\/?>/gi, "")
    .replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, (block) => {
      const rows = linesFrom(block);
      const facts = rows.filter((line) => labelAt(line));
      return facts.length && facts.length === rows.length ? "" : block;
    })
    .replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (paragraph) => {
      const rows = linesFrom(paragraph);
      if (!rows.length || rows.every((line) => factLine(line))) return "";
      if (/aparat\.com/i.test(paragraph)) return "";
      return paragraph;
    })
    .trim();
}

function factLine(line) {
  const folded = fold(line);
  if (!folded) return true;
  if (labelAt(line) || clockLine(line) || modeLine(line)) return true;
  if (folded === "باحضور" || folded === "با حضور") return true;
  return /^https?:\/\//i.test(folded);
}

function clockLine(line) {
  const folded = fold(line);
  return folded.startsWith("ساعت") && !folded.startsWith("ساعت برگزاری");
}

function modeLine(line) {
  const folded = fold(line);
  if (!folded || folded.length > 70 || labelAt(line)) return undefined;
  return modesOf(folded);
}

function detailsFrom(html) {
  const found = {};
  const speakers = [];
  const seen = new Set();
  const lines = linesFrom(html);
  lines.forEach((line, index) => {
    const rows = labelsIn(line);
    if (!rows.length) return;
    const next = lines[index + 1];
    for (const [key, raw] of rows) {
      const value =
        (key === "time" || key === "held") && next && clockLine(next)
          ? `${raw} ${next}`
          : raw;
      if (key === "time" || key === "held") {
        if (!found.time && value) found.time = value;
        continue;
      }
      if (key === "clock") {
        found.clock ||= value;
        continue;
      }
      if (["expert", "presenter", "lead", "instructor"].includes(key)) {
        for (const name of namesOf(value)) {
          const token = `${key}:${fold(name)}`;
          if (seen.has(token)) continue;
          seen.add(token);
          speakers.push({ name, role: key });
        }
        continue;
      }
      if (!found[key] && value) found[key] = value;
    }
  });
  let when = found.time ? parseWhen(found.time) : {};
  if (!when.startsAt && !when.dateText) when = datedPhrase(lines.join("\n"));
  if (when.dateText && found.clock && !/ساعت/.test(when.dateText)) {
    when = { ...when, dateText: `${when.dateText}، ساعت ${found.clock}` };
  }
  let mode = found.mode ? modesOf(found.mode) : undefined;
  if (!mode) {
    for (const line of lines) {
      mode = modeLine(line);
      if (mode) break;
    }
  }
  return {
    startsAt: when.startsAt,
    dateText: when.dateText,
    location: found.location,
    mode,
    speakers: speakers.length ? speakers : undefined,
    registrationUrl: registrationOf(html, found.register),
    videoUrl: videoOf(html),
  };
}

function programOf(record, source) {
  if (record.id === 3116) return "workshops";
  if (source === "event" && eventProgram[record.id]) return eventProgram[record.id];
  const category = (record.categories ?? []).find((item) => categoryProgram[item.slug]);
  if (category) return categoryProgram[category.slug];
  return eventProgram[record.id];
}

function publishedAt(record, posts) {
  const post = posts.get(record.id);
  return (post?.date || "").slice(0, 10);
}

const probe = jalaliToGregorian(1404, 3, 6);
if (probe.year !== 2025 || probe.month !== 5 || probe.day !== 27) {
  throw new Error(`Jalali conversion failed: ${JSON.stringify(probe)}`);
}

const posts = JSON.parse(await readFile("content/posts.json", "utf8"));
const events = JSON.parse(await readFile("content/events.json", "utf8"));
const postsById = new Map(posts.map((post) => [post.id, post]));
const eventsById = new Map(events.map((event) => [event.id, event]));

const pool = new Map();

function consider(record, source) {
  if (!record || excluded.has(record.id) || pool.has(record.id)) return;
  const program = programOf(record, source);
  if (!program && !descriptions.has(record.id)) return;
  pool.set(record.id, { record, source, program });
}

for (const post of posts) consider(post, "post");
for (const event of events) consider(event, "event");
consider(postsById.get(3116), "post");
consider(eventsById.get(3116), "event");

for (const id of descriptions) pool.delete(id);

function recordOf(id) {
  return pool.get(id)?.record ?? postsById.get(id) ?? eventsById.get(id);
}

function fill(target, source, { dates }) {
  if (!source) return target;
  const html = `${target.html || ""}\n${source.content || source.excerpt || ""}`;
  const extra = detailsFrom(source.content || source.excerpt || "");
  if (dates) {
    if (!target.startsAt && extra.startsAt) {
      target.startsAt = extra.startsAt;
      target.dateText = extra.dateText;
    } else if (!target.dateText && extra.dateText && extra.startsAt) {
      target.dateText = extra.dateText;
    }
  }
  target.location ||= extra.location;
  target.mode ||= extra.mode;
  target.speakers ||= extra.speakers;
  target.registrationUrl ||= extra.registrationUrl;
  target.videoUrl ||= extra.videoUrl;
  target.poster ||= posterOf(source);
  if ((source.content || "").length > (target.html || "").length)
    target.html = source.content;
  else target.html ||= html;
  if (!target.publishedAt) target.publishedAt = publishedAt(source, postsById);
  return target;
}

const duplicates = new Map();
for (const [canonical, ids] of Object.entries(mergeInto)) {
  for (const id of ids) duplicates.set(id, Number(canonical));
}

const items = [];
const emitted = new Set();

for (const [id, entry] of pool) {
  if (duplicates.has(id) || emitted.has(id)) continue;
  const record = entry.record;
  const own = detailsFrom(record.content || record.excerpt || "");
  const item = {
    id,
    slug: record.slug,
    program: entry.program,
    title: decode(record.title).replace(/\s+/g, " ").trim(),
    startsAt: own.startsAt,
    dateText: own.dateText,
    publishedAt: publishedAt(record, postsById),
    location: own.location,
    mode: own.mode,
    speakers: own.speakers,
    registrationUrl: own.registrationUrl,
    poster: posterOf(record),
    videoUrl: own.videoUrl,
    excerpt: excerptOf(record),
    html: record.content || "",
  };
  for (const duplicateId of mergeInto[id] ?? []) {
    fill(item, recordOf(duplicateId), { dates: false });
    const duplicate = recordOf(duplicateId);
    if (duplicate && !item.startsAt) {
      const parsed = detailsFrom(duplicate.content || duplicate.excerpt || "");
      if (parsed.startsAt) {
        item.startsAt = parsed.startsAt;
        item.dateText = parsed.dateText ?? item.dateText;
      }
    }
  }
  if (!item.publishedAt) {
    for (const duplicateId of mergeInto[id] ?? []) {
      const date = publishedAt({ id: duplicateId }, postsById);
      if (date) {
        item.publishedAt = date;
        break;
      }
    }
  }
  item.bodyHtml = bodyOf(item.html || "");
  delete item.html;
  item.title = item.title
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (item.dateText) {
    item.dateText = item.dateText.replace(
      /\d/g,
      (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)],
    );
  }
  for (const key of [
    "startsAt",
    "dateText",
    "publishedAt",
    "location",
    "registrationUrl",
    "poster",
    "videoUrl",
  ]) {
    if (!item[key]) delete item[key];
  }
  if (!item.mode?.length) delete item.mode;
  if (!item.speakers?.length) delete item.speakers;
  if (reserved.has(item.slug)) item.slug = `${item.slug}-${item.id}`;
  emitted.add(id);
  items.push(item);
  for (const duplicateId of mergeInto[id] ?? []) {
    const duplicate = recordOf(duplicateId);
    if (!duplicate) continue;
    items.push({
      id: duplicateId,
      slug: duplicate.slug,
      program: item.program,
      title: decode(duplicate.title).replace(/\s+/g, " ").trim(),
      publishedAt: publishedAt(duplicate, postsById) || item.publishedAt,
      excerpt: excerptOf(duplicate),
      bodyHtml: "",
      canonicalOf: id,
    });
  }
}

const slugs = new Set();
for (const item of items) {
  if (!item.canonicalOf && slugs.has(item.slug)) item.slug = `${item.slug}-${item.id}`;
  slugs.add(item.slug);
}

const cards = items.filter((item) => !item.canonicalOf);
const counts = Object.fromEntries(
  Object.keys(programs).map((program) => [
    program,
    cards.filter((item) => item.program === program).length,
  ]),
);

const index = {
  programs: Object.keys(programs).map((slug) => ({ slug })),
  items,
};

await writeFile("public/data/events/index.json", `${JSON.stringify(index, null, 2)}\n`);

const routes = [
  "/events",
  ...Object.keys(programs).map((program) => `/events/${program}`),
  ...cards.map((item) => `/events/${item.slug}`),
];
await writeFile(
  "app/data/events/prerender-routes.ts",
  `export const eventPrerenderRoutes = ${JSON.stringify(routes, null, 2)};\n`,
);

console.log(
  JSON.stringify(
    {
      counts,
      total: cards.length,
      cards: cards.map((item) => ({
        id: item.id,
        program: item.program,
        title: item.title,
        startsAt: item.startsAt ?? "",
        dateText: item.dateText ?? "",
        publishedAt: item.publishedAt,
        location: item.location ?? "",
        mode: item.mode ?? [],
        speakers: item.speakers ?? [],
        registrationUrl: item.registrationUrl ?? "",
        poster: item.poster ?? "",
        videoUrl: item.videoUrl ?? "",
      })),
    },
    null,
    2,
  ),
);
