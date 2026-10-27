export const contentSections = [
  "news",
  "terms",
  "events",
  "partners",
  "opportunities",
  "quarterlies",
  "workgroups",
  "projects",
  "areas",
  "research",
  "guides",
  "pages",
  "site",
  "home",
  "about",
  "conference",
  "award",
] as const;

export type ContentSection = (typeof contentSections)[number];

export interface ContentPublicConfig {
  apiBase?: string;
  [key: string]: unknown;
}

export function sectionMode(
  config: ContentPublicConfig,
  section: ContentSection,
): "json" | "api" {
  const explicit = config[`${section}Source`];
  if (explicit === "api") return "api";
  if (explicit === "json") return "json";
  const apiBase = typeof config.apiBase === "string" ? config.apiBase.trim() : "";
  return apiBase ? "api" : "json";
}

export async function withJsonFallback<T>(
  mode: "json" | "api",
  fromApi: () => Promise<T>,
  fromJson: () => Promise<unknown>,
): Promise<T> {
  if (mode !== "api") return (await fromJson()) as T;
  try {
    return await fromApi();
  } catch (error) {
    if (!import.meta.prerender) throw error;
    console.warn("Content API failed during prerender; using JSON.");
    return (await fromJson()) as T;
  }
}

export function repositoryWithJsonFallback<T extends object>(
  mode: "json" | "api",
  api: T,
  json: T,
): T {
  if (mode !== "api") return json;
  const wrapped: Record<string, unknown> = {};
  for (const key of Object.keys(api)) {
    const value = (api as Record<string, unknown>)[key];
    if (typeof value !== "function") {
      wrapped[key] = value;
      continue;
    }
    wrapped[key] = async (...args: unknown[]) => {
      try {
        return await (value as (...input: unknown[]) => Promise<unknown>).apply(
          api,
          args,
        );
      } catch (error) {
        if (!import.meta.prerender) throw error;
        const fallback = (json as Record<string, unknown>)[key];
        if (typeof fallback !== "function") throw error;
        console.warn(`Content API ${key} failed during prerender; using JSON.`);
        return (fallback as (...input: unknown[]) => unknown).apply(json, args);
      }
    };
  }
  return wrapped as T;
}

export function sectionApiBase(
  config: ContentPublicConfig,
  section: ContentSection,
): string {
  const specific = config[`${section}ApiBase`];
  const raw =
    typeof specific === "string" && specific.trim() ? specific : config.apiBase;
  return typeof raw === "string" ? raw.replace(/\/$/, "") : "";
}
