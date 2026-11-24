import type { RatingBand } from '@/components/rating/RatingFields';

export { ratingComment } from '@/components/rating/RatingFields';

// What the delivery rating offers for each star count: a word for the score and tags that fit
// that experience. Low scores ask what went wrong, high scores what went well, so the tags
// change as the customer moves between stars.
export const RATING_BANDS: Record<1 | 2 | 3 | 4 | 5, RatingBand & { question: string }> = {
  1: {
    label: 'Very bad',
    question: 'What went wrong?',
    tags: ['Late delivery', 'Rude rider', 'Not fully filled', 'Damaged cylinder', 'Unsafe riding', 'Overcharged'],
  },
  2: {
    label: 'Poor',
    question: 'What went wrong?',
    tags: ['Late delivery', 'Poor communication', 'Not fully filled', 'Careless handling', 'Hard to reach rider'],
  },
  3: {
    label: 'Satisfied',
    question: 'What could be better?',
    tags: ['Quality Service', 'On Time', 'Affordable', 'Safe', 'Could be faster', 'Good Conversation'],
  },
  4: {
    label: 'Good',
    question: 'What did you like?',
    tags: ['Quality Service', 'On Time', 'Affordable', 'Safe', 'Friendly Rider', 'Good Conversation'],
  },
  5: {
    label: 'Excellent',
    question: 'What went well?',
    tags: ['Quality Service', 'On Time', 'Affordable', 'Safe', 'Excellent Job', 'Good Conversation', 'Well Filled'],
  },
};

export const ratingBand = (score: number): (typeof RATING_BANDS)[1] | null =>
  score >= 1 && score <= 5 ? RATING_BANDS[score as 1 | 2 | 3 | 4 | 5] : null;
