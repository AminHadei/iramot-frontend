import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const link = z.object({
  label: z.string(),
  to: z.string(),
});

const navItem = link.extend({
  children: z.array(link).optional(),
});

const categorySet = z.object({
  slugs: z.array(z.string()),
  prefixes: z.array(z.string()).optional(),
});

const listingText = z.object({
  title: z.string(),
  description: z.string(),
});

const archiveItem = z
  .object({
    id: z.number(),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().optional().default(""),
    date: z.string(),
    categories: z
      .array(
        z.object({
          id: z.number(),
          slug: z.string(),
          name: z.string(),
        }),
      )
      .optional()
      .default([]),
    featuredImage: z
      .object({
        localPath: z.string().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
    fields: z
      .object({
        "word-category": z.array(z.number()).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

const archiveFile = z
  .object({
    body: z.array(archiveItem),
  })
  .passthrough();

export default defineContentConfig({
  collections: {
    site: defineCollection({
      type: "data",
      source: "site.yml",
      schema: z.object({
        name: z.string(),
        shortName: z.string(),
        description: z.string(),
        nav: z.array(navItem),
        membership: link,
        address: z.array(z.string()),
        contacts: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
          }),
        ),
        social: z.array(
          z.object({
            name: z.enum(["linkedin", "telegram", "instagram"]),
            label: z.string(),
            href: z.string(),
          }),
        ),
        copyright: z.string(),
        miniMenu: z.array(link),
        footerColumns: z.array(
          z.object({
            title: z.string(),
            links: z.array(link),
          }),
        ),
        listings: z.object({
          research: listingText,
          projects: listingText,
          events: listingText,
          quarterlies: listingText,
          partners: listingText,
          terminology: listingText.extend({
            label: z.string(),
            empty: z.string(),
          }),
          statute: listingText.extend({
            file: z.string(),
            label: z.string(),
          }),
        }),
        pages: z.object({
          about: z.number(),
          privacy: z.number(),
          opportunities: z.number(),
          conference: z.number(),
          award: z.number(),
          membership: z.number(),
          contact: z.number(),
          terminology: z.number(),
        }),
        sets: z.object({
          publications: categorySet,
          opportunities: categorySet,
          conference: categorySet,
          latest: categorySet,
          news: categorySet,
          boardTag: z.string(),
        }),
        eventFilters: z.array(
          z.object({
            label: z.string(),
            to: z.string(),
            posts: z.string(),
            eventIds: z.array(z.number()),
          }),
        ),
        terminology: z.object({
          sources: z.array(
            z.object({
              id: z.number(),
              label: z.string(),
            }),
          ),
        }),
        ui: z.object({
          menu: z.string(),
          close: z.string(),
          skip: z.string(),
          by: z.string(),
          home: z.string(),
          notFound: z.string(),
          notFoundBody: z.string(),
          previous: z.string(),
          next: z.string(),
          navigation: z.string(),
          siteMap: z.string(),
          all: z.string(),
          emptyBody: z.string(),
          team: z.string(),
          emptyPeople: z.string(),
          emptyPartners: z.string(),
          more: z.string(),
          latest: z.string(),
          sort: z.string(),
          dateDescending: z.string(),
          dateAscending: z.string(),
          author: z.string(),
          newsAll: z.string(),
          newsEmpty: z.string(),
          newsPage: z.string(),
          newsNewest: z.string(),
          newsOldest: z.string(),
          newsAuthor: z.string(),
          newsRelated: z.string(),
          newsRead: z.string(),
          newsCategory: z.string(),
          newsContents: z.string(),
          eventPast: z.string(),
          eventUpcoming: z.string(),
          eventDetails: z.string(),
          eventTime: z.string(),
          eventPlace: z.string(),
          eventMode: z.string(),
          eventExpert: z.string(),
          eventPresenter: z.string(),
          eventLead: z.string(),
          eventInstructor: z.string(),
          eventRegister: z.string(),
          eventVideo: z.string(),
          eventRelated: z.string(),
          eventEmpty: z.string(),
          eventInPerson: z.string(),
          eventOnline: z.string(),
          workgroupView: z.string(),
          workgroupPage: z.string(),
          workgroupAbout: z.string(),
          workgroupManager: z.string(),
          workgroupMembers: z.string(),
          workgroupInfo: z.string(),
          workgroupLinks: z.string(),
          workgroupOthers: z.string(),
          workgroupPrevious: z.string(),
          workgroupNext: z.string(),
          workgroupEmpty: z.string(),
          privacyContents: z.string(),
          privacyTop: z.string(),
          privacyUpdated: z.string(),
          emptyQuarterlies: z.string(),
          listWebsite: z.string(),
          listExternal: z.string(),
          awardTopic: z.string(),
          awardNews: z.string(),
          awardHeroTitle: z.string(),
          awardHeroSubtitle: z.string(),
        }),
        styleguide: z.object({
          title: z.string(),
          description: z.string(),
          splash: z.string(),
          intro: z.string(),
          spotlight: z.string(),
          listing: z.string(),
          projects: z.string(),
          article: z.string(),
          people: z.string(),
          emptyPerson: z.string(),
        }),
        placeholder: z.boolean().default(true),
      }),
    }),
    home: defineCollection({
      type: "data",
      source: "home.yml",
      schema: z.object({
        eyebrow: z.string(),
        title: z.string(),
        dek: z.string(),
        links: z.array(link),
        spotlightTitle: z.string(),
        projectsTitle: z.string(),
        projectsLinkLabel: z.string(),
        recentTitle: z.string(),
        recentLinkLabel: z.string(),
        readLabel: z.string(),
        viewLabel: z.string(),
        publicationsLink: z.string(),
        spotlight: z.object({
          heading: z.string(),
          intro: z.string(),
          postsTitle: z.string(),
          groups: z.array(
            z.object({
              title: z.string(),
              body: z.string(),
              color: z.number(),
            }),
          ),
          posts: z.array(
            z.object({
              id: z.number(),
              title: z.string(),
              date: z.string(),
              href: z.string(),
              category: z.string(),
              excerpt: z.string(),
              image: z.string(),
              author: z.string().optional(),
            }),
          ),
        }),
        strip: z.object({
          event: z.string(),
          conference: z.string(),
          membership: z.string(),
        }),
        sections: z.object({
          publications: z.string(),
          workgroups: z.string(),
          events: z.string(),
          terms: z.string(),
          quarterlies: z.string(),
          partners: z.string(),
          newsletter: z.string(),
          news: z.string(),
        }),
        programs: z.array(
          z.object({
            title: z.string(),
            to: z.string(),
            page: z.number(),
          }),
        ),
        sectionLinks: z.object({
          workgroups: z.string(),
          events: z.string(),
          terms: z.string(),
          quarterlies: z.string(),
          partners: z.string(),
        }),
        search: z.object({
          label: z.string(),
          empty: z.string(),
        }),
        newsletter: z.object({
          link: z.string(),
          to: z.string(),
          note: z.string(),
        }),
        placeholder: z.boolean().default(true),
      }),
    }),
    areas: defineCollection({
      type: "data",
      source: "areas/*.yml",
      schema: z.object({
        title: z.string(),
        question: z.string(),
        to: z.string(),
        placeholder: z.boolean().default(true),
      }),
    }),
    posts: defineCollection({
      type: "page",
      source: "research/*.md",
      schema: z.object({
        date: z.string(),
        category: z.string(),
        authors: z.array(z.string()).default([]),
        image: z.string().optional(),
        spotlight: z.boolean().default(false),
        placeholder: z.boolean().default(true),
      }),
    }),
    projects: defineCollection({
      type: "page",
      source: "projects/*.md",
      schema: z.object({
        authors: z.array(z.string()).default([]),
        image: z.string().optional(),
        featured: z.boolean().default(false),
        placeholder: z.boolean().default(true),
      }),
    }),
    archivePosts: defineCollection({
      type: "data",
      source: "posts.json",
      schema: archiveFile,
    }),
    archiveEvents: defineCollection({
      type: "data",
      source: "events.json",
      schema: archiveFile,
    }),
    archiveTerms: defineCollection({
      type: "data",
      source: "word-choosing.json",
      schema: archiveFile,
    }),
    archivePages: defineCollection({
      type: "data",
      source: "pages.json",
      schema: archiveFile,
    }),
    guides: defineCollection({
      type: "data",
      source: "guides/*.yml",
      schema: z.object({
        key: z.string(),
        title: z.string(),
        description: z.string(),
        kind: z.enum(["reading", "landing", "article", "page"]),
        links: z.array(link).default([]),
        sections: z
          .array(
            z.object({
              title: z.string(),
              body: z.string().optional(),
              items: z
                .array(
                  z.object({
                    title: z.string(),
                    excerpt: z.string().optional(),
                    category: z.string().optional(),
                  }),
                )
                .default([]),
            }),
          )
          .default([]),
        placeholder: z.boolean().default(true),
      }),
    }),
    aboutPage: defineCollection({
      type: "data",
      source: "about.yml",
      schema: z.object({ title: z.string() }).passthrough(),
    }),
    pages: defineCollection({
      type: "page",
      source: "about.md",
      schema: z.object({
        lead: z.string(),
        placeholder: z.boolean().default(true),
      }),
    }),
  },
});
