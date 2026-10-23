import type {
  CatalogImage,
  Quarterly,
  QuarterlyFile,
  QuarterlyList,
  QuarterlyRecord,
  QuarterlyRepository,
} from "~/data/quarterlies/types";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<QuarterlyFile> | null = null;
let indexBase = "";

function projectFile(path: string): string {
  const cwd =
    (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? ".";
  return `${cwd}/${path.replace(/^\//, "")}`;
}

async function readProject<T>(path: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(projectFile(path), "utf8")) as T;
}

function loadIndex(path: string, href: string): Promise<QuarterlyFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readProject<QuarterlyFile>(path)
      : $fetch<QuarterlyFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function presentImage(image: CatalogImage | null | undefined, baseURL: string) {
  const src = image?.src?.trim();
  if (!src || !image) return undefined;
  return {
    src: withBase(baseURL, src),
    width: image.width,
    height: image.height,
    alt: image.alt?.trim() ?? "",
  };
}

function present(record: QuarterlyRecord, baseURL: string, tone: 0 | 1 | 2): Quarterly {
  const description = record.description?.trim();
  const url = record.url?.trim();
  const image = presentImage(record.cover, baseURL);
  return {
    id: record.id,
    slug: record.slug,
    name: record.name.trim(),
    tone,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
  };
}

export function createJsonQuarterlyRepository(baseURL: string): QuarterlyRepository {
  const href = (path: string) => withBase(baseURL, path);

  return {
    async list(): Promise<QuarterlyList> {
      const file = await loadIndex(
        "content/quarterlies.json",
        href("/data/quarterlies/index.json"),
      );
      const items = [...file.items].sort(
        (left, right) => (left.order ?? 0) - (right.order ?? 0),
      );
      return {
        items: items.map((item, index) =>
          present(item, baseURL, (index % 3) as 0 | 1 | 2),
        ),
      };
    },
  };
}
