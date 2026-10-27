import type { HomeContent, SiteContent, ConferenceContent } from "~/types/content";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { rewriteMediaTree, type MediaContext } from "~/utils/mediaUrl";

export interface SiteRepository {
  get(): Promise<SiteContent | null>;
}

export interface HomeRepository {
  get(): Promise<HomeContent | null>;
}

export interface AboutRepository {
  get(): Promise<Record<string, unknown> | null>;
}

export interface ConferenceRepository {
  get(): Promise<ConferenceContent | null>;
}

export interface AwardRepository {
  get(): Promise<Record<string, unknown> | null>;
}

function context(apiBase: string, siteBase: string): MediaContext {
  return { apiBase: apiBase.replace(/\/$/, ""), siteBase };
}

export function createApiSiteRepository(
  apiBase: string,
  siteBase = "/",
): SiteRepository {
  const root = apiBase.replace(/\/$/, "");
  const media = context(root, siteBase);
  return {
    async get() {
      if (!root) return null;
      const site = await fetchJsonOrNull<SiteContent>(`${root}/site`);
      return site ? rewriteMediaTree(site, media) : null;
    },
  };
}

export function createApiHomeRepository(
  apiBase: string,
  siteBase = "/",
): HomeRepository {
  const root = apiBase.replace(/\/$/, "");
  const media = context(root, siteBase);
  return {
    async get() {
      if (!root) return null;
      const home = await fetchJsonOrNull<HomeContent>(`${root}/home`);
      return home ? rewriteMediaTree(home, media) : null;
    },
  };
}

export function createApiAboutRepository(
  apiBase: string,
  siteBase = "/",
): AboutRepository {
  const root = apiBase.replace(/\/$/, "");
  const media = context(root, siteBase);
  return {
    async get() {
      if (!root) return null;
      const about = await fetchJsonOrNull<Record<string, unknown>>(`${root}/about`);
      return about ? rewriteMediaTree(about, media) : null;
    },
  };
}

export function createApiConferenceRepository(
  apiBase: string,
  siteBase = "/",
): ConferenceRepository {
  const root = apiBase.replace(/\/$/, "");
  const media = context(root, siteBase);
  return {
    async get() {
      if (!root) return null;
      const conference = await fetchJsonOrNull<ConferenceContent>(`${root}/conference`);
      return conference ? rewriteMediaTree(conference, media) : null;
    },
  };
}

export function createApiAwardRepository(
  apiBase: string,
  siteBase = "/",
): AwardRepository {
  const root = apiBase.replace(/\/$/, "");
  const media = context(root, siteBase);
  return {
    async get() {
      if (!root) return null;
      const award = await fetchJsonOrNull<Record<string, unknown>>(`${root}/award`);
      return award ? rewriteMediaTree(award, media) : null;
    },
  };
}
