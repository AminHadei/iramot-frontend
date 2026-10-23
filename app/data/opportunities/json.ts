import type {
  Opportunity,
  OpportunityFile,
  OpportunityImage,
  OpportunityList,
  OpportunityRecord,
  OpportunityRepository,
  OpportunityType,
} from "~/data/opportunities/types";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<OpportunityFile> | null = null;
let indexBase = "";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function projectFile(path: string): string {
  const cwd =
    (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? ".";
  return `${cwd}/${path.replace(/^\//, "")}`;
}

async function readProject<T>(path: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(projectFile(path), "utf8")) as T;
}

function loadIndex(path: string, href: string): Promise<OpportunityFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readProject<OpportunityFile>(path)
      : $fetch<OpportunityFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function warn(id: string, reason: string) {
  if (import.meta.dev) console.warn(`opportunity ${id}: ${reason}`);
}

function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function validDate(value: string): boolean {
  if (!isoDate.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function httpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function opportunityType(
  value: OpportunityRecord["type"],
): OpportunityType | undefined {
  if (value === "research" || value === "job") return value;
  return undefined;
}

function presentImage(image: OpportunityImage | null | undefined, baseURL: string) {
  const src = image?.src?.trim();
  if (!src || !image) return undefined;
  return {
    src: withBase(baseURL, src),
    width: image.width,
    height: image.height,
    alt: image.alt?.trim() ?? "",
  };
}

function present(record: OpportunityRecord, baseURL: string): Opportunity | undefined {
  const id = record.id.trim();
  const title = text(record.title);
  const url = text(record.url);
  const publishedAt = text(record.publishedAt);
  if (!title || !url || !httpsUrl(url)) {
    warn(id || record.id, "dropped, url must be https");
    return undefined;
  }
  if (!publishedAt || !validDate(publishedAt)) {
    warn(id, "dropped, publishedAt is not a date");
    return undefined;
  }
  const deadline = text(record.deadline);
  const description = text(record.description);
  const organization = text(record.organization);
  const type = opportunityType(record.type);
  const image = presentImage(record.image, baseURL);
  if (record.type && !type) warn(id, "type dropped");
  if (deadline && !validDate(deadline)) warn(id, "deadline dropped");
  return {
    id,
    title,
    url,
    publishedAt,
    tone: 0,
    ...(record.sample ? { sample: true } : {}),
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(organization ? { organization } : {}),
    ...(type ? { type } : {}),
    ...(deadline && validDate(deadline) ? { deadline } : {}),
  };
}

export function createJsonOpportunityRepository(
  baseURL: string,
  includeSamples: boolean,
): OpportunityRepository {
  const href = (path: string) => withBase(baseURL, path);

  return {
    async list(): Promise<OpportunityList> {
      const file = await loadIndex(
        "content/opportunities.json",
        href("/data/opportunities/index.json"),
      );
      const sorted = file.items
        .filter((item) => includeSamples || item.sample !== true)
        .sort((left, right) => {
          const byDate = (right.publishedAt ?? "").localeCompare(
            left.publishedAt ?? "",
          );
          if (byDate !== 0) return byDate;
          return right.id.localeCompare(left.id);
        });
      const cards = sorted.flatMap((item) => {
        const card = present(item, baseURL);
        return card ? [card] : [];
      });
      return {
        items: cards.map((card, index) => ({
          ...card,
          tone: (index % 3) as 0 | 1 | 2,
        })),
      };
    },
  };
}
