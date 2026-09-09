import { act, renderHook } from '@testing-library/react'
import { useChallengeProgress } from '../useChallengeProgress'

jest.mock('uuid', () => ({ v4: () => 'test-building' }))
jest.mock('@/store/hooks', () => ({ useAppDispatch: () => dispatch }))
jest.mock('@/utils/hapticFeedback', () => ({ __esModule: true, default: {} }))
jest.mock('@/utils/spacedRepetition', () => ({ recordChallengeCompletion: jest.fn() }))
const dispatch = jest.fn()
beforeEach(() => localStorage.clear())

it('does not offer an old completion without a new reward placement', () => {
  localStorage.setItem('completed-challenges', JSON.stringify(['intro-1']))
  const { result } = renderHook(() => useChallengeProgress())
  expect(result.current.completed).toEqual(['intro-1'])
  expect(result.current.firstChallengeOffer.placed).toBe(false)
})

it('persists placement, shown and dismissal alongside backward-compatible completion progress', () => {
  localStorage.setItem('completed-challenges', JSON.stringify(['intro-1']))
  const { result, unmount } = renderHook(() => useChallengeProgress())
  act(() =>
    result.current.markFirstRewardPlaced('placed', 'intro-1', 'habitat-module', 'habitat-module')
  )
  act(() => result.current.markFirstOfferShown())
  act(() => result.current.hideFirstOffer())
  unmount()
  const restored = renderHook(() => useChallengeProgress())
  expect(restored.result.current.firstChallengeOffer).toEqual({
    placed: true,
    shown: true,
    hidden: true,
  })
  expect(JSON.parse(localStorage.getItem('completed-challenges')!)).toEqual(['intro-1'])
})

it('keeps the offer hidden in memory when optional persistence is denied', () => {
  const { result } = renderHook(() => useChallengeProgress())
  const persist = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Quota exceeded', 'QuotaExceededError')
  })
  expect(() => act(() => result.current.hideFirstOffer())).not.toThrow()
  expect(result.current.firstChallengeOffer.hidden).toBe(true)
  persist.mockRestore()
})

it.each([
  [null, 'intro-1', 'habitat-module', 'habitat-module', false],
  ['placed', 'intro-1', 'habitat-module', 'connection-corridor', false],
  ['placed', 'intro-2', 'habitat-module', 'habitat-module', false],
  ['placed', undefined, undefined, 'habitat-module', false],
  ['placed', 'intro-1', 'habitat-module', 'habitat-module', true],
] as const)(
  'gates the actual placement callback for %s / %s / %s / %s',
  (placedId, challengeId, rewardTemplate, selectedTemplate, expected) => {
    const { result } = renderHook(() => useChallengeProgress())
    act(() =>
      result.current.markFirstRewardPlaced(placedId, challengeId, rewardTemplate, selectedTemplate)
    )
    expect(result.current.firstChallengeOffer.placed).toBe(expected)
  }
)
