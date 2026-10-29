export type ValidationCode =
  | "required"
  | "mobile"
  | "password"
  | "confirm"
  | "nationalCode"
  | "companyId"
  | "email"
  | "date"
  | "fileType"
  | "fileSize";

const persianZero = 0x06f0;
const arabicZero = 0x0660;

export function englishDigits(value: string): string {
  let text = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= persianZero && code <= persianZero + 9) {
      text += String(code - persianZero);
    } else if (code >= arabicZero && code <= arabicZero + 9) {
      text += String(code - arabicZero);
    } else {
      text += char;
    }
  }
  return text;
}

export function isIranMobile(value: string): boolean {
  const digits = englishDigits(value).replace(/[\s-]/g, "");
  const normalized = digits.startsWith("+98")
    ? `0${digits.slice(3)}`
    : digits.startsWith("0098")
      ? `0${digits.slice(4)}`
      : digits.startsWith("98") && digits.length === 12
        ? `0${digits.slice(2)}`
        : digits;
  return /^09\d{9}$/.test(normalized);
}

export function normalizeIranMobile(value: string): string {
  const digits = englishDigits(value).replace(/[\s-]/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

export function isNationalCode(value: string): boolean {
  const code = englishDigits(value).replace(/\D/g, "");
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const sum = digits
    .slice(0, 9)
    .reduce((total, digit, index) => total + digit * (10 - index), 0);
  const remainder = sum % 11;
  const check = remainder < 2 ? remainder : 11 - remainder;
  return check === digits[9];
}

export function isCompanyNationalId(value: string): boolean {
  const code = englishDigits(value).replace(/\D/g, "");
  if (!/^\d{11}$/.test(code)) return false;
  if (/^(\d)\1{10}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const weights = [29, 27, 23, 19, 17];
  const offset = (digits[9] ?? 0) + 2;
  let sum = 0;
  for (let index = 0; index < 10; index += 1) {
    sum += ((digits[index] ?? 0) + offset) * (weights[index % 5] ?? 0);
  }
  const remainder = sum % 11;
  const expected = remainder === 10 ? 0 : remainder;
  return expected === digits[10];
}

export function passwordCode(value: string): ValidationCode | null {
  if (value.length < 8) return "password";
  if (!/[A-Za-z\u0600-\u06FF]/.test(value) || !/\d/.test(englishDigits(value))) {
    return "password";
  }
  return null;
}

export function emailCode(value: string): ValidationCode | null {
  if (!value.trim()) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : "email";
}

export function requiredCode(value: string): ValidationCode | null {
  return value.trim() ? null : "required";
}

export function safeNextPath(value: unknown, fallback = "/panel"): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\"))
    return fallback;
  return raw;
}
