import type { ImageSourcePropType } from 'react-native';

export type VehicleKind = 'motorbike' | 'tricycle' | 'truck' | 'car';

export interface VehicleArt {
  label: string;
  // Top-down art facing north, rotated on the map to the direction of travel. null when there
  // is no top-down art yet: the map shows `side` in a round badge that does not rotate.
  top: ImageSourcePropType | null;
  // Length of the top-down art on the map, in points (roughly to scale with each other).
  topLength: number;
  // Side view for the rider card.
  side: ImageSourcePropType;
}

const MOTORBIKE_TOP = require('@/assets/vehicles/motorbike-top.png');

// The motorbike has no side view yet, so the card shows its top-down art.
// TODO: add a car top-down image (assets/vehicles/car-top.png) and set `top` for car.
export const VEHICLES: Record<VehicleKind, VehicleArt> = {
  motorbike: { label: 'Motorbike', top: MOTORBIKE_TOP, topLength: 34, side: MOTORBIKE_TOP },
  tricycle: {
    label: 'Tricycle',
    top: require('@/assets/vehicles/tricycle-top.png'),
    topLength: 44,
    side: require('@/assets/vehicles/tricycle-side.png'),
  },
  truck: {
    label: 'Truck',
    top: require('@/assets/vehicles/truck-top.png'),
    topLength: 52,
    side: require('@/assets/vehicles/truck-side.png'),
  },
  car: { label: 'Car', top: null, topLength: 44, side: require('@/assets/vehicles/car-side.png') },
};

// The order in which demo trips cycle through the vehicles.
export const VEHICLE_KINDS: VehicleKind[] = ['motorbike', 'tricycle', 'truck', 'car'];

// Maps the API's free-text vehicleType onto our art. Unknown types fall back to the motorbike,
// the most common rider vehicle.
export function vehicleKind(type?: string | null): VehicleKind {
  const t = (type ?? '').trim().toLowerCase();
  // Local names too: aboboyaa / motor king for cargo tricycles.
  if (/tricycle|aboboyaa|motor ?king/.test(t)) return 'tricycle';
  if (/truck|pick ?up|van|lorry/.test(t)) return 'truck';
  if (/\bcar\b|sedan|saloon|taxi/.test(t)) return 'car';
  return 'motorbike';
}
