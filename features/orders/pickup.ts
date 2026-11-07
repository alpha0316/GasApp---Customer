export type PickupMode = 'instantly' | 'tomorrow' | 'custom';

// ISO 8601 with offset (UTC "Z"), as the API requires. Resolved when the order is placed,
// so "Now" is never older than the server's pickup grace window.
export function resolvePickupTime(
  mode: PickupMode,
  customDate: Date | null,
  hour: number | null,
  minute: number,
  now: Date = new Date(),
): string {
  if (mode === 'instantly') return now.toISOString();
  const day = new Date(now);
  if (mode === 'tomorrow') day.setDate(day.getDate() + 1);
  else if (customDate) day.setTime(customDate.getTime());
  day.setHours(hour ?? 9, hour === null ? 0 : minute, 0, 0);
  // A schedule in the past means "now".
  return (day < now ? now : day).toISOString();
}
