import { getAnalyticsSystem } from '../analyticsSystem';

describe('AnalyticsSystem', () => {
  let analytics: ReturnType<typeof getAnalyticsSystem>;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    analytics = getAnalyticsSystem();
    analytics.reset();
  });

  describe('Challenge Tracking', () => {
    it('should track challenge completion', () => {
      analytics.trackChallengeComplete(
        'challenge-1',
        'HTML',
        60000, // 1 minute
        2, // 2 attempts
        1, // 1 hint used
        85, // 85% score
        50 // 50 characters of code
      );

      const data = analytics.getAnalytics();
      expect(data.challengesCompleted).toBe(1);
      expect(data.timePerChallenge.get('challenge-1')).toBe(60000);
      expect(data.attemptsPerChallenge.get('challenge-1')).toBe(2);
    });

    it('should calculate average challenge time', () => {
      analytics.trackChallengeComplete('challenge-1', 'HTML', 60000, 1, 0, 100, 50);
      analytics.trackChallengeComplete('challenge-2', 'CSS', 120000, 1, 0, 100, 50);

      const data = analytics.getAnalytics();
      expect(data.averageChallengeTime).toBe(90000); // Average of 60s and 120s
    });

    it('should track perfect scores', () => {
      analytics.trackChallengeComplete('challenge-1', 'HTML', 60000, 1, 0, 100, 50);
      analytics.trackChallengeComplete('challenge-2', 'HTML', 60000, 1, 0, 85, 50);
      analytics.trackChallengeComplete('challenge-3', 'HTML', 60000, 1, 0, 100, 50);

      const data = analytics.getAnalytics();
      expect(data.perfectScores).toBe(2);
    });
  });

  describe('Error Tracking', () => {
    it('should track errors by concept', () => {
      analytics.trackError('HTML');
      analytics.trackError('HTML');
      analytics.trackError('CSS');

      const data = analytics.getAnalytics();
      expect(data.errorsPerConcept.get('HTML')).toBe(2);
      expect(data.errorsPerConcept.get('CSS')).toBe(1);
    });
  });

  describe('Learning Patterns', () => {
    it('should identify strong concepts', () => {
      analytics.trackChallengeComplete('c1', 'HTML', 60000, 1, 0, 100, 50);
      analytics.trackChallengeComplete('c2', 'HTML', 60000, 1, 0, 95, 50);
      analytics.trackChallengeComplete('c3', 'CSS', 60000, 3, 2, 70, 50);

      const data = analytics.getAnalytics();
      expect(data.strongConcepts).toContain('HTML');
      expect(data.weakConcepts).toContain('CSS');
    });

    it('should calculate learning velocity', () => {
      // Mock session start time to 1 hour ago
      const analytics = getAnalyticsSystem();
      analytics['analytics'].sessionStartTime = Date.now() - 3600000; // 1 hour ago

      analytics.trackChallengeComplete('c1', 'HTML', 60000, 1, 0, 100, 50);
      analytics.trackChallengeComplete('c2', 'HTML', 60000, 1, 0, 100, 50);

      const data = analytics.getAnalytics();
      expect(data.learningVelocity).toBeGreaterThan(0);
      expect(data.learningVelocity).toBeLessThan(10); // Should be around 2 challenges/hour
    });
  });

  describe('Recommendations', () => {
    it('should provide personalized recommendations', () => {
      analytics.trackChallengeComplete('c1', 'HTML', 60000, 1, 5, 70, 50); // High hints
      analytics.trackChallengeComplete('c2', 'CSS', 60000, 5, 0, 65, 50); // Low score

      const recommendations = analytics.getRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(r => r.includes('Practice'))).toBe(true);
    });
  });

  describe('Streak Tracking', () => {
    it('should track daily streak', () => {
      analytics.updateStreak();
      let data = analytics.getAnalytics();
      expect(data.streakDays).toBeGreaterThanOrEqual(0);

      // Simulate next day
      analytics['analytics'].lastActiveDate = new Date(
        Date.now() - 86400000
      ).toISOString();
      analytics.updateStreak();

      data = analytics.getAnalytics();
      expect(data.streakDays).toBeGreaterThan(0);
    });
  });

  describe('Code Metrics', () => {
    it('should track HTML tags usage', () => {
      analytics.trackHTMLTag('h1');
      analytics.trackHTMLTag('h1');
      analytics.trackHTMLTag('p');

      const data = analytics.getAnalytics();
      expect(data.mostUsedHTMLTags.get('h1')).toBe(2);
      expect(data.mostUsedHTMLTags.get('p')).toBe(1);
    });

    it('should track CSS properties usage', () => {
      analytics.trackCSSProperty('color');
      analytics.trackCSSProperty('display');
      analytics.trackCSSProperty('color');

      const data = analytics.getAnalytics();
      expect(data.mostUsedCSSProperties.get('color')).toBe(2);
      expect(data.mostUsedCSSProperties.get('display')).toBe(1);
    });
  });
});
