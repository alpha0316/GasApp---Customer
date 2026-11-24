import { HELP_TOPICS, PRIVACY, TERMS } from '../content';

describe('help content', () => {
  it('has unique topic ids and unique article ids within each topic', () => {
    const topicIds = HELP_TOPICS.map((t) => t.id);
    expect(new Set(topicIds).size).toBe(topicIds.length);
    for (const t of HELP_TOPICS) {
      const ids = t.articles.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(t.articles.length).toBeGreaterThan(0);
    }
  });

  it('keeps internal rider rules out of customer-facing text', () => {
    const text = JSON.stringify([HELP_TOPICS, TERMS, PRIVACY]).toLowerCase();
    for (const internal of ['wallet', 'strike', 'payout', 'suspended pending', 'gh₵50']) expect(text).not.toContain(internal);
  });
});
