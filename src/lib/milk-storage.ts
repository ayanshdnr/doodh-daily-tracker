export type MilkEntry = {
  date: string; // YYYY-MM-DD
  qty: number; // liters: 0, 0.25, 0.5, 0.75, 1
};

const ENTRIES_KEY = "milk:entries:v1";
const RATE_KEY = "milk:rate:v1";
const EMAIL_KEY = "milk:email:v1";

export const QTY_OPTIONS = [0, 0.25, 0.5, 0.75, 1] as const;

export function getEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}
export function setEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email);
}
export function clearEmail() {
  localStorage.removeItem(EMAIL_KEY);
}

export function getRate(): number {
  if (typeof window === "undefined") return 60;
  const v = localStorage.getItem(RATE_KEY);
  return v ? Number(v) : 60;
}
export function setRate(rate: number) {
  localStorage.setItem(RATE_KEY, String(rate));
}

export function getEntries(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
export function setEntry(date: string, qty: number) {
  const all = getEntries();
  all[date] = qty;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(all));
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateHindi(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function getMonthData(year: number, month0: number) {
  const entries = getEntries();
  const rate = getRate();
  const days = daysInMonth(year, month0);
  const rows: { date: string; day: number; qty: number; amount: number }[] = [];
  let totalQty = 0;
  let totalAmount = 0;
  let daysCount = 0;
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const qty = entries[key] ?? 0;
    const amount = qty * rate;
    if (qty > 0) {
      daysCount++;
      totalQty += qty;
      totalAmount += amount;
    }
    rows.push({ date: key, day: d, qty, amount });
  }
  return { rows, totalQty, totalAmount, daysCount, rate };
}
