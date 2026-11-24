import type { User } from '@/lib/api/types';
import { sendContactMessage } from './api';

export const DELETE_REASONS = [
  "I don't need gas delivery anymore",
  'Deliveries took too long',
  'It costs too much',
  'I had a problem with a rider',
  "I'm worried about my data",
  'I have another account',
  'Other',
] as const;

export type DeleteReason = (typeof DELETE_REASONS)[number];

// The message staff see on the dashboard's Messages page. The subject line comes first so the
// request stands out in the list.
export function deletionMessage(user: User, reason: DeleteReason, details: string): string {
  return [
    'ACCOUNT DELETION REQUEST',
    `Reason: ${reason}`,
    details.trim() ? `Details: ${details.trim()}` : null,
    '',
    `User ID: ${user.id}`,
    `Name: ${`${user.firstName} ${user.lastName}`.trim() || 'not set'}`,
    `Phone: ${user.phoneNumber ?? 'none'}`,
    `Email: ${user.email ?? 'none'}`,
    '',
    'Please follow up, then delete this account and its personal data.',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

// The API has no delete endpoint yet, so the request goes through the contact form, which
// the admin dashboard lists under Messages. The form needs an email to reply to.
export function requestAccountDeletion(user: User & { email: string }, reason: DeleteReason, details: string) {
  return sendContactMessage({
    firstName: user.firstName || 'GasApp',
    lastName: user.lastName || 'customer',
    email: user.email,
    message: deletionMessage(user, reason, details),
  });
}
