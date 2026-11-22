import type { Order } from '@/lib/api/types';

export interface ProfileStats {
  // Every order that was not cancelled or refunded, including ones still in progress.
  totalOrders: number;
  // What the customer paid for delivered orders, in minor units (pesewas).
  totalSpent: number;
  // Cylinders refilled across delivered orders.
  cylinders: number;
  currency: string;
}

export function profileStats(orders: Order[]): ProfileStats {
  let totalOrders = 0;
  let totalSpent = 0;
  let cylinders = 0;
  for (const o of orders) {
    if (o.status === 'cancelled' || o.status === 'refunded') continue;
    totalOrders += 1;
    if (o.status === 'delivered') {
      totalSpent += o.pricing.total;
      cylinders += o.cylinderCount;
    }
  }
  return { totalOrders, totalSpent, cylinders, currency: orders[0]?.pricing.currency ?? 'GHS' };
}
