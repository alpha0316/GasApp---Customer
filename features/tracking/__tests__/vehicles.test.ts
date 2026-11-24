import { vehicleKind } from '../vehicles';

// jest.mock calls are hoisted above the import.
jest.mock('@/assets/vehicles/motorbike-top.png', () => 1);
jest.mock('@/assets/vehicles/tricycle-top.png', () => 2);
jest.mock('@/assets/vehicles/tricycle-side.png', () => 3);
jest.mock('@/assets/vehicles/truck-top.png', () => 4);
jest.mock('@/assets/vehicles/truck-side.png', () => 5);
jest.mock('@/assets/vehicles/car-side.png', () => 6);

describe('vehicleKind', () => {
  it.each([
    ['motorbike', 'motorbike'],
    ['Motorcycle', 'motorbike'],
    ['bicycle', 'motorbike'],
    [undefined, 'motorbike'],
    ['tricycle', 'tricycle'],
    ['Aboboyaa', 'tricycle'],
    ['Motor King', 'tricycle'],
    ['truck', 'truck'],
    ['Pickup', 'truck'],
    ['car', 'car'],
    ['Saloon car', 'car'],
    ['scarlet', 'motorbike'],
  ])('%s -> %s', (type, kind) => {
    expect(vehicleKind(type)).toBe(kind);
  });
});
