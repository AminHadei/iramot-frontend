import type {
  WorkgroupArticle,
  WorkgroupFact,
  WorkgroupFile,
  WorkgroupLink,
  WorkgroupList,
  WorkgroupManager,
  WorkgroupMemberList,
  WorkgroupPerson,
  WorkgroupRawPerson,
  WorkgroupRecord,
  WorkgroupRepository,
  WorkgroupSummary,
} from "~/data/workgroups/types";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<WorkgroupFile> | null = null;
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

function loadIndex(path: string, href: string): Promise<WorkgroupFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readProject<WorkgroupFile>(path)
      : $fetch<WorkgroupFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function blocked(text: string) {
  return text.includes("لورم") || text.includes("شرایط فعلی تکنولوژی مورد نیاز");
}

function presentExcerpt(record: WorkgroupRecord) {
  if (record.placeholder) return undefined;
  const excerpt = record.excerpt?.trim();
  if (!excerpt || blocked(excerpt)) return undefined;
  return excerpt;
}

function presentBody(record: WorkgroupRecord) {
  if (record.placeholder) return [];
  return (record.body ?? [])
    .map((line) => line.trim())
    .filter((line) => line && !blocked(line));
}

function presentManager(
  manager: WorkgroupRecord["manager"],
  baseURL: string,
): WorkgroupManager | undefined {
  const name = manager?.name?.trim();
  if (!name) return undefined;
  const photo = manager?.photo ? withBase(baseURL, manager.photo) : undefined;
  return photo ? { name, photo } : { name };
}

function presentPerson(
  person: WorkgroupRawPerson,
  baseURL: string,
): WorkgroupPerson | undefined {
  const name = person.name?.trim();
  if (!name) return undefined;
  const photo = person.photo ? withBase(baseURL, person.photo) : undefined;
  return photo
    ? { name, role: person.roleSource?.trim() ?? "", photo }
    : { name, role: person.roleSource?.trim() ?? "" };
}

function presentPeople(people: WorkgroupRawPerson[] | undefined, baseURL: string) {
  return (people ?? []).flatMap((person) => {
    const card = presentPerson(person, baseURL);
    return card ? [card] : [];
  });
}

function presentLists(record: WorkgroupRecord, baseURL: string): WorkgroupMemberList[] {
  return (record.memberLists ?? []).flatMap((list) => {
    const members = presentPeople(list.members, baseURL);
    const heading = list.heading?.trim();
    if (!heading || !members.length) return [];
    return [{ heading, members }];
  });
}

function presentFact(
  person: WorkgroupRawPerson | null | undefined,
): WorkgroupFact | undefined {
  const label = person?.roleSource?.trim();
  const value = person?.name?.trim();
  if (!label || !value) return undefined;
  return { label, value };
}

function presentFacts(record: WorkgroupRecord) {
  const chair = presentFact(record.chair);
  const secretary = presentFact(record.secretary);
  return chair && secretary ? [chair, secretary] : [];
}

function presentLinks(record: WorkgroupRecord): WorkgroupLink[] {
  return (record.links ?? []).flatMap((link) => {
    const label = link.label?.trim();
    const href = link.href?.trim();
    if (!label || !href) return [];
    return [{ label, href }];
  });
}

function presentSummary(record: WorkgroupRecord, baseURL: string): WorkgroupSummary {
  const manager = presentManager(record.manager, baseURL);
  const excerpt = presentExcerpt(record);
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    titleFull: record.titleFull,
    colorIndex:
      record.colorIndex === 0 || record.colorIndex === 1 || record.colorIndex === 2
        ? record.colorIndex
        : 0,
    placeholder: Boolean(record.placeholder),
    ...(excerpt ? { excerpt } : {}),
    ...(manager ? { manager } : {}),
  };
}

export function createJsonWorkgroupRepository(baseURL: string): WorkgroupRepository {
  const href = (path: string) => withBase(baseURL, path);
  const source = "content/workgroups.json";
  const mirror = "/data/workgroups/index.json";

  async function load() {
    return loadIndex(source, href(mirror));
  }

  return {
    async list(): Promise<WorkgroupList> {
      const file = await load();
      return {
        title: file.section.title,
        description: file.section.description,
        groups: file.groups.map((group) => presentSummary(group, baseURL)),
      };
    },
    async get(slug: string): Promise<WorkgroupArticle | null> {
      const file = await load();
      const index = file.groups.findIndex((group) => group.slug === slug);
      const record = file.groups[index];
      if (!record) return null;
      const groups = file.groups.map((group) => presentSummary(group, baseURL));
      const summary = groups[index];
      if (!summary) return null;
      return {
        ...summary,
        sectionTitle: file.section.title,
        body: presentBody(record),
        members: presentPeople(record.members, baseURL),
        memberLists: presentLists(record, baseURL),
        facts: presentFacts(record),
        links: presentLinks(record),
        others: groups.filter((group) => group.slug !== slug),
        previous: groups[index - 1],
        next: groups[index + 1],
      };
    },
  };
}
