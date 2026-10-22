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
          workgroups: z.number(),
          conference: z.number(),
          award: z.number(),
          partners: z.number(),
          membership: z.number(),
          contact: z.number(),
          terminology: z.number(),
        }),
        sets: z.object({
          publications: categorySet,
          opportunities: categorySet,
          conference: categorySet,
          workgroups: categorySet,
          quarterlies: categorySet,
          award: categorySet,
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
        publicationsLink: z.string(),
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
        }),
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
        partnersEmpty: z.string(),
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
    pages: defineCollection({
      type: "page",
      source: "about.md",
      schema: z.object({
        placeholder: z.boolean().default(true),
      }),
    }),
  },
});
