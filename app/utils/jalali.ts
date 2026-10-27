function div(value: number, by: number) {
  return Math.trunc(value / by);
}

function mod(value: number, by: number) {
  return value - Math.trunc(value / by) * by;
}

function gregorianDayNumber(gy: number, gm: number, gd: number) {
  let day =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  day = day - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return day;
}

function dayNumberToGregorian(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const day = div(mod(i, 153), 5) + 1;
  const month = mod(div(i, 153), 12) + 1;
  const year = div(j, 1461) - 100100 + div(8 - month, 6);
  return { year, month, day };
}

function jalaliMarch(year: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262,
    2324, 2394, 2456, 3178,
  ];
  const gregorianYear = year + 621;
  let leap = -14;
  let previous = breaks[0] ?? 0;
  if (year < previous || year >= (breaks.at(-1) ?? 0)) return null;
  let jump = 0;
  for (let index = 1; index < breaks.length; index += 1) {
    const next = breaks[index] ?? previous;
    jump = next - previous;
    if (year < next) break;
    leap = leap + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    previous = next;
  }
  const passed = year - previous;
  leap = leap + div(passed, 33) * 8 + div(mod(passed, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - passed === 4) leap += 1;
  const gregorianLeap =
    div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  return { gregorianYear, march: 20 + leap - gregorianLeap };
}

export function jalaliToIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const calendar = jalaliMarch(year);
  if (!calendar) return null;
  const date = dayNumberToGregorian(
    gregorianDayNumber(calendar.gregorianYear, 3, calendar.march) +
      (month - 1) * 31 -
      div(month, 7) * (month - 7) +
      day -
      1,
  );
  const iso = [
    String(date.year).padStart(4, "0"),
    String(date.month).padStart(2, "0"),
    String(date.day).padStart(2, "0"),
  ].join("-");
  const check = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(check.getTime())) return null;
  if (check.getUTCFullYear() !== date.year || check.getUTCMonth() + 1 !== date.month) {
    return null;
  }
  if (check.getUTCDate() !== date.day) return null;
  return iso;
}

export function parseMemberDate(value: string): string | null {
  const text = value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (year >= 1700) {
      const check = new Date(`${text}T12:00:00Z`);
      if (Number.isNaN(check.getTime())) return null;
      if (check.toISOString().slice(0, 10) !== text) return null;
      return text;
    }
    return jalaliToIso(year, month, day);
  }
  const jalali = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!jalali) return null;
  const year = Number(jalali[1]);
  const month = Number(jalali[2]);
  const day = Number(jalali[3]);
  if (year >= 1700) return null;
  return jalaliToIso(year, month, day);
}
