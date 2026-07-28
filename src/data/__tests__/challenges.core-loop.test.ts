import { challenges, getAvailableChallenges, getChallengeById } from '@/data/challenges';

describe('challenge core loop data', () => {
  it('exposes intro-1 as the first available challenge', () => {
    const available = getAvailableChallenges([]);
    expect(available[0]?.id).toBe('intro-1');
  });

  it('unlocks intro-2 after intro-1 is completed', () => {
    const available = getAvailableChallenges(['intro-1']);
    expect(available.map((c) => c.id)).toContain('intro-2');
    expect(available.map((c) => c.id)).not.toContain('intro-1');
  });

  it('validates intro-1 header + h1 solution', () => {
    const intro1 = getChallengeById('intro-1');
    expect(intro1).toBeDefined();
    expect(intro1!.validate('<header><h1>Colony Alpha</h1></header>')).toBe(true);
    expect(intro1!.validate('<!-- Start by adding a header -->')).toBe(false);
  });

  it('has templates for starter challenges', () => {
    for (const id of ['intro-1', 'intro-2']) {
      const challenge = getChallengeById(id);
      expect(challenge?.htmlTemplate).toBeTruthy();
    }
  });

  it('keeps challenge catalog non-empty', () => {
    expect(challenges.length).toBeGreaterThan(3);
  });
});
