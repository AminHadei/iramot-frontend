import { resolveContentApiBase } from "~/utils/contentSource";

export function useContentApiBase(): string {
  const config = useRuntimeConfig();
  return resolveContentApiBase({
    internal: config.apiBaseInternal,
    publicBase: config.public.apiBase,
    server: import.meta.server,
  });
}
