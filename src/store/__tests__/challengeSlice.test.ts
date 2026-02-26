import challengeReducer, {
  setAvailableChallenges,
  setCurrentChallenge,
  startChallenge,
  completeChallenge,
  resetChallenges,
  Challenge,
} from '../slices/challengeSlice';

describe('challengeSlice', () => {
  const initialState = {
    availableChallenges: [],
    currentIndex: 0,
    completed: [],
    inProgress: null,
    lastCompletedAt: null,
  };

  const mockChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      title: 'Build a Header',
      description: 'Create an HTML header',
      type: 'coding',
      requirements: {
        code: {
          language: 'html',
          template: '<header></header>',
          tests: [{ description: 'Has header element', test: 'document.querySelector("header")' }],
        },
      },
      rewards: { xp: 100 },
    },
    {
      id: 'challenge-2',
      title: 'Style the Header',
      description: 'Add CSS styling',
      type: 'coding',
      requirements: {
        code: {
          language: 'css',
          template: 'header { }',
          tests: [],
        },
      },
      rewards: { xp: 150 },
    },
  ];

  it('should return the initial state', () => {
    expect(challengeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setAvailableChallenges', () => {
    it('should set available challenges', () => {
      const actual = challengeReducer(initialState, setAvailableChallenges(mockChallenges));
      expect(actual.availableChallenges).toHaveLength(2);
      expect(actual.availableChallenges[0].id).toBe('challenge-1');
    });
  });

  describe('setCurrentChallenge', () => {
    const stateWithChallenges = {
      ...initialState,
      availableChallenges: mockChallenges,
    };

    it('should set current challenge index', () => {
      const actual = challengeReducer(stateWithChallenges, setCurrentChallenge(1));
      expect(actual.currentIndex).toBe(1);
    });

    it('should not set invalid index (negative)', () => {
      const actual = challengeReducer(stateWithChallenges, setCurrentChallenge(-1));
      expect(actual.currentIndex).toBe(0);
    });

    it('should not set invalid index (out of bounds)', () => {
      const actual = challengeReducer(stateWithChallenges, setCurrentChallenge(10));
      expect(actual.currentIndex).toBe(0);
    });
  });

  describe('startChallenge', () => {
    it('should mark challenge as in progress', () => {
      const actual = challengeReducer(initialState, startChallenge('challenge-1'));
      expect(actual.inProgress).toBe('challenge-1');
    });
  });

  describe('completeChallenge', () => {
    it('should add challenge to completed list', () => {
      const actual = challengeReducer(initialState, completeChallenge('challenge-1'));
      expect(actual.completed).toContain('challenge-1');
      expect(actual.lastCompletedAt).not.toBeNull();
    });

    it('should not add duplicate completions', () => {
      const stateWithCompleted = {
        ...initialState,
        completed: ['challenge-1'],
      };
      const actual = challengeReducer(stateWithCompleted, completeChallenge('challenge-1'));
      expect(actual.completed).toHaveLength(1);
    });

    it('should clear inProgress when completing current challenge', () => {
      const stateInProgress = {
        ...initialState,
        inProgress: 'challenge-1',
      };
      const actual = challengeReducer(stateInProgress, completeChallenge('challenge-1'));
      expect(actual.inProgress).toBeNull();
    });
  });

  describe('resetChallenges', () => {
    it('should reset all progress', () => {
      const progressState = {
        ...initialState,
        availableChallenges: mockChallenges,
        currentIndex: 1,
        completed: ['challenge-1'],
        inProgress: 'challenge-2',
        lastCompletedAt: Date.now(),
      };
      const actual = challengeReducer(progressState, resetChallenges());
      expect(actual.completed).toEqual([]);
      expect(actual.inProgress).toBeNull();
      expect(actual.currentIndex).toBe(0);
      expect(actual.lastCompletedAt).toBeNull();
      // Should preserve available challenges
      expect(actual.availableChallenges).toHaveLength(2);
    });
  });
});
