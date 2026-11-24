import { pickupStepTitle, stepStates } from '@/features/orders/status';
import { tripAlertContent } from '../messages';
import { TRIP_STEPS } from '../steps';

const ctx = { riderName: 'Kwame', stationName: 'Shell Lapaz', eta: null };

describe('tracking steps and toasts', () => {
  it('moves through the three steps in the order the rider works', () => {
    expect(stepStates('rider_assigned')).toEqual(['active', 'pending', 'pending']);
    expect(stepStates('picked_up')).toEqual(['active', 'pending', 'pending']);
    expect(stepStates('filling')).toEqual(['completed', 'active', 'pending']);
    expect(stepStates('en_route_to_customer')).toEqual(['completed', 'completed', 'active']);
    expect(stepStates('delivered')).toEqual(['completed', 'completed', 'completed']);
  });

  it('renames the first step once the rider has the cylinder', () => {
    expect(pickupStepTitle('rider_assigned')).toBe('Rider heading to your location');
    expect(pickupStepTitle('picked_up')).toBe('Cylinder picked up');
    expect(pickupStepTitle('delivered')).toBe('Cylinder picked up');
  });

  it('titles each stage toast exactly like its step', () => {
    expect(tripAlertContent('to_customer_pickup', ctx).title).toBe(TRIP_STEPS[0].title);
    expect(tripAlertContent('to_station', ctx).title).toBe(TRIP_STEPS[0].doneTitle);
    expect(tripAlertContent('filling', ctx).title).toBe(TRIP_STEPS[1].title);
    expect(tripAlertContent('to_customer_dropoff', ctx).title).toBe(TRIP_STEPS[2].title);
  });
});
