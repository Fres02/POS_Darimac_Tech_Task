const COLOMBO_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const colomboDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Colombo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Asia/Colombo has held a fixed +05:30 offset with no DST since 1996, so day
// boundaries can be computed with plain offset arithmetic instead of a
// timezone database lookup.
export function getColomboDateString(date: Date): string {
  return colomboDateFormatter.format(date); // en-CA formats as YYYY-MM-DD
}

export function getColomboDayRangeUtc(reportDate: string): { start: Date; end: Date } {
  const [year, month, day] = reportDate.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - COLOMBO_OFFSET_MS);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
