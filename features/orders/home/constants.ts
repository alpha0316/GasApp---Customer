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
];
export const MAX_STATIONS_SHOWN = 5;

export const PLACEHOLDER_ADDRESSES = ['Locating…', 'Location permission denied'];

export type HomeStep = 'select' | 'stations' | 'amount' | 'location';

export const formatTimeOfDay = (hour: number, minute: number) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
};
