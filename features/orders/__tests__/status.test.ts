import { queuedState } from '../status';

describe('queuedState', () => {
  it('is null when the rider has nothing ahead or the API sent no queue', () => {
    expect(queuedState('rider_assigned', undefined)).toBeNull();
    expect(queuedState('rider_assigned', null)).toBeNull();
    expect(queuedState('rider_assigned', { ordersAhead: 0 })).toBeNull();
  });

  it('is null once the rider has started this order', () => {
    expect(queuedState('picked_up', { ordersAhead: 1 })).toBeNull();
    expect(queuedState('en_route_to_customer', { ordersAhead: 2 })).toBeNull();
  });

  it('tells the customer they are next when one order is ahead', () => {
    const q = queuedState('rider_assigned', { ordersAhead: 1, startsInSeconds: 230 });
    expect(q?.detail).toMatch(/You're next/);
    expect(q?.banner).toBe('Your rider is completing another delivery nearby');
    expect(q?.startsIn).toBe('Starts in ~4 min');
  });

  it('counts the orders ahead when there are several', () => {
    const q = queuedState('rider_assigned', { ordersAhead: 3 });
    expect(q?.detail).toMatch(/^3 orders ahead/);
    expect(q?.startsIn).toBeNull();
  });
});
