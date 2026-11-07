import { api } from '@/lib/api/client';
import type {
  CylinderSize,
  Order,
  Page,
  Payment,
  PaymentMethod,
  RiderLocation,
} from '@/lib/api/types';

export interface CreateOrderInput {
  size: CylinderSize;
  fullFill?: true;
  gasAmount?: number;
  cylinderCount: number;
  tip?: number;
  deliveryAddress: { label: string; lat: number; lng: number };
  riderInstructions?: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
}

export const createOrder = (input: CreateOrderInput) =>
  api<{ order: Order; payment: Payment }>('/orders', { method: 'POST', body: input });

export const listOrders = (page: number) => api<{ orders: Order[] } & Page>('/orders', { query: { page } });

export const getOrder = (id: string) =>
  api<{ order: Order; payment: Payment; riderLocation: RiderLocation | null }>(`/orders/${id}`);

export const cancelOrder = (id: string) =>
  api<{ order: Order }>(`/orders/${id}/cancel`, { method: 'POST' }).then((r) => r.order);

export const rateOrder = (id: string, input: { score: number; comment?: string }) =>
  api<{ order: Order }>(`/orders/${id}/rate`, { method: 'POST', body: input }).then((r) => r.order);

// One key per order (see paymentKey). A repeat call returns the same Paystack URL.
export const payOrder = (id: string, idempotencyKey: string) =>
  api<{ authorizationUrl: string; reference: string }>(`/orders/${id}/pay`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export type PaymentOutcome =
  | 'confirmed'
  | 'already_processed'
  | 'not_paid'
  | 'amount_mismatch'
  | 'refunded_late_payment'
  | 'unknown_reference';

export const verifyPayment = (reference: string) =>
  api<{ outcome: PaymentOutcome; payment: Payment }>(`/payments/${encodeURIComponent(reference)}/verify`);
