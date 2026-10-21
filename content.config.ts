import { defineCollection, defineContentConfig, z } from "@nuxt/content";

const link = z.object({
  label: z.string(),
  to: z.string(),
});

export default defineContentConfig({
  collections: {
    site: defineCollection({
      type: "data",
      source: "site.yml",
      schema: z.object({
        name: z.string(),
        shortName: z.string(),
        description: z.string(),
        nav: z.array(link),
        membership: link,
        address: z.array(z.string()),
        footerColumns: z.array(
          z.object({
            title: z.string(),
            links: z.array(link),
          }),
        ),
        listings: z.object({
          research: z.object({ title: z.string(), description: z.string() }),
          projects: z.object({ title: z.string(), description: z.string() }),
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
    pages: defineCollection({
      type: "page",
      source: "about.md",
      schema: z.object({
        placeholder: z.boolean().default(true),
      }),
    }),
  },
});
