const persianDigit = "۰۱۲۳۴۵۶۷۸۹";

export function persianDigits(value: number | string) {
  return String(value).replace(/\d/g, (digit) => persianDigit[Number(digit)] ?? digit);
}

const persianDate = new Intl.DateTimeFormat("fa-IR", {
  calendar: "persian",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatPersianDate(value: string) {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return persianDate.format(date);
}
