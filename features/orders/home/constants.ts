import type { CylinderSize } from '@/lib/api/types';

export const DEFAULT_LATITUDE = 6.678045;
export const DEFAULT_LONGITUDE = -1.573568;

export const AMOUNT_INPUT_ACCESSORY_ID = 'amountInputAccessory';

// Artwork per size. Names, prices and limits come from the API.
export const CYLINDER_IMAGES: Record<CylinderSize, number> = {
  small: require('@/assets/images/smallSize.png'),
  medium: require('@/assets/images/mediumSize.png'),
  large: require('@/assets/images/mediumSize.png'),
};

export const STATION_LOGOS: { match: RegExp; logo: number }[] = [
  { match: /goil/i, logo: require('@/assets/Goil.png') },
  { match: /shell/i, logo: require('@/assets/Shell.png') },
  { match: /total/i, logo: require('@/assets/stations/totalenergies.png') },
  { match: /allied/i, logo: require('@/assets/stations/allied-icon.png') },
  { match: /engen/i, logo: require('@/assets/stations/engen.png') },
  { match: /star\s*oil/i, logo: require('@/assets/stations/staroil.png') },
  { match: /zen/i, logo: require('@/assets/stations/zen.png') },
];
export const MAX_STATIONS_SHOWN = 3;

// Mirrors the webapp's station picker (WebApp-1/src/screens/Home.tsx): stations within
// this extra radius of the closest one are treated as equally close (free) rather than
// charged a few cedis apart just because they're a handful of metres further.
export const STATION_FREE_RADIUS_KM = 0.5;
// Beyond the free radius, price in coarse bands instead of linearly per km, so nearby
// distances don't produce noisy near-identical fees.
const STATION_FEE_TIERS: { maxExtraKm: number; fee: number }[] = [
  { maxExtraKm: 0, fee: 0 },
  { maxExtraKm: 1, fee: 10 },
  { maxExtraKm: 2, fee: 20 },
  { maxExtraKm: Infinity, fee: 30 },
];

// A display-only estimate (major GHS units) for comparing stations before an order is
// placed. The real, binding price still only ever comes from POST /pricing/quote.
export function stationFee(distanceKm: number, closestDistanceKm: number): number {
  const extraKm = Math.max(0, distanceKm - closestDistanceKm - STATION_FREE_RADIUS_KM);
  return (STATION_FEE_TIERS.find((t) => extraKm <= t.maxExtraKm) ?? STATION_FEE_TIERS[STATION_FEE_TIERS.length - 1])
    .fee;
}

// The Delivery Fee is the server's base fee for the closest station; choosing a farther one
// adds this distance surcharge (pesewas). The server prices from the delivery point only, so
// like the rubber change it is added on the device and paid to the rider in cash.
export const stationExtraFee = (distanceKm: number, closestDistanceKm: number) =>
  stationFee(distanceKm, closestDistanceKm) * 100;

// Notes for the rider: which station the customer picked and any cash to collect on top.
export function buildRiderInstructions({
  stationName,
  stationExtra,
  rubberChange,
  rubberFee,
  formatMoney,
}: {
  stationName: string | null;
  stationExtra: number;
  rubberChange: boolean;
  rubberFee: number;
  formatMoney: (minor: number) => string;
}): string | undefined {
  const lines: string[] = [];
  if (stationName) {
    lines.push(
      stationExtra > 0
        ? `Customer chose ${stationName} (farther than the closest station). Collect ${formatMoney(stationExtra)} extra delivery in cash.`
        : `Customer chose ${stationName}.`,
    );
  }
  if (rubberChange) {
    lines.push(`Customer requested a cylinder rubber (gasket) change. Collect ${formatMoney(rubberFee)} in cash for it.`);
  }
  return lines.length ? lines.join('\n') : undefined;
}

// Assumed average city driving speed used only to estimate drive time when the backend
// routing service is unavailable (e.g. routing off, or the route request failed) — a
// rough stand-in so the picker still shows a time instead of nothing.
const FALLBACK_AVG_SPEED_KMH = 30;
export const estimateDriveMinutes = (distanceKm: number) => (distanceKm / FALLBACK_AVG_SPEED_KMH) * 60;

// "3 min away", "1 hr away", "1 hr 20 min away".
export function formatDriveDuration(minutes: number): string {
  const totalMinutes = Math.max(1, Math.round(minutes));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} min away`;
  if (mins === 0) return `${hours} hr away`;
  return `${hours} hr ${mins} min away`;
}

export const PLACEHOLDER_ADDRESSES = ['Locating…', 'Location permission denied'];

export type HomeStep = 'select' | 'stations' | 'amount' | 'checkout' | 'location';

// Flat fee (pesewas) for a rubber (gasket) swap, collected by the rider in cash on
// delivery since it isn't part of the backend's order pricing.
export const RUBBER_CHANGE_FEE = 2000;

export const formatTimeOfDay = (hour: number, minute: number) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
};
