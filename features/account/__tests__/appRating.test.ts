import { APP_RATING_BANDS, appRatingMessage } from '../appRating';

// Hoisted above the import by jest.
jest.mock('../api', () => ({ sendContactMessage: jest.fn() }));

const user = { id: 'u1', role: 'customer' as const, firstName: 'Ama', lastName: 'O', phoneNumber: '0241234567', createdAt: '', updatedAt: '' };

describe('app rating', () => {
  it('offers problems for low scores and praise for high ones', () => {
    expect(APP_RATING_BANDS[1].tags).toContain('App crashes');
    expect(APP_RATING_BANDS[5].tags).toContain('Live tracking');
    expect(APP_RATING_BANDS[5].tags).not.toContain('App crashes');
  });

  it('builds a dashboard message with the score, tags and comment', () => {
    const lines = appRatingMessage(4, 'Good', ['Live tracking'], ' Love it ', user).split('\n');
    expect(lines.slice(0, 4)).toEqual(['APP RATING', 'Score: 4/5 (Good)', 'Tags: Live tracking', 'Comment: Love it']);
    expect(lines).toContain('User ID: u1');
    expect(appRatingMessage(3, 'Satisfied', [], '', user)).not.toMatch(/Tags:|Comment:/);
  });
});
