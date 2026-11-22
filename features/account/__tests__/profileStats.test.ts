import type { Order, OrderStatus } from '@/lib/api/types';
import { profileStats } from '../profileStats';

const order = (status: OrderStatus, total: number, cylinderCount = 1) =>
  ({ status, cylinderCount, pricing: { total, currency: 'GHS' } }) as unknown as Order;

describe('profileStats', () => {
  it('counts live and delivered orders but only charges for delivered ones', () => {
    const stats = profileStats([order('delivered', 15000, 2), order('filling', 9000), order('delivered', 5000)]);
    expect(stats).toEqual({ totalOrders: 3, totalSpent: 20000, cylinders: 3, currency: 'GHS' });
  });

  it('leaves out cancelled and refunded orders', () => {
    expect(profileStats([order('cancelled', 9000), order('refunded', 9000)]).totalOrders).toBe(0);
  });

  it('is all zeros with no orders', () => {
    expect(profileStats([])).toEqual({ totalOrders: 0, totalSpent: 0, cylinders: 0, currency: 'GHS' });
  });
});
