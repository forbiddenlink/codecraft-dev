import { act, render, screen } from '@testing-library/react'

jest.mock('next/dynamic', () => () => {
  const Mock = () => <div data-testid="game-canvas" />
  return Mock
})

import DeferredGameCanvas, { isWebGLAvailable } from '../DeferredGameCanvas'

const props = {} as React.ComponentProps<typeof DeferredGameCanvas>

function mockGetContext(impl: () => unknown) {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(impl as never)
}

afterEach(() => jest.restoreAllMocks())

describe('DeferredGameCanvas without WebGL', () => {
  it('reports unavailable when no context can be created', () => {
    mockGetContext(() => null)
    expect(isWebGLAvailable()).toBe(false)
  })

  it('reports unavailable when getContext throws', () => {
    mockGetContext(() => {
      throw new Error('blocked')
    })
    expect(isWebGLAvailable()).toBe(false)
  })

  it('renders a fallback instead of the canvas', () => {
    mockGetContext(() => null)
    render(<DeferredGameCanvas {...props} />)
    act(() => {
      window.dispatchEvent(new Event('pointerdown'))
    })
    expect(screen.getByRole('status')).toHaveTextContent(/3D graphics are not available/i)
    expect(screen.queryByTestId('game-canvas')).toBeNull()
  })

  it('renders the canvas when WebGL is available', () => {
    mockGetContext(() => ({}))
    render(<DeferredGameCanvas {...props} />)
    act(() => {
      window.dispatchEvent(new Event('pointerdown'))
    })
    expect(screen.getByTestId('game-canvas')).toBeInTheDocument()
  })
})
