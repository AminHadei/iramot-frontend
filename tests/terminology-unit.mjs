import { execSync } from "node:child_process";
import { readFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

function esbuildBin() {
  const root = "node_modules/.pnpm";
  const entry = readdirSync(root).find((name) => name.startsWith("esbuild@"));
  if (!entry) throw new Error("esbuild is not installed");
  return join(root, entry, "node_modules/esbuild/bin/esbuild");
}

const dir = mkdtempSync(join(tmpdir(), "term-search-"));
const out = join(dir, "persianSearch.mjs");
execSync(
  `"${esbuildBin()}" app/utils/persianSearch.ts --bundle --format=esm --outfile=${out}`,
  { stdio: "inherit" },
);
const { foldText, queryTokens, compareByDateDesc, searchTerms, splitByRanges } =
  await import(pathToFileURL(out).href);

let failed = 0;
function check(name, actual, expected) {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  if (!same) {
    failed += 1;
    console.error(
      `FAIL ${name}\n  actual   ${JSON.stringify(actual)}\n  expected ${JSON.stringify(expected)}`,
    );
  }
}

check(
  "arabic yeh equals persian yeh",
  foldText("نوآوري").text,
  foldText("نوآوری").text,
);
check("yeh code", foldText("ي").text.codePointAt(0), 0x6cc);
check("arabic kaf", foldText("ك").text, "ک");
check("zwnj dropped", foldText("نو\u200cآوری").text, foldText("نوآوری").text);
check("digits", foldText("۱۴۰۴").text, "1404");
check("arabic digits", foldText("١٢٣").text, "123");
check("diacritic and kashida", foldText("فن\u0651ا\u0640وری").text, "فناوری");
check("latin case", foldText("GateKeepers").text, "gatekeepers");
check("tokens", queryTokens("  lead   user "), ["lead", "user"]);

const marked = foldText("فن\u200cآوری");
const hit = searchTerms(
  [
    {
      id: 1,
      en: "x",
      fa: "فن\u200cآوری",
      text: "<script>",
      sources: [],
      date: "2025-01-01",
    },
  ],
  "فناوری",
);
check("zwnj range", hit[0].ranges.fa, [{ start: 0, end: "فن\u200cآوری".length }]);
check("xss pieces", splitByRanges(hit[0].term.text, hit[0].ranges.text), [
  { text: "<script>", hit: false },
]);
check("map covers folded chars", marked.map.length, marked.text.length);

const terms = [
  { id: 1, en: "alpha beta", fa: null, text: "", sources: [115], date: "2025-01-01" },
  { id: 2, en: "beta", fa: "آلفا شروع", text: "", sources: [116], date: "2025-02-01" },
  {
    id: 3,
    en: "gamma",
    fa: null,
    text: "آلفا در تعریف",
    sources: [115],
    date: "2025-03-01",
  },
  {
    id: 4,
    en: "delta",
    fa: "پس آلفا",
    text: "omega",
    sources: [181],
    date: "2025-04-01",
  },
  { id: 5, en: "older", fa: null, text: "", sources: [], date: "2024-01-01" },
  { id: 6, en: "same", fa: null, text: "", sources: [], date: "2024-01-01" },
  { id: 7, en: "undated", fa: null, text: "", sources: [], date: null },
];
check(
  "empty query is date desc then id desc, undated last",
  searchTerms(terms, "").map((item) => item.term.id),
  [4, 3, 2, 1, 6, 5, 7],
);
check("compare undated", compareByDateDesc(terms[6], terms[4]) > 0, true);

const alpha = searchTerms(terms, "آلفا");
check(
  "ranks",
  alpha.map((item) => [item.term.id, item.rank]),
  [
    [2, 0],
    [4, 1],
    [3, 2],
  ],
);
const loose = searchTerms(
  [
    {
      id: 1,
      en: "capacity innovation",
      fa: null,
      text: "",
      sources: [],
      date: "2025-01-02",
    },
    {
      id: 2,
      en: "innovation",
      fa: null,
      text: "capacity",
      sources: [],
      date: "2025-01-01",
    },
  ],
  "capacity innovation",
);
check(
  "multi-word rank",
  loose.map((item) => [item.term.id, item.rank]),
  [
    [1, 0],
    [2, 3],
  ],
);
check(
  "source filter",
  searchTerms(terms, "", { source: 115 }).map((item) => item.term.id),
  [3, 1],
);

const index = JSON.parse(readFileSync("public/data/terms/index.json", "utf8"));
const all = index.items.map((item) => ({
  id: item.id,
  en: item.title,
  fa: item.fa,
  text: item.text,
  sources: item.sources,
  date: item.date,
}));
check("total", all.length, 586);
check("innovation count", searchTerms(all, "نوآوری").length, 115);
check("arabic yeh count", searchTerms(all, "نوآوري").length, 115);
check("creativity count", searchTerms(all, "خلاقیت").length, 0);
check("gatekeepers count", searchTerms(all, "gatekeepers").length, 1);
check(
  "default first ids",
  searchTerms(all, "")
    .slice(0, 3)
    .map((item) => item.term.id),
  [9914, 9979, 9973],
);

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("terminology unit tests passed");
