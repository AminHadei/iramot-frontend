import type { AuthUser } from "~/types/membership";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function readUser(body: unknown): AuthUser | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const source =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record;
  const id = source.id ?? source._id;
  const mobile = text(source.mobile);
  if ((typeof id !== "string" && typeof id !== "number") || !mobile) return null;
  const role = text(source.role) || "user";
  return {
    id: String(id),
    firstName: text(source.firstName ?? source.first_name),
    lastName: text(source.lastName ?? source.last_name),
    mobile,
    email: text(source.email) || null,
    nationalCode: text(source.nationalCode) || null,
    role,
    isActive:
      source.isActive === undefined
        ? source.active === undefined
          ? true
          : Boolean(source.active)
        : Boolean(source.isActive),
    active:
      source.isActive === undefined
        ? source.active === undefined
          ? true
          : Boolean(source.active)
        : Boolean(source.isActive),
  };
}

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}
