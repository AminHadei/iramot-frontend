export interface FoldResult {
  text: string;
  map: number[];
}

export interface Range {
  start: number;
  end: number;
}

export interface SearchableTerm {
  id: number;
  en: string;
  fa: string | null;
  text: string;
  sources: number[];
  date: string | null;
}

export type MatchRank = 0 | 1 | 2 | 3;

export interface TermHit<T extends SearchableTerm = SearchableTerm> {
  term: T;
  rank: MatchRank | -1;
  ranges: { en: Range[]; fa: Range[]; text: Range[] } | null;
}

const yeh = new Set([0x64a, 0x649]);
const kaf = 0x643;
const kashida = 0x640;
const softHyphen = 0xad;

interface FoldedTerm {
  en: FoldResult;
  fa: FoldResult;
  text: FoldResult;
}

const foldedCache = new WeakMap<SearchableTerm, FoldedTerm>();

function isWhitespace(code: number) {
  return /\s/u.test(String.fromCodePoint(code));
}

function isBidiOrFormat(code: number) {
  return (
    code === 0x61c ||
    code === 0x200c ||
    code === 0x200d ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2066 && code <= 0x2069) ||
    code === 0xfeff
  );
}

function isDiacritic(code: number) {
  return (
    (code >= 0x64b && code <= 0x65f) ||
    code === 0x670 ||
    (code >= 0x6d6 && code <= 0x6ed) ||
    (code >= 0x300 && code <= 0x36f) ||
    (code >= 0xfe20 && code <= 0xfe2f)
  );
}

function isDropped(code: number) {
  return (
    isWhitespace(code) ||
    isBidiOrFormat(code) ||
    isDiacritic(code) ||
    code === kashida ||
    code === softHyphen
  );
}

function translate(code: number) {
  if (yeh.has(code)) return 0x6cc;
  if (code === kaf) return 0x6a9;
  if (code >= 0x6f0 && code <= 0x6f9) return 0x30 + (code - 0x6f0);
  if (code >= 0x660 && code <= 0x669) return 0x30 + (code - 0x660);
  return code;
}

export function foldText(input: string | null | undefined): FoldResult {
  const raw = input ?? "";
  let text = "";
  const map: number[] = [];

  for (let index = 0; index < raw.length;) {
    const code = raw.codePointAt(index) ?? 0;
    const width = code > 0xffff ? 2 : 1;
    if (!isDropped(code)) {
      const folded = String.fromCodePoint(translate(code))
        .normalize("NFKD")
        .toLowerCase();
      for (let offset = 0; offset < folded.length;) {
        const piece = folded.codePointAt(offset) ?? 0;
        const pieceWidth = piece > 0xffff ? 2 : 1;
        if (!isDropped(piece)) {
          const chars = String.fromCodePoint(piece);
          for (let unit = 0; unit < chars.length; unit += 1) map.push(index);
          text += chars;
        }
        offset += pieceWidth;
      }
    }
    index += width;
  }

  return { text, map };
}

export function queryTokens(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .map((token) => foldText(token).text)
    .filter((token) => token.length > 0);
}

export function compareByDateDesc(left: SearchableTerm, right: SearchableTerm) {
  if (left.date && right.date) {
    if (left.date !== right.date) return left.date < right.date ? 1 : -1;
    return right.id - left.id;
  }
  if (left.date) return -1;
  if (right.date) return 1;
  return right.id - left.id;
}

function foldedOf(term: SearchableTerm) {
  const cached = foldedCache.get(term);
  if (cached) return cached;
  const folded = {
    en: foldText(term.en),
    fa: foldText(term.fa),
    text: foldText(term.text),
  };
  foldedCache.set(term, folded);
  return folded;
}

function occurrences(folded: FoldResult, needle: string, length: number): Range[] {
  if (!needle) return [];
  const ranges: Range[] = [];
  let from = 0;
  while (from < folded.text.length) {
    const at = folded.text.indexOf(needle, from);
    if (at < 0) break;
    const endAt = at + needle.length;
    const start = folded.map[at] ?? 0;
    const end = endAt < folded.map.length ? (folded.map[endAt] ?? length) : length;
    if (end > start) ranges.push({ start, end });
    from = endAt;
  }
  return ranges;
}

function mergeRanges(ranges: readonly Range[]) {
  const sorted = ranges
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const merged: Range[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) merged.push({ ...range });
    else if (range.end > last.end) last.end = range.end;
  }
  return merged;
}

function fieldRanges(folded: FoldResult, value: string, needles: readonly string[]) {
  return mergeRanges(
    needles.flatMap((needle) => occurrences(folded, needle, value.length)),
  );
}

function rankOf(
  term: SearchableTerm,
  phrase: string,
  tokens: readonly string[],
): MatchRank | null {
  const folded = foldedOf(term);
  const titles = [folded.en, folded.fa];
  if (titles.some((title) => title.text.startsWith(phrase))) return 0;
  if (titles.some((title) => title.text.includes(phrase))) return 1;
  if (folded.text.text.includes(phrase)) return 2;
  if (
    tokens.length > 1 &&
    tokens.every(
      (token) =>
        titles.some((title) => title.text.includes(token)) ||
        folded.text.text.includes(token),
    )
  ) {
    return 3;
  }
  return null;
}

export function searchTerms<T extends SearchableTerm>(
  terms: readonly T[],
  query: string,
  opts?: { source?: number | null },
): TermHit<T>[] {
  const source = opts?.source;
  const pool =
    source == null ? terms : terms.filter((term) => term.sources.includes(source));
  const phrase = foldText(query).text;
  if (!phrase) {
    return pool
      .slice()
      .sort(compareByDateDesc)
      .map((term) => ({ term, rank: -1, ranges: null }));
  }

  const tokens = queryTokens(query);
  const hits: TermHit<T>[] = [];
  for (const term of pool) {
    const rank = rankOf(term, phrase, tokens);
    if (rank == null) continue;
    const folded = foldedOf(term);
    const needles = rank === 3 ? tokens : [phrase];
    hits.push({
      term,
      rank,
      ranges: {
        en: fieldRanges(folded.en, term.en, needles),
        fa: fieldRanges(folded.fa, term.fa ?? "", needles),
        text: fieldRanges(folded.text, term.text, needles),
      },
    });
  }

  hits.sort(
    (left, right) => left.rank - right.rank || compareByDateDesc(left.term, right.term),
  );
  return hits;
}

export function splitByRanges(text: string, ranges: readonly Range[]) {
  if (!text) return [];
  const merged = mergeRanges(
    ranges.map((range) => ({
      start: Math.max(0, Math.min(range.start, text.length)),
      end: Math.max(0, Math.min(range.end, text.length)),
    })),
  );
  const parts: Array<{ text: string; hit: boolean }> = [];
  let cursor = 0;
  for (const range of merged) {
    if (range.start > cursor)
      parts.push({ text: text.slice(cursor, range.start), hit: false });
    parts.push({ text: text.slice(range.start, range.end), hit: true });
    cursor = range.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts.filter((part) => part.text.length > 0);
}
