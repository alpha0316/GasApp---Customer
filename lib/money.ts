// All API amounts are integer minor units (pesewas). Convert only to display.
export function formatMoney(minor: number, currency: string): string {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency }).format(minor / 100);
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

// Display text in the app's existing style, e.g. "GH 12.00". Display only, never math.
export function displayMoney(minor: number, currency: string): string {
  const prefix = currency === 'GHS' ? 'GH' : currency;
  return `${prefix} ${(minor / 100).toFixed(2)}`;
}
