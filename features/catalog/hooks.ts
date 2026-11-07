import { useQuery } from '@tanstack/react-query';
import { getAreas, getCylinders, getSettings, getStations } from './api';

// Business values rarely change, so cache them for the session.
const SESSION = { staleTime: Infinity, gcTime: Infinity } as const;

export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: getSettings, ...SESSION });
export const useCylinders = () => useQuery({ queryKey: ['cylinders'], queryFn: getCylinders, ...SESSION });
export const useStations = () => useQuery({ queryKey: ['stations'], queryFn: getStations, ...SESSION });
export const useAreas = () => useQuery({ queryKey: ['areas'], queryFn: getAreas, ...SESSION });
