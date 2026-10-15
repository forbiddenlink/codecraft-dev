import {
  effectiveMusicVolume,
  equalPowerGains,
  fadeCurve,
  planMusicTransition,
  selectMusicTrack,
  voiceVolume,
} from '../musicPlan'

describe('selectMusicTrack', () => {
  it('prefers the menu theme, then focus music while coding, else exploration', () => {
    expect(selectMusicTrack({ menuOpen: true, editorOpen: true })).toBe('main_theme')
    expect(selectMusicTrack({ menuOpen: false, editorOpen: true })).toBe('coding_focus')
    expect(selectMusicTrack({ menuOpen: false, editorOpen: false })).toBe('exploration')
  })
})

describe('planMusicTransition', () => {
  const base = { enabled: true, musicEnabled: true, unlocked: true }

  it('waits for a user gesture before starting', () => {
    expect(
      planMusicTransition({ ...base, unlocked: false, current: null, requested: 'main_theme' })
    ).toEqual({ action: 'none' })
  })

  it('starts when nothing is playing', () => {
    expect(planMusicTransition({ ...base, current: null, requested: 'main_theme' })).toEqual({
      action: 'start',
      track: 'main_theme',
    })
  })

  it('crossfades to a different track and ignores the same track', () => {
    expect(
      planMusicTransition({ ...base, current: 'exploration', requested: 'coding_focus' })
    ).toEqual({ action: 'crossfade', track: 'coding_focus' })
    expect(
      planMusicTransition({ ...base, current: 'exploration', requested: 'exploration' })
    ).toEqual({ action: 'none' })
  })

  it('stops when sound or music is disabled, and stays silent when nothing plays', () => {
    expect(
      planMusicTransition({ ...base, enabled: false, current: 'victory', requested: 'victory' })
    ).toEqual({ action: 'stop' })
    expect(
      planMusicTransition({
        ...base,
        musicEnabled: false,
        current: 'victory',
        requested: 'exploration',
      })
    ).toEqual({ action: 'stop' })
    expect(
      planMusicTransition({ ...base, enabled: false, current: null, requested: 'victory' })
    ).toEqual({ action: 'none' })
  })
})

describe('equalPowerGains', () => {
  it('goes from full-out to full-in', () => {
    expect(equalPowerGains(0).out).toBeCloseTo(1)
    expect(equalPowerGains(0).in).toBeCloseTo(0)
    expect(equalPowerGains(1).out).toBeCloseTo(0)
    expect(equalPowerGains(1).in).toBeCloseTo(1)
  })

  it('keeps summed power constant and clamps progress', () => {
    for (const p of [0.1, 0.25, 0.5, 0.9]) {
      const g = equalPowerGains(p)
      expect(g.out ** 2 + g.in ** 2).toBeCloseTo(1)
    }
    expect(equalPowerGains(-3)).toEqual(equalPowerGains(0))
    expect(equalPowerGains(7)).toEqual(equalPowerGains(1))
  })
})

describe('effectiveMusicVolume', () => {
  it('multiplies master and music and clamps', () => {
    expect(effectiveMusicVolume(0.5, 0.5)).toBeCloseTo(0.25)
    expect(effectiveMusicVolume(2, 2)).toBe(1)
    expect(effectiveMusicVolume(-1, 1)).toBe(0)
  })
})

describe('fadeCurve', () => {
  it('runs 0..1 for in and 1..0 for out with equal-power shape', () => {
    const up = fadeCurve(64, 'in')
    const down = fadeCurve(64, 'out')
    expect(up).toHaveLength(64)
    expect(up[0]).toBeCloseTo(0)
    expect(up[63]).toBeCloseTo(1)
    expect(down[0]).toBeCloseTo(1)
    expect(down[63]).toBeCloseTo(0)
    expect(up[20] ** 2 + down[20] ** 2).toBeCloseTo(1)
  })
})

describe('voiceVolume', () => {
  it('is silent at master 0 and scales with master and sfx', () => {
    expect(voiceVolume(0, 1)).toBe(0)
    expect(voiceVolume(0.5, 0.5)).toBeCloseTo(0.25)
    expect(voiceVolume(3, 3)).toBe(1)
  })
})
