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
  WorkgroupSummary,
} from "~/data/workgroups/types";
import { resolveContentFile } from "~/utils/mediaUrl";

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

function presentPhoto(
  photo: string | null | undefined,
  baseURL: string,
  apiBase: string,
) {
  if (!photo) return undefined;
  return resolveContentFile(photo, { apiBase, siteBase: baseURL });
}

function presentManager(
  manager: WorkgroupRecord["manager"],
  baseURL: string,
  apiBase: string,
): WorkgroupManager | undefined {
  const name = manager?.name?.trim();
  if (!name) return undefined;
  const photo = presentPhoto(manager?.photo, baseURL, apiBase);
  return photo ? { name, photo } : { name };
}

function presentPerson(
  person: WorkgroupRawPerson,
  baseURL: string,
  apiBase: string,
): WorkgroupPerson | undefined {
  const name = person.name?.trim();
  if (!name) return undefined;
  const photo = presentPhoto(person.photo, baseURL, apiBase);
  return photo
    ? { name, role: person.roleSource?.trim() ?? "", photo }
    : { name, role: person.roleSource?.trim() ?? "" };
}

function presentPeople(
  people: WorkgroupRawPerson[] | undefined,
  baseURL: string,
  apiBase: string,
) {
  return (people ?? []).flatMap((person) => {
    const card = presentPerson(person, baseURL, apiBase);
    return card ? [card] : [];
  });
}

function presentLists(
  record: WorkgroupRecord,
  baseURL: string,
  apiBase: string,
): WorkgroupMemberList[] {
  return (record.memberLists ?? []).flatMap((list) => {
    const members = presentPeople(list.members, baseURL, apiBase);
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

function presentSummary(
  record: WorkgroupRecord,
  baseURL: string,
  apiBase: string,
): WorkgroupSummary {
  const manager = presentManager(record.manager, baseURL, apiBase);
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

export function listFromWorkgroupFile(
  file: WorkgroupFile,
  baseURL: string,
  apiBase = "",
): WorkgroupList {
  return {
    title: file.section.title,
    description: file.section.description,
    groups: file.groups.map((group) => presentSummary(group, baseURL, apiBase)),
  };
}

export function articleFromWorkgroupFile(
  file: WorkgroupFile,
  slug: string,
  baseURL: string,
  apiBase = "",
): WorkgroupArticle | null {
  const index = file.groups.findIndex((group) => group.slug === slug);
  const record = file.groups[index];
  if (!record) return null;
  const groups = file.groups.map((group) => presentSummary(group, baseURL, apiBase));
  const summary = groups[index];
  if (!summary) return null;
  return {
    ...summary,
    sectionTitle: file.section.title,
    body: presentBody(record),
    members: presentPeople(record.members, baseURL, apiBase),
    memberLists: presentLists(record, baseURL, apiBase),
    facts: presentFacts(record),
    links: presentLinks(record),
    others: groups.filter((group) => group.slug !== slug),
    previous: groups[index - 1],
    next: groups[index + 1],
  };
}
