import { isNotFoundError } from "~/utils/httpStatus";

export async function fetchJsonOrNull<T>(
  url: string,
  query?: object,
): Promise<T | null> {
  try {
    const body = await $fetch<T | null>(url, {
      query: query as Record<string, unknown> | undefined,
    });
    return body ?? null;
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
