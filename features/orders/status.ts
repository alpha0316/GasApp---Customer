import type { OrderStatus } from '@/lib/api/types';

export type StepState = 'completed' | 'active' | 'pending';

export const INCOMING_STATUSES: OrderStatus[] = [
  'pending_payment',
  'awaiting_rider',
  'rider_assigned',
  'picked_up',
  'filling',
  'en_route_to_customer',
];
export const CANCELLED_STATUSES: OrderStatus[] = ['cancelled', 'refunded'];

export const isActive = (status: OrderStatus) => INCOMING_STATUSES.includes(status);

// Customers can cancel only before a rider accepts.
export const canCancel = (status: OrderStatus) => status === 'pending_payment' || status === 'awaiting_rider';

export const hasRider = (status: OrderStatus) =>
  status === 'rider_assigned' || status === 'picked_up' || status === 'filling' || status === 'en_route_to_customer' || status === 'delivered';

// The tracker shows three steps: rider heading to the station, filling, on the way to the customer.
export function stepStates(status: OrderStatus): [StepState, StepState, StepState] {
  switch (status) {
    case 'rider_assigned':
    case 'picked_up':
      return ['active', 'pending', 'pending'];
    case 'filling':
      return ['completed', 'active', 'pending'];
    case 'en_route_to_customer':
      return ['completed', 'completed', 'active'];
    case 'delivered':
      return ['completed', 'completed', 'completed'];
    default:
      return ['pending', 'pending', 'pending'];
  }
}

export const SIZE_NAME = { small: 'Small Size', medium: 'Medium Size', large: 'Large Size' } as const;
