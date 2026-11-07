import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuote } from '@/features/catalog/api';
import type { Order, Payment, PaymentMethod, Quote, RiderLocation } from '@/lib/api/types';
import { cancelOrder, createOrder, getOrder, listOrders, rateOrder, type CreateOrderInput } from './api';
import { amountFields, type PlanGroup } from './orderPlan';
import { isActive } from './status';

export const ORDERS_KEY = ['orders'] as const;
export const orderKey = (id: string) => [...ORDERS_KEY, 'detail', id] as const;

export type OrderDetail = { order: Order; payment: Payment; riderLocation: RiderLocation | null };

// The socket refreshes this on every event. The interval is the fallback when the socket is down.
const POLL_MS = 30_000;

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKey(id ?? ''),
    queryFn: () => getOrder(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.order.status;
      return status && isActive(status) ? POLL_MS : false;
    },
  });
}

export function useOrders(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({ queryKey: orderKey(id), queryFn: () => getOrder(id) })),
  });
}

export function useOrderHistory() {
  return useInfiniteQuery({
    queryKey: [...ORDERS_KEY, 'list'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => listOrders(pageParam),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
}

export interface PlaceOrdersInput {
  groups: PlanGroup[];
  deliveryAddress: CreateOrderInput['deliveryAddress'];
  pickupTime: string;
  paymentMethod: PaymentMethod;
}

// Places one order per group, one after another. Stops at the first failure and
// reports how many orders already exist, because an order cannot be undone here.
export class PartialOrderError extends Error {
  readonly placed: Order[];
  readonly cause: unknown;
  constructor(placed: Order[], cause: unknown) {
    super('Some orders could not be placed');
    this.placed = placed;
    this.cause = cause;
  }
}

export function usePlaceOrders() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ groups, deliveryAddress, pickupTime, paymentMethod }: PlaceOrdersInput) => {
      const placed: Order[] = [];
      for (const g of groups) {
        try {
          const { order } = await createOrder({
            size: g.size,
            ...amountFields(g),
            cylinderCount: g.cylinderCount,
            deliveryAddress,
            pickupTime,
            paymentMethod,
          });
          placed.push(order);
        } catch (error) {
          if (placed.length === 0) throw error;
          throw new PartialOrderError(placed, error);
        }
      }
      return placed;
    },
    onSettled: () => client.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useCancelOrders() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await cancelOrder(id);
    },
    onSettled: () => client.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export function useRateOrder(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { score: number; comment?: string }) => rateOrder(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ORDERS_KEY }),
  });
}

export interface QuoteTotals {
  gasTotal: number;
  distanceFee: number;
  serviceFee: number;
  total: number;
  currency: string;
  stationName: string | null;
}

// Prices come from the server (POST /pricing/quote). The client never computes money.
export function useGroupQuotes(
  groups: PlanGroup[],
  deliveryPoint: { lat: number; lng: number },
  enabled: boolean,
) {
  const results = useQueries({
    queries: groups.map((g) => ({
      queryKey: ['quote', g.size, g.fullFill, g.gasAmount, g.cylinderCount, deliveryPoint.lat, deliveryPoint.lng],
      queryFn: (): Promise<Quote> =>
        getQuote({ size: g.size, ...amountFields(g), cylinderCount: g.cylinderCount, deliveryPoint }),
      enabled,
      staleTime: 60_000,
      retry: false,
    })),
  });

  const quotes = results.map((r) => r.data);
  const ready = quotes.length > 0 && quotes.every((q): q is Quote => !!q);
  const error = results.find((r) => r.error)?.error ?? null;
  const isLoading = results.some((r) => r.isFetching);

  let totals: QuoteTotals | null = null;
  if (ready) {
    const all = quotes as Quote[];
    totals = {
      gasTotal: all.reduce((s, q) => s + q.pricing.gasTotal, 0),
      distanceFee: all.reduce((s, q) => s + q.pricing.distanceFee, 0),
      serviceFee: all.reduce((s, q) => s + q.pricing.serviceFee, 0),
      total: all.reduce((s, q) => s + q.pricing.total, 0),
      currency: all[0].pricing.currency,
      stationName: all[0].station.name,
    };
  }
  return { quotes, totals, error, isLoading };
}
