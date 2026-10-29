import { persianDigits } from "~/utils/persianDate";

export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount)))
    return "";
  return persianDigits(new Intl.NumberFormat("en-US").format(Number(amount)));
}

export function recordId(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const record = value as { id?: unknown; _id?: unknown };
  const id = record.id ?? record._id;
  return id === undefined || id === null ? "" : String(id);
}
