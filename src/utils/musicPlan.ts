/**
 * Pure music decision logic (no DOM, no Web Audio) so it can be unit tested.
 * soundSystem executes the plans this module returns.
 */

export type MusicTrack = 'main_theme' | 'exploration' | 'coding_focus' | 'victory' | 'ambient_space'

export interface MusicContext {
  menuOpen: boolean
  editorOpen: boolean
}

/** Calm focus music while coding, theme on the menu, exploration otherwise. */
export function selectMusicTrack(ctx: MusicContext): MusicTrack {
  if (ctx.menuOpen) return 'main_theme'
  if (ctx.editorOpen) return 'coding_focus'
  return 'exploration'
}

export type MusicPlan =
  | { action: 'none' }
  | { action: 'stop' }
  | { action: 'start'; track: MusicTrack }
  | { action: 'crossfade'; track: MusicTrack }

export interface MusicPlanInput {
  current: MusicTrack | null
  requested: MusicTrack
  /** Master sound switch (Settings > Sound). */
  enabled: boolean
  /** Music-specific switch (Settings > Music). */
  musicEnabled: boolean
  /** True once a user gesture has unlocked the AudioContext. */
  unlocked: boolean
}

export function planMusicTransition(input: MusicPlanInput): MusicPlan {
  if (!input.enabled || !input.musicEnabled)
    return input.current ? { action: 'stop' } : { action: 'none' }
  // Before the first gesture the request is remembered by the caller and replayed on unlock.
  if (!input.unlocked) return { action: 'none' }
  if (input.current === input.requested) return { action: 'none' }
  if (input.current === null) return { action: 'start', track: input.requested }
  return { action: 'crossfade', track: input.requested }
}

/** Equal-power crossfade so the summed loudness stays flat. progress is clamped to 0..1. */
export function equalPowerGains(progress: number): { out: number; in: number } {
  const p = Math.min(1, Math.max(0, progress))
  return { out: Math.cos((p * Math.PI) / 2), in: Math.sin((p * Math.PI) / 2) }
}

export function effectiveMusicVolume(master: number, music: number, trackGain = 1): number {
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  return clamp(master) * clamp(music) * trackGain
}
