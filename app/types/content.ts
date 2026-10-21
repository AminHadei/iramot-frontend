export interface ContentLink {
  label: string;
  to: string;
}

export interface SiteContent {
  name: string;
  shortName: string;
  description: string;
  nav: ContentLink[];
  membership: ContentLink;
  address: string[];
  footerColumns: Array<{
    title: string;
    links: ContentLink[];
  }>;
  listings: {
    research: { title: string; description: string };
    projects: { title: string; description: string };
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
