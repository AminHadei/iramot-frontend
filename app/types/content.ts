export interface ContentLink {
  label: string;
  to: string;
  children?: ContentLink[];
}

export interface CategorySet {
  slugs: string[];
  prefixes?: string[];
}

export interface SiteContent {
  name: string;
  shortName: string;
  description: string;
  nav: ContentLink[];
  membership: ContentLink;
  address: string[];
  contacts: Array<{
    label: string;
    href: string;
  }>;
  social: Array<{
    name: "linkedin" | "telegram" | "instagram";
    label: string;
    href: string;
  }>;
  copyright: string;
  miniMenu: ContentLink[];
  footerColumns: Array<{
    title: string;
    links: ContentLink[];
  }>;
  listings: {
    research: { title: string; description: string };
    projects: { title: string; description: string };
    events: { title: string; description: string };
    quarterlies: { title: string; description: string };
    terminology: {
      title: string;
      description: string;
      label: string;
      empty: string;
    };
    statute: { title: string; description: string; file: string; label: string };
  };
  pages: {
    about: number;
    privacy: number;
    opportunities: number;
    workgroups: number;
    conference: number;
    award: number;
    partners: number;
    membership: number;
    contact: number;
    terminology: number;
  };
  sets: {
    publications: CategorySet;
    opportunities: CategorySet;
    conference: CategorySet;
    workgroups: CategorySet;
    quarterlies: CategorySet;
    award: CategorySet;
    boardTag: string;
  };
  eventFilters: Array<{
    label: string;
    to: string;
    posts: string;
    eventIds: number[];
  }>;
  terminology: {
    sources: Array<{ id: number; label: string }>;
  };
  ui: {
    menu: string;
    close: string;
    skip: string;
    by: string;
    home: string;
    notFound: string;
    notFoundBody: string;
    previous: string;
    next: string;
    navigation: string;
    siteMap: string;
    all: string;
    emptyBody: string;
    team: string;
    emptyPeople: string;
    emptyPartners: string;
    more: string;
    latest: string;
    sort: string;
    dateDescending: string;
    dateAscending: string;
    author: string;
  };
  styleguide: {
    title: string;
    description: string;
    splash: string;
    intro: string;
    spotlight: string;
    listing: string;
    projects: string;
    article: string;
    people: string;
    emptyPerson: string;
  };
  placeholder?: boolean;
}

export interface ArchiveTerm {
  id: number;
  slug: string;
  name: string;
}

export interface ArchiveItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content?: string;
  categories?: ArchiveTerm[];
  tags?: ArchiveTerm[];
  featuredImage?: { localPath?: string | null } | null;
  fields?: {
    "word-category"?: number[];
  };
}

export interface ArchiveFile {
  body?: ArchiveItem[];
}

export interface HomeContent {
  eyebrow: string;
  title: string;
  dek: string;
  links: ContentLink[];
  spotlightTitle: string;
  projectsTitle: string;
  projectsLinkLabel: string;
  recentTitle: string;
  recentLinkLabel: string;
  publicationsLink: string;
  strip: {
    event: string;
    conference: string;
    membership: string;
  };
  sections: {
    publications: string;
    workgroups: string;
    events: string;
    terms: string;
    quarterlies: string;
    partners: string;
    newsletter: string;
  };
  sectionLinks: {
    workgroups: string;
    events: string;
    terms: string;
    quarterlies: string;
    partners: string;
  };
  search: {
    label: string;
    empty: string;
  };
  newsletter: {
    link: string;
    to: string;
    note: string;
  };
  partnersEmpty: string;
  placeholder: boolean;
}

export interface GuideSection {
  title: string;
  body?: string;
  items?: Array<{
    title: string;
    excerpt?: string;
    category?: string;
  }>;
}

export interface GuideContent {
  key: string;
  title: string;
  description: string;
  kind: "reading" | "landing" | "article" | "page";
  links: ContentLink[];
  sections: GuideSection[];
  placeholder: boolean;
}

export interface FocusArea {
  title: string;
  question: string;
  to: string;
  placeholder: boolean;
}

export interface ArticleFields {
  title: string;
  description: string;
  path: string;
  date?: string;
  category?: string;
  authors?: string[];
  image?: string;
}
