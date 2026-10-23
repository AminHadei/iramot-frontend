export interface ContentLink {
  label: string;
  to: string;
  children?: ContentLink[];
}

export interface CategorySet {
  slugs: string[];
  prefixes?: string[];
}

export interface ConferenceBanner {
  title: string | null;
  startDate: string | null;
  endDate: string | null;
  dateText: string | null;
  place: string | null;
  image: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export interface ConferenceContent {
  banner: ConferenceBanner;
  intro: string | null;
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
    partners: { title: string; description: string };
    terminology: {
      title: string;
      description: string;
      label: string;
      empty: string;
      sourceLabel: string;
      pending: string;
      statusDefault: string;
      statusResults: string;
      statusEmpty: string;
      shown: string;
      loadMore: string;
      clear: string;
      expand: string;
      collapse: string;
      definition: string;
    };
    statute: { title: string; description: string; file: string; label: string };
  };
  pages: {
    about: number;
    privacy: number;
    opportunities: number;
    conference: number;
    award: number;
    membership: number;
    contact: number;
    terminology: number;
  };
  sets: {
    publications: CategorySet;
    opportunities: CategorySet;
    latest: CategorySet;
    news: CategorySet;
    boardTag: string;
  };
  conference: ConferenceContent;
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
    newsAll: string;
    newsEmpty: string;
    newsPage: string;
    newsNewest: string;
    newsOldest: string;
    newsAuthor: string;
    newsRelated: string;
    newsRead: string;
    newsCategory: string;
    newsContents: string;
    eventPast: string;
    eventUpcoming: string;
    eventDetails: string;
    eventTime: string;
    eventPlace: string;
    eventMode: string;
    eventExpert: string;
    eventPresenter: string;
    eventLead: string;
    eventInstructor: string;
    eventRegister: string;
    eventVideo: string;
    eventRelated: string;
    eventEmpty: string;
    eventInPerson: string;
    eventOnline: string;
    workgroupView: string;
    workgroupPage: string;
    workgroupAbout: string;
    workgroupManager: string;
    workgroupMembers: string;
    workgroupInfo: string;
    workgroupLinks: string;
    workgroupOthers: string;
    workgroupPrevious: string;
    workgroupNext: string;
    workgroupEmpty: string;
    privacyContents: string;
    privacyTop: string;
    privacyUpdated: string;
    emptyQuarterlies: string;
    listWebsite: string;
    listExternal: string;
    awardTopic: string;
    awardNews: string;
    awardHeroTitle: string;
    awardHeroSubtitle: string;
    conferenceNews: string;
    conferenceTitle: string;
    conferenceNeutral: string | null;
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

export interface SpotlightGroupRecord {
  title: string;
  body: string;
  color: number;
}

export interface SpotlightPostRecord {
  id: number;
  title: string;
  date: string;
  href: string;
  category: string;
  excerpt: string;
  image: string;
  author?: string;
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
  readLabel: string;
  viewLabel: string;
  publicationsLink: string;
  spotlight: {
    heading: string;
    intro: string;
    postsTitle: string;
    groups: SpotlightGroupRecord[];
    posts: SpotlightPostRecord[];
  };
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
    news: string;
  };
  programs: Array<{
    title: string;
    to: string;
    page: number;
  }>;
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
