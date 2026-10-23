export const eventPageSize = 15;

export const eventPrograms = [
  { slug: "workshops", color: "#2D317A", onColor: "#FFFDF5" },
  { slug: "reading", color: "#6967AC", onColor: "#FFFDF5" },
  { slug: "thesis", color: "#3F50A0", onColor: "#FFFDF5" },
  { slug: "film", color: "#9A96CA", onColor: "#06011E" },
] as const;

export type EventProgram = (typeof eventPrograms)[number]["slug"];

export const reservedEventSlugs = new Set<string>([
  "page",
  ...eventPrograms.map((program) => program.slug),
]);

const allTone = { color: "#06011E", onColor: "#FFFDF5" };

export function isEventProgram(value: string): value is EventProgram {
  return eventPrograms.some((program) => program.slug === value);
}

export function eventTone(program?: EventProgram): Record<string, string> {
  const tone = eventPrograms.find((item) => item.slug === program) ?? allTone;
  return {
    "--color-category": tone.color,
    "--color-on-category": tone.onColor,
  };
}

export function tehranToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function eventTiming(
  startsAt?: string,
  today = tehranToday(),
): "past" | "upcoming" | undefined {
  if (!startsAt || !/^\d{4}-\d{2}-\d{2}/.test(startsAt)) return undefined;
  const day = startsAt.slice(0, 10);
  return day < today ? "past" : "upcoming";
}

export function eventListingPath(
  page: number,
  program?: EventProgram,
  order?: "asc" | "desc",
) {
  const base = program ? `/events/${program}` : "/events";
  const path = page > 1 ? `${base}/page/${page}` : base;
  if (order === "asc") return `${path}?order=asc`;
  return path;
}
