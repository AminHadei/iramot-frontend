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

function messagesOf(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const message = (payload as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return [message];
  if (Array.isArray(message)) {
    return message.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }
  return [];
}

export function errorsByField(
  payload: unknown,
  fields: string[],
): { fields: Record<string, string>; rest: string } {
  const sorted = [...fields].sort((left, right) => right.length - left.length);
  const mapped: Record<string, string> = {};
  const rest: string[] = [];
  for (const message of messagesOf(payload)) {
    const hits = sorted.filter((field) =>
      new RegExp(`(?:^|[\\s.:'"(])${field}(?:$|[\\s.:'",)]|\\b)`).test(message),
    );
    if (!hits.length) {
      rest.push(message);
      continue;
    }
    for (const field of hits) {
      mapped[field] = mapped[field] ? `${mapped[field]} ${message}` : message;
    }
  }
  return { fields: mapped, rest: rest.join(" ") };
}

export function applyFieldErrors(
  payload: unknown,
  errors: Record<string, string>,
  fields: string[],
): string {
  const parsed = errorsByField(payload, fields);
  for (const [field, message] of Object.entries(parsed.fields)) errors[field] = message;
  return parsed.rest;
}
