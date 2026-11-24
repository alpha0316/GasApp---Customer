import { ratingBand, ratingComment } from '../rating';

describe('rating tags', () => {
  it('offers problems for low scores and praise for high ones', () => {
    expect(ratingBand(1)?.tags).toContain('Late delivery');
    expect(ratingBand(3)?.question).toBe('What could be better?');
    expect(ratingBand(3)?.label).toBe('Satisfied');
    expect(ratingBand(5)?.tags).toContain('On Time');
    expect(ratingBand(5)?.tags).not.toContain('Late delivery');
    expect(ratingBand(0)).toBeNull();
  });

  it('puts the tags ahead of the comment, and sends nothing when both are empty', () => {
    expect(ratingComment(['On Time', 'Safe'], '  Great job  ')).toBe('Tags: On Time, Safe\nGreat job');
    expect(ratingComment(['On time'], '')).toBe('Tags: On time');
    expect(ratingComment([], 'Fine')).toBe('Fine');
    expect(ratingComment([], '   ')).toBeUndefined();
  });
});
