import { render, screen } from '@testing-library/react'
import type React from 'react'

// Mock next/dynamic to test the wrapper component
jest.mock('next/dynamic', () => {
  return function dynamicMock(
    importFn: () => Promise<{ default: React.ComponentType }>,
    options: { ssr: boolean }
  ) {
    // Return a mock component that indicates it was loaded
    const MockComponent = () => (
      <div data-testid="game-world-client" data-ssr={options.ssr.toString()}>
        Game World Client (Mocked)
      </div>
    )
    MockComponent.displayName = 'DynamicMock'
    return MockComponent
  }
})

// Import after mock is set up
import GameWorld from '../GameWorld'

describe('GameWorld', () => {
  it('renders the dynamically loaded client component', () => {
    render(<GameWorld />)
    expect(screen.getByTestId('game-world-client')).toBeInTheDocument()
  })

  it('uses dynamic import with SSR disabled', () => {
    render(<GameWorld />)
    const component = screen.getByTestId('game-world-client')
    expect(component).toHaveAttribute('data-ssr', 'false')
  })

  it('displays game content', () => {
    render(<GameWorld />)
    expect(screen.getByText(/Game World Client/i)).toBeInTheDocument()
  })
})
