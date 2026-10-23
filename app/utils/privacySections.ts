export interface PrivacyContact {
  label: string;
  value: string;
  raw: string;
  href: string;
}

export interface PrivacySection {
  heading: string;
  paragraphs: string[];
  list:
    { type: "ol"; items: string[] } | { type: "ul"; items: PrivacyContact[] } | null;
  id: string;
  role: "lead" | "section" | "contact";
  number: number | null;
}

export interface PrivacyDocument {
  sourceHeading: string;
  sections: PrivacySection[];
  updated: {
    label: string;
    raw: string;
    datetime: string;
  };
}

const UPDATED_LABEL = "تاریخ آخرین به‌روزرسانی";

const SHAPE: Array<{
  heading: string;
  id: string;
  role: PrivacySection["role"];
  list: "ol" | "ul" | null;
  count: number;
}> = [
  { heading: "مقدمه", id: "intro", role: "lead", list: null, count: 0 },
  {
    heading: "جمع‌آوری اطلاعات",
    id: "collection",
    role: "section",
    list: null,
    count: 0,
  },
  { heading: "استفاده از اطلاعات", id: "use", role: "section", list: "ol", count: 4 },
  {
    heading: "حفظ امنیت اطلاعات",
    id: "security",
    role: "section",
    list: null,
    count: 0,
  },
  {
    heading: "افشای اطلاعات به اشخاص ثالث",
    id: "third-parties",
    role: "section",
    list: null,
    count: 0,
  },
  {
    heading: "حفظ حریم خصوصی کودکان",
    id: "children",
    role: "section",
    list: null,
    count: 0,
  },
  {
    heading: "دسترسی به اطلاعات و اصلاح آن",
    id: "access",
    role: "section",
    list: null,
    count: 0,
  },
  {
    heading: "تغییرات در سیاست حریم خصوصی",
    id: "changes",
    role: "section",
    list: null,
    count: 0,
  },
  { heading: "تماس با ما", id: "contact", role: "contact", list: "ul", count: 2 },
];

function div(a: number, b: number) {
  return Math.trunc(a / b);
}

function mod(a: number, b: number) {
  return a - div(a, b) * b;
}

function gregorianDayNumber(gy: number, gm: number, gd: number) {
  let day =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  day = day - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return day;
}

function dayNumberToGregorian(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const day = div(mod(i, 153), 5) + 1;
  const month = mod(div(i, 153), 12) + 1;
  const year = div(j, 1461) - 100100 + div(8 - month, 6);
  return { year, month, day };
}

function jalaliMarch(year: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262,
    2324, 2394, 2456, 3178,
  ];
  const gregorianYear = year + 621;
  let leap = -14;
  let previous = breaks[0] ?? 0;
  if (year < previous || year >= (breaks.at(-1) ?? 0)) return null;
  let jump = 0;
  for (let index = 1; index < breaks.length; index += 1) {
    const next = breaks[index] ?? previous;
    jump = next - previous;
    if (year < next) break;
    leap = leap + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previous = next;
  }
  const passed = year - previous;
  leap = leap + div(passed, 33) * 8 + div(mod(passed, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - passed === 4) leap += 1;
  const gregorianLeap =
    div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  return { gregorianYear, march: 20 + leap - gregorianLeap };
}

function jalaliToIso(raw: string) {
  const match = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const calendar = jalaliMarch(year);
  if (!calendar) return null;
  const date = dayNumberToGregorian(
    gregorianDayNumber(calendar.gregorianYear, 3, calendar.march) +
      (month - 1) * 31 -
      div(month, 7) * (month - 7) +
      day -
      1,
  );
  const iso = [
    String(date.year).padStart(4, "0"),
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("-");
  const check = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(check.getTime())) return null;
  if (check.getUTCFullYear() !== date.year || check.getUTCMonth() + 1 !== date.month) {
    return null;
  }
  return iso;
}

function normalize(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function text(html: string) {
  return normalize(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""));
}

function contactHref(label: string, value: string) {
  if (value.includes("@")) return `mailto:${value}`;
  if (label === "تلفن" && /^\d+$/.test(value)) return `tel:${value}`;
  return null;
}

interface Draft {
  heading: string;
  paragraphs: string[];
  list: PrivacySection["list"];
}

export function privacySections(source: string): PrivacyDocument | null {
  const headingMatch = source.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i);
  const sourceHeading = headingMatch ? text(headingMatch[1] ?? "") : "";
  const drafts: Draft[] = [];
  let updated: { label: string; raw: string } | null = null;
  const blocks = source.matchAll(/<(p|ol|ul)\b[^>]*>([\s\S]*?)<\/\1>/gi);

  for (const block of blocks) {
    const tag = (block[1] ?? "").toLowerCase();
    const inner = block[2] ?? "";
    if (tag === "p") {
      const strong = inner.match(/<strong>([\s\S]*?)<\/strong>/i);
      if (!strong) return null;
      const heading = text(strong[1] ?? "");
      const rest = text(
        inner.slice(inner.indexOf(strong[0]) + strong[0].length),
      ).replace(/^:\s*/, "");
      if (heading === UPDATED_LABEL) {
        if (updated || !/^\d{4}\/\d{2}\/\d{2}$/.test(rest)) return null;
        updated = { label: heading, raw: rest };
        continue;
      }
      if (!heading || !rest) return null;
      drafts.push({ heading, paragraphs: [rest], list: null });
      continue;
    }

    const current = drafts.at(-1);
    if (!current || current.list) return null;
    const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((item) =>
      text(item[1] ?? ""),
    );
    if (items.length === 0 || items.some((item) => !item)) return null;
    if (tag === "ol") {
      current.list = { type: "ol", items };
      continue;
    }
    const contacts: PrivacyContact[] = [];
    for (const raw of items) {
      const splitAt = raw.indexOf(":");
      if (splitAt < 1) return null;
      const label = raw.slice(0, splitAt).trim();
      const value = raw.slice(splitAt + 1).trim();
      const href = contactHref(label, value);
      if (!label || !value || !href) return null;
      contacts.push({ label, value, raw, href });
    }
    current.list = { type: "ul", items: contacts };
  }

  if (!updated || drafts.length !== SHAPE.length) return null;
  const datetime = jalaliToIso(updated.raw);
  if (!datetime) return null;

  const sections: PrivacySection[] = [];
  for (let index = 0; index < SHAPE.length; index += 1) {
    const expected = SHAPE[index];
    const draft = drafts[index];
    if (!expected || !draft || draft.heading !== expected.heading) return null;
    if (draft.paragraphs.length !== 1) return null;
    if (expected.list === null) {
      if (draft.list) return null;
    } else if (!draft.list || draft.list.type !== expected.list) {
      return null;
    } else if (draft.list.items.length !== expected.count) {
      return null;
    }
    sections.push({
      heading: draft.heading,
      paragraphs: draft.paragraphs,
      list: draft.list,
      id: expected.id,
      role: expected.role,
      number: expected.role === "lead" ? null : index,
    });
  }

  return { sourceHeading, sections, updated: { ...updated, datetime } };
}
