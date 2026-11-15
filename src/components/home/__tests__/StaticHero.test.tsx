import { render } from '@testing-library/react'
import { StaticHero } from '@/components/home/StaticHero'
import { challenges } from '@/data/challenges'

describe('StaticHero', () => {
  it('shows the real starter code of the featured challenge, not a made-up snippet', () => {
    const { container } = render(<StaticHero />)
    const featured = challenges.find((c) => c.id === 'intro-2')
    expect(featured).toBeDefined()
    const code = container.querySelector('[data-testid="hero-snippet"]')
    expect(code).not.toBeNull()
    expect(code?.textContent).toContain('<h1>Colony Alpha</h1>')
    expect(code?.textContent).toBe(featured?.htmlTemplate)
  })

  it('names the building that the featured challenge unlocks', () => {
    const { container } = render(<StaticHero />)
    expect(container.textContent).toContain('Greenhouse')
  })

  it('stays hidden from assistive tech and keeps the title text fade hook', () => {
    const { container } = render(<StaticHero />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(container.querySelector('.static-hero-text')).not.toBeNull()
  })
})
