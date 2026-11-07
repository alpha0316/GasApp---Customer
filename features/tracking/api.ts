import { api } from '@/lib/api/client';
import type { Route } from '@/lib/api/types';

export interface RouteEndpoints {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}

// Replaces the public OSRM demo server. A 503 NOT_CONFIGURED means routing is off.
export const getRoute = (q: RouteEndpoints) =>
  api<{ route: Route }>('/routing', { query: { ...q } }).then((r) => r.route);
