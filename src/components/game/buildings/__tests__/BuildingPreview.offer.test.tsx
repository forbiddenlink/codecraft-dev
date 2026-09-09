import { act, fireEvent, render, screen } from '@testing-library/react'
import { buildingSystem } from '@/game/systems/BuildingSystem'
import BuildingPreview from '../BuildingPreview'

let frame: (state: unknown) => void
jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: typeof frame) => {
    frame = callback
  },
}))
jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: () => ({
    selectedTemplateId: 'habitat-module',
    buildMode: true,
    previewRotation: 0,
  }),
}))
jest.mock('@/game/systems/BuildingSystem', () => ({ buildingSystem: { placeBuilding: jest.fn() } }))
jest.mock('@/utils/analytics', () => ({ trackBuildingConstructed: jest.fn() }))
jest.mock('uuid', () => ({ v4: () => 'test-building' }))
jest.mock('../BuildingModel', () => ({
  __esModule: true,
  default: () => <button type="button">Preview building</button>,
}))

it.each([null, 'placed-building'])(
  'notifies the quest only for successful preview placement: %s',
  (placedId) => {
    jest.mocked(buildingSystem.placeBuilding).mockReturnValue(placedId)
    const onPlaced = jest.fn()
    render(<BuildingPreview onPlaced={onPlaced} />)
    act(() =>
      frame({
        raycaster: {
          intersectObjects: () => [{ object: { name: 'ground' }, point: { x: 10, y: 0, z: 10 } }],
        },
        scene: { children: [] },
      })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Preview building' }))
    if (placedId) expect(onPlaced).toHaveBeenCalledWith(placedId, 'habitat-module')
    else expect(onPlaced).not.toHaveBeenCalled()
  }
)
