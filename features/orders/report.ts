import { sendContactMessage } from '@/features/account/api';
import type { User } from '@/lib/api/types';

export const REPORT_REASONS = [
  'Rider was rude or unprofessional',
  'Cylinder not fully filled',
  'Cylinder damaged or leaking',
  'Delivery was late',
  'Charged the wrong amount',
  'Something else',
] as const;

export class NeedsEmailError extends Error {
  constructor() {
    super('Add an email to your account so support can reply to your report.');
  }
}

// The API has no report endpoint, so the report goes to support through the contact form,
// which needs an email address to reply to.
export async function reportDeliveryIssue(user: User | null, orderId: string, reason: string, details: string) {
  if (!user?.email) throw new NeedsEmailError();
  await sendContactMessage({
    firstName: user.firstName || 'GasApp',
    lastName: user.lastName || 'customer',
    email: user.email,
    message: [
      'DELIVERY REPORT',
      `Order: ${orderId}`,
      `Reason: ${reason}`,
      `Phone: ${user.phoneNumber ?? 'none'}`,
      details ? `Details: ${details}` : null,
    ]
      .filter(Boolean)
      .join('\n'),
  });
}
