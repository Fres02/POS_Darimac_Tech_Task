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

type UnitType = "each" | "kg" | "l";

const UNIT_LABELS: Record<UnitType, string> = {
  each: "Each",
  kg: "Kilogram",
  l: "Litre",
};

const UNIT_ABBREVIATIONS: Record<UnitType, string> = {
  each: "",
  kg: "kg",
  l: "l",
};

export function unitLabel(unitType: UnitType): string {
  return UNIT_LABELS[unitType];
}

export function unitSuffix(unitType: UnitType): string {
  return unitType === "each" ? "" : ` / ${UNIT_ABBREVIATIONS[unitType]}`;
}

// "each" quantities are always whole numbers; kg/l quantities can be
// fractional (e.g. 0.750 kg), so they're shown with 3 decimal places.
export function formatQty(qty: number, unitType: UnitType): string {
  if (unitType === "each") return String(qty);
  return `${qty.toFixed(3)} ${UNIT_ABBREVIATIONS[unitType]}`;
}
