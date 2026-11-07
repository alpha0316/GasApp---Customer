import type { User } from '@/lib/api/types';
import { isValidEmail, isValidPhone, needsEmail, needsName } from '../profileGate';

const user = (over: Partial<User> = {}): User => ({
  id: 'u1',
  role: 'customer',
  firstName: 'Ama',
  lastName: 'Mensah',
  email: 'ama@example.com',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...over,
});

describe('profile gate', () => {
  it('has no gate when there is no user', () => {
    expect(needsName(null)).toBe(false);
    expect(needsEmail(null)).toBe(false);
  });

  it('asks for a name when the first name is blank', () => {
    expect(needsName(user({ firstName: '  ' }))).toBe(true);
    expect(needsName(user())).toBe(false);
  });

  it('asks for an email when a phone-only account has none', () => {
    expect(needsEmail(user({ email: undefined, phoneNumber: '233240000000' }))).toBe(true);
    expect(needsEmail(user({ email: ' ' }))).toBe(true);
    expect(needsEmail(user())).toBe(false);
  });

  it('validates email and phone input', () => {
    expect(isValidEmail('ama@example.com')).toBe(true);
    expect(isValidEmail('ama@example')).toBe(false);
    expect(isValidEmail('ama example@x.com')).toBe(false);
    expect(isValidPhone('024 000 0000')).toBe(true);
    expect(isValidPhone('024')).toBe(false);
  });
});
