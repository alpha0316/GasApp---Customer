import { tripEventFor, tripPhase, type TripEvent } from '../phase';

const snap = (status: Parameters<typeof tripPhase>[0]['status'], extra: Partial<Parameters<typeof tripPhase>[0]> = {}) =>
  tripPhase({ status, queued: false, riderKmToCustomer: null, riderKmToStation: null, ...extra });

describe('tripPhase', () => {
  it('follows the rider from the customer, to the station and back', () => {
    expect(snap('rider_assigned', { riderKmToCustomer: 3 })).toBe('to_customer_pickup');
    expect(snap('rider_assigned', { riderKmToCustomer: 0.4 })).toBe('arriving_pickup');
    expect(snap('picked_up', { riderKmToStation: 2 })).toBe('to_station');
    expect(snap('picked_up', { riderKmToStation: 0.3 })).toBe('approaching_station');
    expect(snap('filling')).toBe('filling');
    expect(snap('en_route_to_customer', { riderKmToCustomer: 2 })).toBe('to_customer_dropoff');
    expect(snap('en_route_to_customer', { riderKmToCustomer: 0.5 })).toBe('arriving_dropoff');
    expect(snap('delivered')).toBe('delivered');
  });

  it('shows the queue before the rider starts this order', () => {
    expect(snap('rider_assigned', { queued: true, riderKmToCustomer: 0.1 })).toBe('queued');
  });

  it('treats a missing rider location as not nearby', () => {
    expect(snap('en_route_to_customer')).toBe('to_customer_dropoff');
  });
});

describe('tripEventFor', () => {
  const none = new Set<TripEvent>();

  it('stays quiet for the state an order is first seen in', () => {
    expect(tripEventFor(null, 'filling', none)).toBeNull();
  });

  it('fires when the phase changes', () => {
    expect(tripEventFor('filling', 'to_customer_dropoff', none)).toBe('to_customer_dropoff');
  });

  it('does not repeat an alert when GPS jitter crosses a threshold again', () => {
    const fired = new Set<TripEvent>(['arriving_dropoff']);
    expect(tripEventFor('to_customer_dropoff', 'arriving_dropoff', fired)).toBeNull();
  });

  it('reports a rider dropping out when the order goes back to searching', () => {
    expect(tripEventFor('to_customer_pickup', 'searching', none)).toBe('reassigning');
    expect(tripEventFor(null, 'searching', none)).toBeNull();
  });
});
