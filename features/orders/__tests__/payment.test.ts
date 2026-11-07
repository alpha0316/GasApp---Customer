import { isPaid, outcomeNotice, paymentKey } from '../payment';

describe('payment helpers', () => {
  it('derives a stable idempotency key of 8-128 characters from the order id', () => {
    const key = paymentKey('665f1c2ab3d4e5f607182930');
    expect(key).toBe(paymentKey('665f1c2ab3d4e5f607182930'));
    expect(key.length).toBeGreaterThanOrEqual(8);
    expect(key.length).toBeLessThanOrEqual(128);
  });

  it('treats confirmed and already_processed as paid', () => {
    expect(isPaid('confirmed')).toBe(true);
    expect(isPaid('already_processed')).toBe(true);
    expect(isPaid('not_paid')).toBe(false);
  });

  it('gives a notice for every outcome that is not paid', () => {
    expect(outcomeNotice('confirmed')).toBeNull();
    for (const outcome of ['not_paid', 'amount_mismatch', 'refunded_late_payment', 'unknown_reference'] as const) {
      expect(outcomeNotice(outcome)?.message).toBeTruthy();
    }
  });
});
