import type { PaymentOutcome } from './api';

// One idempotency key per order (8-128 characters). Derived from the order id, so a
// repeat call for the same order always sends the same key and gets the same Paystack URL.
export const paymentKey = (orderId: string) => `pay-${orderId}`;

export const isPaid = (outcome: PaymentOutcome) => outcome === 'confirmed' || outcome === 'already_processed';

// Text for outcomes that need the customer's attention. Paid outcomes have none.
export function outcomeNotice(outcome: PaymentOutcome): { title: string; message: string } | null {
  switch (outcome) {
    case 'not_paid':
      return { title: 'Payment not confirmed', message: 'Paystack has not confirmed a payment for this order yet.' };
    case 'amount_mismatch':
      return {
        title: 'Payment amount is wrong',
        message: 'The amount paid does not match the order. Please contact support.',
      };
    case 'refunded_late_payment':
      return {
        title: 'Order was cancelled',
        message: 'Your payment arrived after the order was cancelled. A refund has started.',
      };
    case 'unknown_reference':
      return { title: 'Payment not found', message: 'We could not find this payment. Please contact support.' };
    default:
      return null;
  }
}
