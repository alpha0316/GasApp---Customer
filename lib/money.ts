// The app shows Ghana cedis with the cedi sign only (never "GH", "GHS" or "GHC").
export const CEDI = '₵';
const symbolFor = (currency: string) => (currency === 'GHS' ? CEDI : currency);

// All API amounts are integer minor units (pesewas). Convert only to display, e.g. 7439 -> "₵ 74.39".
export function formatMoney(minor: number, currency: string): string {
  return `${symbolFor(currency)} ${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Whole major units for display and the amount input, e.g. 15000 -> 150.
export function minorToMajor(minor: number): number {
  return minor / 100;
}

// Parses a user-typed whole major amount into integer minor units. Returns null for bad input.
export function majorToMinor(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed) * 100;
}

// Whole cedis, nearest: 7439 -> 7400, 7450 -> 7500. Cash is paid in person and pesewas
// are hard to make change for, so every price the customer sees is rounded.
export function roundToMajor(minor: number): number {
  return Math.round(minor / 100) * 100;
}

// Display text in the app's style, rounded to whole units, e.g. 7439 -> "₵ 74". Display only, never math.
export function displayMoney(minor: number, currency: string): string {
  return `${symbolFor(currency)} ${Math.round(minor / 100).toLocaleString('en-US')}`;
}

// Rounds each line of a bill to whole units so the lines still add up to the rounded total
// (largest remainder first). Without this, 3.39 + 1.45 shows as 3 + 1 under a total of 5.
export function roundBreakdown(parts: number[]): number[] {
  const total = Math.round(parts.reduce((a, b) => a + b, 0) / 100);
  const floors = parts.map((p) => Math.floor(p / 100));
  let left = total - floors.reduce((a, b) => a + b, 0);
  const byRemainder = parts.map((p, i) => ({ i, r: p / 100 - floors[i] })).sort((a, b) => b.r - a.r);
  const out = [...floors];
  for (const { i } of byRemainder) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out.map((major) => major * 100);
}
