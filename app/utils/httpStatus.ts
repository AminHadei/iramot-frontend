export function statusOf(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const record = error as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };
  const status = record.statusCode ?? record.status ?? record.response?.status;
  return typeof status === "number" ? status : null;
}

export function isNotFoundError(error: unknown): boolean {
  return statusOf(error) === 404;
}
