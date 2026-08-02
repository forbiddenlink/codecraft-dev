import challengeReducer, {
  completeChallenge,
  hydrateCompletedChallenges,
  resetChallenges,
  setCurrentChallenge,
  startChallenge,
} from '../slices/challengeSlice'

describe('challengeSlice', () => {
  const initialState = {
    currentIndex: 0,
    completed: [],
    inProgress: null,
    lastCompletedAt: null,
  }

  it('should return the initial state', () => {
    expect(challengeReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  describe('setCurrentChallenge', () => {
    it('should set current challenge index', () => {
      const actual = challengeReducer(initialState, setCurrentChallenge(1))
      expect(actual.currentIndex).toBe(1)
    })

    it('should not set invalid index (negative)', () => {
      const actual = challengeReducer(initialState, setCurrentChallenge(-1))
      expect(actual.currentIndex).toBe(0)
    })
  })

  describe('startChallenge', () => {
    it('should mark challenge as in progress', () => {
      const actual = challengeReducer(initialState, startChallenge('challenge-1'))
      expect(actual.inProgress).toBe('challenge-1')
    })
  })

  describe('completeChallenge', () => {
    it('should add challenge to completed list', () => {
      const actual = challengeReducer(initialState, completeChallenge('challenge-1'))
      expect(actual.completed).toContain('challenge-1')
      expect(actual.lastCompletedAt).not.toBeNull()
    })

    it('should not add duplicate completions', () => {
      const stateWithCompleted = {
        ...initialState,
        completed: ['challenge-1'],
      }
      const actual = challengeReducer(stateWithCompleted, completeChallenge('challenge-1'))
      expect(actual.completed).toHaveLength(1)
    })

    it('should clear inProgress when completing current challenge', () => {
      const stateInProgress = {
        ...initialState,
        inProgress: 'challenge-1',
      }
      const actual = challengeReducer(stateInProgress, completeChallenge('challenge-1'))
      expect(actual.inProgress).toBeNull()
    })
  })

  describe('hydrateCompletedChallenges', () => {
    it('should merge ids without duplicates', () => {
      const state = {
        ...initialState,
        completed: ['intro-1'],
      }
      const actual = challengeReducer(state, hydrateCompletedChallenges(['intro-1', 'intro-2']))
      expect(actual.completed).toEqual(['intro-1', 'intro-2'])
    })
  })

  describe('resetChallenges', () => {
    it('should reset all progress', () => {
      const progressState = {
        ...initialState,
        completed: ['challenge-1'],
        inProgress: 'challenge-2',
        currentIndex: 2,
        lastCompletedAt: 123,
      }
      const actual = challengeReducer(progressState, resetChallenges())
      expect(actual).toEqual(initialState)
    })
  })
})
