const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  currencyDisplay: "code",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: "Asia/Colombo",
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatLkr(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatColomboDateTime(isoString: string): string {
  return dateTimeFormatter.format(new Date(isoString));
}
