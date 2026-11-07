import { api } from '@/lib/api/client';
import type { Area, Cylinder, CylinderSize, PublicSettings, Quote, Station } from '@/lib/api/types';

export interface QuoteInput {
  size: CylinderSize;
  fullFill?: true;
  gasAmount?: number;
  cylinderCount: number;
  tip?: number;
  deliveryPoint: { lat: number; lng: number };
}

export const getSettings = () => api<{ settings: PublicSettings }>('/pricing/settings').then((r) => r.settings);
export const getCylinders = () => api<{ cylinders: Cylinder[] }>('/cylinders').then((r) => r.cylinders);
export const getAreas = () => api<{ areas: Area[] }>('/areas').then((r) => r.areas);
export const getStations = () => api<{ stations: Station[] }>('/stations').then((r) => r.stations);
export const getQuote = (input: QuoteInput) =>
  api<{ quote: Quote }>('/pricing/quote', { method: 'POST', body: input }).then((r) => r.quote);
