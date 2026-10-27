export class ApiRequestError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(messageOf(payload) || `HTTP ${status}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export function messageOf(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as { message?: unknown; error?: unknown };
  if (typeof record.message === "string") return record.message;
  if (Array.isArray(record.message)) {
    return record.message.filter((item) => typeof item === "string").join(" ");
  }
  if (typeof record.error === "string") return record.error;
  return "";
}

export function isApiError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}
