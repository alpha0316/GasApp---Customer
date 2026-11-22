import { create } from 'zustand';
import type { Eta } from './eta';
import type { TripAlertContent } from './messages';
import type { TripEvent, TripPhase } from './phase';
import type { TripCondition } from './conditions';

export interface TripAlert extends TripAlertContent {
  id: string;
  orderId: string;
  event: TripEvent;
  riderPhone: string | null;
}

export interface LiveEta {
  phase: TripPhase;
  eta: Eta | null;
  // Smoothed seconds, so the next reading blends in instead of jumping.
  smoothed: number | null;
  at: number;
  // A delay seen right now: 'queue' at the station or 'traffic' on the road.
  condition?: TripCondition | null;
}

// A trip alert kept in the Notifications list. Device-only, for this app session.
export interface TripInboxItem {
  id: string;
  orderId: string;
  event: TripEvent;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface TripState {
  // Shown one at a time, oldest first.
  alerts: TripAlert[];
  etas: Record<string, LiveEta>;
  inbox: TripInboxItem[];
  addToInbox: (item: Omit<TripInboxItem, 'id' | 'read' | 'createdAt'>) => void;
  markInboxRead: (id?: string) => void;
  push: (alert: Omit<TripAlert, 'id'>) => void;
  dismiss: (id: string) => void;
  setEta: (orderId: string, eta: LiveEta) => void;
  clearOrder: (orderId: string) => void;
}

let seq = 0;

export const useTripStore = create<TripState>((set) => ({
  alerts: [],
  etas: {},
  inbox: [],
  addToInbox: (item) =>
    set((s) => ({
      inbox: [{ ...item, id: `trip-inbox-${++seq}`, read: false, createdAt: new Date().toISOString() }, ...s.inbox].slice(0, 50),
    })),
  // No id marks everything read.
  markInboxRead: (id) => set((s) => ({ inbox: s.inbox.map((n) => (id === undefined || n.id === id ? { ...n, read: true } : n)) })),
  push: (alert) =>
    set((s) => ({
      // A newer alert for the same order replaces any still waiting; the latest news wins.
      alerts: [...s.alerts.filter((a, i) => i === 0 || a.orderId !== alert.orderId), { ...alert, id: `trip-${++seq}` }],
    })),
  dismiss: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
  setEta: (orderId, eta) => set((s) => ({ etas: { ...s.etas, [orderId]: eta } })),
  clearOrder: (orderId) =>
    set((s) => {
      const { [orderId]: _gone, ...etas } = s.etas;
      return { etas };
    }),
}));
