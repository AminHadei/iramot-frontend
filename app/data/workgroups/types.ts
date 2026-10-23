export interface WorkgroupPerson {
  name: string;
  role: string;
  photo?: string;
}

export interface WorkgroupManager {
  name: string;
  photo?: string;
}

export interface WorkgroupSummary {
  id: number;
  slug: string;
  title: string;
  titleFull: string;
  colorIndex: number;
  placeholder: boolean;
  excerpt?: string;
  manager?: WorkgroupManager;
}

export interface WorkgroupFact {
  label: string;
  value: string;
}

export interface WorkgroupLink {
  label: string;
  href: string;
}

export interface WorkgroupMemberList {
  heading: string;
  members: WorkgroupPerson[];
}

export interface WorkgroupList {
  title: string;
  description: string;
  groups: WorkgroupSummary[];
}

export interface WorkgroupArticle extends WorkgroupSummary {
  sectionTitle: string;
  body: string[];
  members: WorkgroupPerson[];
  memberLists: WorkgroupMemberList[];
  facts: WorkgroupFact[];
  links: WorkgroupLink[];
  others: WorkgroupSummary[];
  previous?: WorkgroupSummary;
  next?: WorkgroupSummary;
}

export interface WorkgroupRawPerson {
  name?: string;
  roleSource?: string;
  photo?: string | null;
}

export interface WorkgroupRecord {
  id: number;
  slug: string;
  title: string;
  titleFull: string;
  colorIndex: number;
  excerpt?: string | null;
  body?: string[];
  placeholder?: boolean;
  manager?: { name?: string; photo?: string | null } | null;
  members?: WorkgroupRawPerson[];
  memberLists?: { heading?: string; members?: WorkgroupRawPerson[] }[];
  links?: { label?: string; href?: string }[];
  chair?: WorkgroupRawPerson | null;
  secretary?: WorkgroupRawPerson | null;
}

export interface WorkgroupFile {
  section: { title: string; description: string };
  groups: WorkgroupRecord[];
}

export interface WorkgroupRepository {
  list(): Promise<WorkgroupList>;
  get(slug: string): Promise<WorkgroupArticle | null>;
}
