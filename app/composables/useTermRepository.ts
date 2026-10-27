import { createApiTermRepository } from "~/data/terms/api";
import type { TermRepository } from "~/data/terms/types";

export function useTermRepository(): TermRepository {
  return createApiTermRepository(useContentApiBase());
}
