interface CalendarParts {
  day: string;
  month: string;
  year: string;
}

const persianCalendar = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function calendarParts(date: Date): CalendarParts | null {
  const parts: Partial<CalendarParts> = {};
  for (const part of persianCalendar.formatToParts(date)) {
    if (part.type === "day" || part.type === "month" || part.type === "year") {
      parts[part.type] = part.value;
    }
  }
  if (!parts.day || !parts.month || !parts.year) return null;
  return { day: parts.day, month: parts.month, year: parts.year };
}

function oneDay(parts: CalendarParts): string {
  return `${parts.day} ${parts.month} ${parts.year}`;
}

export function formatConferenceDates(
  startDate: string | null,
  endDate: string | null,
): string | null {
  if (!startDate) return null;
  const start = parseIsoDate(startDate);
  if (!start) return null;
  const startParts = calendarParts(start);
  if (!startParts) return null;
  if (!endDate) return oneDay(startParts);

  const end = parseIsoDate(endDate);
  if (!end || end.getTime() < start.getTime()) return null;
  const endParts = calendarParts(end);
  if (!endParts) return null;
  if (
    startParts.day === endParts.day &&
    startParts.month === endParts.month &&
    startParts.year === endParts.year
  ) {
    return oneDay(startParts);
  }
  if (startParts.month === endParts.month && startParts.year === endParts.year) {
    return `${startParts.day} و ${endParts.day} ${startParts.month} ${startParts.year}`;
  }
  if (startParts.year === endParts.year) {
    return `${startParts.day} ${startParts.month} تا ${endParts.day} ${endParts.month} ${endParts.year}`;
  }
  return `${startParts.day} ${startParts.month} ${startParts.year} تا ${endParts.day} ${endParts.month} ${endParts.year}`;
}
