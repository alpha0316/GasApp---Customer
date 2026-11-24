import type { RatingBands } from '@/components/rating/RatingFields';
import type { User } from '@/lib/api/types';
import { sendContactMessage } from './api';

// Tags for rating the app itself (not one delivery), changing with the score.
export const APP_RATING_BANDS: RatingBands = {
  1: { label: 'Very bad', tags: ['App crashes', 'Hard to use', 'Slow', 'Payment problems', 'Wrong location', 'Poor support'] },
  2: { label: 'Poor', tags: ['Hard to use', 'Slow', 'Confusing prices', 'Wrong location', 'Few stations nearby'] },
  3: { label: 'Satisfied', tags: ['Easy to order', 'Fair prices', 'Live tracking', 'Could be faster', 'More stations'] },
  4: { label: 'Good', tags: ['Easy to order', 'Live tracking', 'Fair prices', 'Fast delivery', 'Helpful updates'] },
  5: { label: 'Excellent', tags: ['Easy to order', 'Live tracking', 'Fast delivery', 'Fair prices', 'Helpful updates', 'Great support'] },
};

export function appRatingMessage(score: number, label: string, tags: string[], comment: string, user: User): string {
  return [
    'APP RATING',
    `Score: ${score}/5 (${label})`,
    tags.length ? `Tags: ${tags.join(', ')}` : null,
    comment.trim() ? `Comment: ${comment.trim()}` : null,
    '',
    `User ID: ${user.id}`,
    `Phone: ${user.phoneNumber ?? 'none'}`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

// The API has no app-rating endpoint, so the rating goes to the dashboard's Messages page
// through the contact form (which needs an email to reply to).
export function sendAppRating(user: User & { email: string }, score: number, label: string, tags: string[], comment: string) {
  return sendContactMessage({
    firstName: user.firstName || 'GasApp',
    lastName: user.lastName || 'customer',
    email: user.email,
    message: appRatingMessage(score, label, tags, comment, user),
  });
}
