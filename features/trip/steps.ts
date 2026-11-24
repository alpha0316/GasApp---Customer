// The three stages of a delivery, shared by the tracking card's steps and the trip toasts so
// both always say the same thing. The rider collects the empty cylinder first, fills it at
// the station, then brings it back. The first step is renamed once the rider has the cylinder
// (`doneTitle`) and stays open while they ride to the station.
export const TRIP_STEPS = [
  { key: 'pickup', title: 'Rider heading to your location', doneTitle: 'Cylinder picked up' },
  { key: 'filling', title: 'Filling process' },
  { key: 'dropoff', title: 'On the way back to you' },
] as const;

export const PICKUP_DONE_TITLE = TRIP_STEPS[0].doneTitle;

export type TripStepKey = (typeof TRIP_STEPS)[number]['key'];
