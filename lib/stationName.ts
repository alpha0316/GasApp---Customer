// Cosmetic only: seed/test station records are still named "Sample Station - X" on
// the backend. Stripping the word here keeps every screen that shows a station name
// clean without touching the stored data. Safe to run on real station names too —
// none of them contain the word "sample".
export function cleanStationName(name: string): string {
  return name.replace(/\bsample\s*/gi, '').trim();
}
