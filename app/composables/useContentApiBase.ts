import { resolveContentApiBase } from "~/utils/contentSource";

export function useContentApiBase(): string {
  const config = useRuntimeConfig();
  return resolveContentApiBase({
    internal: config.apiBaseInternal,
    publicBase: config.public.apiBase,
    server: import.meta.server,
  });
}

/** Origin written into image URLs the browser loads. Prefer the public API base. */
export function useMediaRewriteBase(fetchBase: string): string {
  try {
    const pub = String(useRuntimeConfig().public.apiBase ?? "")
      .trim()
      .replace(/\/$/, "");
    if (pub) return pub;
  } catch {
    // Nuxt context is gone after an await inside a data callback.
  }
  return fetchBase.replace(/\/$/, "");
}
