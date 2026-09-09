import { fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import buildingReducer, { placeBuilding, toggleBuildMode } from '@/store/slices/buildingSlice'
import { trackEvent } from '@/utils/analytics'
import FirstChallengeOffer from '../FirstChallengeOffer'

jest.mock('uuid', () => ({ v4: () => 'placed-reward' }))
jest.mock('@/utils/analytics', () => ({ trackEvent: jest.fn() }))
const props = {
  completed: ['intro-1'],
  progress: { placed: true, shown: false, hidden: false },
  blocked: false,
  onShown: jest.fn(),
  onHide: jest.fn(),
}
beforeEach(() => jest.clearAllMocks())
it('waits for reward placement and blocking UI to exit', () => {
  const { rerender } = render(<FirstChallengeOffer {...props} blocked />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  rerender(<FirstChallengeOffer {...props} progress={{ ...props.progress, placed: false }} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  rerender(<FirstChallengeOffer {...props} />)
  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    'https://www.portfoliopro.dev/free-guide?utm_source=codecraft&utm_medium=game&utm_campaign=first_challenge'
  )
  expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
  expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
})
it('records shown once under StrictMode with aggregate-only properties', () => {
  render(
    <StrictMode>
      <FirstChallengeOffer {...props} />
    </StrictMode>
  )
  expect(trackEvent).toHaveBeenCalledTimes(1)
  expect(trackEvent).toHaveBeenCalledWith({
    name: 'first_challenge_offer_shown',
    properties: {
      challenge_id: 'intro-1',
      surface: 'post_placement_panel',
      campaign: 'first_challenge',
    },
  })
})
it.each(['clicked', 'dismissed'])('hides on %s with aggregate-only attribution', (action) => {
  render(<FirstChallengeOffer {...props} progress={{ ...props.progress, shown: true }} />)
  fireEvent.click(
    action === 'clicked'
      ? screen.getByRole('link')
      : screen.getByRole('button', { name: 'Dismiss free guide offer' })
  )
  expect(props.onHide).toHaveBeenCalledTimes(1)
  expect(trackEvent).toHaveBeenCalledWith({
    name: `first_challenge_offer_${action}`,
    properties: {
      challenge_id: 'intro-1',
      surface: 'post_placement_panel',
      campaign: 'first_challenge',
    },
  })
})
it('never reoffers after dismissal or another completed challenge', () => {
  const { rerender } = render(
    <FirstChallengeOffer {...props} progress={{ ...props.progress, hidden: true }} />
  )
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  rerender(<FirstChallengeOffer {...props} completed={['intro-1', 'intro-2']} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  expect(trackEvent).not.toHaveBeenCalled()
})

it('appears only after the building reducer exits placement mode on success', () => {
  let building = buildingReducer(undefined, toggleBuildMode(true))
  const { rerender } = render(<FirstChallengeOffer {...props} blocked={building.buildMode} />)
  expect(screen.queryByRole('link')).not.toBeInTheDocument()
  building = buildingReducer(
    building,
    placeBuilding({ templateId: 'habitat-module', position: { x: 0, y: 0, z: 0 }, rotation: 0 })
  )
  expect(building.placedBuildings).toHaveLength(1)
  expect(building.buildMode).toBe(false)
  rerender(<FirstChallengeOffer {...props} blocked={building.buildMode} />)
  expect(screen.getByRole('link')).toBeInTheDocument()
})
