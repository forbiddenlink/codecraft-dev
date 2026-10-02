import { BASE_MAPPINGS } from '../ElementMapping'
import { SUPPORTED_ELEMENTS } from '../supportedElements'

describe('SUPPORTED_ELEMENTS', () => {
  it('matches the tag names mapped in BASE_MAPPINGS', () => {
    expect([...SUPPORTED_ELEMENTS].sort()).toEqual(Object.keys(BASE_MAPPINGS).sort())
  })
})
