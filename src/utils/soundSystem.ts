/**
 * Sound System for CodeCraft
 * Manages audio effects and ambient music for immersive experience
 */

export type SoundEffect =
  | 'achievement_unlock'
  | 'challenge_complete'
  | 'code_error'
  | 'code_success'
  | 'building_place'
  | 'building_upgrade'
  | 'resource_collect'
  | 'ui_click'
  | 'ui_hover'
  | 'pixel_talk'
  | 'notification'
  | 'level_up'
  | 'unlock'
  | 'typing'
  | 'whoosh'

import {
  effectiveMusicVolume,
  fadeCurve,
  type MusicTrack,
  planMusicTransition,
  voiceVolume,
} from './musicPlan'
import { lookupVoiceUrl, type VoiceManifest } from './voiceManifest'

export type { MusicTrack } from './musicPlan'

const SFX_NAMES: SoundEffect[] = [
  'achievement_unlock',
  'challenge_complete',
  'code_error',
  'code_success',
  'building_place',
  'building_upgrade',
  'resource_collect',
  'ui_click',
  'ui_hover',
  'pixel_talk',
  'notification',
  'level_up',
  'unlock',
  'typing',
  'whoosh',
]

const STORAGE_SOUND = 'codecraft_sound'
const STORAGE_MUSIC = 'codecraft_music'
const STORAGE_VOICE = 'codecraft_voice'
const DEFAULT_CROSSFADE_SECONDS = 2.5

function readFlag(key: string): boolean {
  try {
    return typeof localStorage === 'undefined' || localStorage.getItem(key) !== 'false'
  } catch {
    return true
  }
}

const CURVE_STEPS = 64
const QUICK_FADE_SECONDS = 0.2

/** One playing track: source -> its own transition gain -> shared music bus (volume). */
interface MusicVoice {
  track: MusicTrack
  source: AudioBufferSourceNode
  fade: GainNode
  disposeTimer: ReturnType<typeof setTimeout> | null
}

interface SoundConfig {
  volume: number
  loop?: boolean
  fadeIn?: number
  fadeOut?: number
  playbackRate?: number
}

export class SoundSystem {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundEffect, AudioBuffer> = new Map()
  private currentMusic: MusicVoice | null = null
  /** Every live music source, including ones still fading out, so stop can reach all of them. */
  private musicVoices: Set<MusicVoice> = new Set()
  private musicBus: GainNode | null = null
  private voiceBus: GainNode | null = null
  private requestedTrack: MusicTrack | null = null
  private overrideTrack: MusicTrack | null = null
  private overrideTimer: ReturnType<typeof setTimeout> | null = null
  private musicToken = 0
  private sfxLoad: Promise<void> | null = null
  private voiceToken = 0
  private voiceBuffers: Map<string, AudioBuffer> = new Map()
  private currentVoiceSource: AudioBufferSourceNode | null = null
  private musicEnabled = true
  private voiceEnabled = true
  private voiceManifest: VoiceManifest | null = null
  private voiceManifestPromise: Promise<void> | null = null
  private masterVolume: number = 0.7
  private sfxVolume: number = 0.8
  private musicVolume: number = 0.5
  private enabled: boolean = true
  private initialized: boolean = false

  /**
   * Initialize the sound system
   */
  async init(): Promise<void> {
    if (this.initialized) return

    try {
      // Create Audio Context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Persisted user settings
      this.enabled = readFlag(STORAGE_SOUND)
      this.musicEnabled = readFlag(STORAGE_MUSIC)
      this.voiceEnabled = readFlag(STORAGE_VOICE)

      // Procedural sounds are the always-available fallback
      await this.generateSounds()

      this.initialized = true
      // Recorded SFX load lazily (see maybeLoadSFX) so a muted session never downloads them.
      // A track requested before the first user gesture starts now.
      if (this.requestedTrack) this.playMusic(this.requestedTrack)
      console.log('✅ Sound system initialized')
    } catch (error) {
      console.error('❌ Failed to initialize sound system:', error)
    }
  }

  /**
   * Generate procedural sound effects using Web Audio API
   */
  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return

    // Achievement unlock - triumphant chord
    this.sounds.set('achievement_unlock', this.createAchievementSound())

    // Challenge complete - success jingle
    this.sounds.set('challenge_complete', this.createSuccessSound())

    // Code error - gentle alert
    this.sounds.set('code_error', this.createErrorSound())

    // Code success - positive beep
    this.sounds.set('code_success', this.createCodeSuccessSound())

    // Building place - construction sound
    this.sounds.set('building_place', this.createBuildingSound())

    // Resource collect - coin/pickup sound
    this.sounds.set('resource_collect', this.createCollectSound())

    // UI click - subtle click
    this.sounds.set('ui_click', this.createClickSound())

    // UI hover - soft hover
    this.sounds.set('ui_hover', this.createHoverSound())

    // Pixel talk - robotic beep
    this.sounds.set('pixel_talk', this.createPixelSound())

    // Notification - attention sound
    this.sounds.set('notification', this.createNotificationSound())

    // Level up - fanfare
    this.sounds.set('level_up', this.createLevelUpSound())

    // Unlock - magical unlock
    this.sounds.set('unlock', this.createUnlockSound())

    // Typing - keyboard sound
    this.sounds.set('typing', this.createTypingSound())

    // Whoosh - transition sound
    this.sounds.set('whoosh', this.createWhooshSound())
  }

  /**
   * Create achievement unlock sound - triumphant chord
   */
  private createAchievementSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 1.5
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      // Major chord progression
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        let sample = 0

        frequencies.forEach((freq, index) => {
          const envelope = Math.exp(-t * 2) * (1 - t / duration)
          sample += Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
        })

        data[i] = sample
      }
    }

    return buffer
  }

  /**
   * Create success sound - positive jingle
   */
  private createSuccessSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.8
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const freq = 800 + t * 400 // Rising frequency
        const envelope = Math.exp(-t * 5)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3
      }
    }

    return buffer
  }

  /**
   * Create error sound - gentle alert
   */
  private createErrorSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.3
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const freq = 300 - t * 100 // Falling frequency
        const envelope = Math.exp(-t * 8)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
      }
    }

    return buffer
  }

  /**
   * Create code success sound
   */
  private createCodeSuccessSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.2
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const envelope = Math.exp(-t * 10)
        data[i] = Math.sin(2 * Math.PI * 1200 * t) * envelope * 0.15
      }
    }

    return buffer
  }

  /**
   * Create building placement sound
   */
  private createBuildingSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.5
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Construction-like sound with noise
        const noise = (Math.random() - 0.5) * 0.1
        const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2
        const envelope = Math.exp(-t * 4)
        data[i] = (tone + noise) * envelope
      }
    }

    return buffer
  }

  /**
   * Create resource collection sound
   */
  private createCollectSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.3
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const freq = 600 + Math.sin(t * 50) * 200
        const envelope = Math.exp(-t * 8)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
      }
    }

    return buffer
  }

  /**
   * Create UI click sound
   */
  private createClickSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.05
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const envelope = Math.exp(-t * 50)
        data[i] = Math.sin(2 * Math.PI * 1000 * t) * envelope * 0.1
      }
    }

    return buffer
  }

  /**
   * Create UI hover sound
   */
  private createHoverSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.03
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const envelope = Math.exp(-t * 80)
        data[i] = Math.sin(2 * Math.PI * 1500 * t) * envelope * 0.05
      }
    }

    return buffer
  }

  /**
   * Create Pixel talk sound
   */
  private createPixelSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.15
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Robotic beep with harmonics
        const fundamental = Math.sin(2 * Math.PI * 440 * t)
        const harmonic = Math.sin(2 * Math.PI * 880 * t) * 0.5
        const envelope = Math.exp(-t * 10)
        data[i] = (fundamental + harmonic) * envelope * 0.15
      }
    }

    return buffer
  }

  /**
   * Create notification sound
   */
  private createNotificationSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.4
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Two-tone notification
        const freq = t < 0.2 ? 800 : 1000
        const envelope = Math.exp(-t * 6)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
      }
    }

    return buffer
  }

  /**
   * Create level up sound
   */
  private createLevelUpSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 1.2
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      // Ascending arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        const noteIndex = Math.floor(t / 0.3)
        const freq = notes[Math.min(noteIndex, notes.length - 1)]
        const envelope = Math.exp(-(t % 0.3) * 8)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25
      }
    }

    return buffer
  }

  /**
   * Create unlock sound
   */
  private createUnlockSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.6
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Magical shimmer effect
        const freq = 1000 + Math.sin(t * 20) * 500
        const envelope = Math.exp(-t * 3)
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2
      }
    }

    return buffer
  }

  /**
   * Create typing sound
   */
  private createTypingSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.02
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Keyboard click
        const noise = (Math.random() - 0.5) * 0.3
        const envelope = Math.exp(-t * 100)
        data[i] = noise * envelope
      }
    }

    return buffer
  }

  /**
   * Create whoosh sound
   */
  private createWhooshSound(): AudioBuffer {
    const ctx = this.audioContext!
    const duration = 0.4
    const sampleRate = ctx.sampleRate
    const buffer = ctx.createBuffer(2, duration * sampleRate, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Sweeping noise
        const noise = Math.random() - 0.5
        const freq = 2000 - t * 3000
        const tone = Math.sin(2 * Math.PI * freq * t)
        const envelope = Math.exp(-t * 5)
        data[i] = (noise * 0.3 + tone * 0.1) * envelope
      }
    }

    return buffer
  }

  /**
   * Play a sound effect
   */
  playSFX(effect: SoundEffect, config: Partial<SoundConfig> = {}): void {
    if (!this.enabled || !this.audioContext || !this.initialized) return

    const buffer = this.sounds.get(effect)
    if (!buffer) {
      console.warn(`Sound effect "${effect}" not found`)
      return
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    source.playbackRate.value = config.playbackRate || 1

    gainNode.gain.value = (config.volume || 1) * this.sfxVolume * this.masterVolume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    source.start(0)
  }

  private isRunning(): boolean {
    return !!this.audioContext && this.initialized && this.audioContext.state === 'running'
  }

  /**
   * Fetch + decode the recorded SFX once sound is enabled and audio is unlocked.
   * Each effect is independent: a missing or undecodable file keeps its synthesized buffer.
   */
  private maybeLoadSFX(): void {
    if (this.sfxLoad || !this.enabled || !this.isRunning() || typeof fetch === 'undefined') return
    const ctx = this.audioContext as AudioContext
    this.sfxLoad = Promise.all(
      SFX_NAMES.map(async (name) => {
        try {
          const res = await fetch(`/audio/sfx/${name}.mp3`)
          if (!res.ok) return
          this.sounds.set(name, await ctx.decodeAudioData(await res.arrayBuffer()))
        } catch {
          // keep the synthesized fallback
        }
      })
    ).then(() => undefined)
  }

  /**
   * Resume the AudioContext. Call from a user gesture (autoplay policy).
   * Replays a music request that arrived before the gesture.
   */
  async unlock(): Promise<void> {
    await this.init()
    const ctx = this.audioContext
    if (!ctx) return
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
      } catch {
        return
      }
    }
    this.maybeLoadSFX()
    if (this.requestedTrack) this.playMusic(this.requestedTrack)
  }

  /** Lazily create the two volume buses (music, voice) that all sources route through. */
  private ensureBuses(): void {
    const ctx = this.audioContext
    if (!ctx) return
    if (!this.musicBus) {
      this.musicBus = ctx.createGain()
      this.musicBus.connect(ctx.destination)
    }
    if (!this.voiceBus) {
      this.voiceBus = ctx.createGain()
      this.voiceBus.connect(ctx.destination)
    }
    this.applyVolumes()
  }

  private applyVolumes(): void {
    const ctx = this.audioContext
    if (!ctx) return
    const now = ctx.currentTime
    this.musicBus?.gain.setTargetAtTime(
      effectiveMusicVolume(this.masterVolume, this.musicVolume),
      now,
      0.05
    )
    this.voiceBus?.gain.setTargetAtTime(voiceVolume(this.masterVolume, this.sfxVolume), now, 0.05)
  }

  /**
   * Play background music. Safe to call at any time: before a user gesture the request
   * is remembered and starts on unlock. Switching tracks crossfades; the same track is a no-op.
   * A celebration override (see celebrate) wins until it expires.
   */
  playMusic(track: MusicTrack, config: Partial<SoundConfig> = {}): void {
    this.requestedTrack = track
    const wanted = this.overrideTrack ?? track
    const plan = planMusicTransition({
      current: this.currentMusic?.track ?? null,
      requested: wanted,
      enabled: this.enabled,
      musicEnabled: this.musicEnabled,
      unlocked: this.isRunning(),
    })
    if (plan.action === 'stop') {
      this.stopMusic()
      return
    }
    // Any newer request supersedes an in-flight load, including "back to what is already playing".
    this.musicToken++
    if (plan.action === 'none') return
    void this.startTrack(
      plan.track,
      config.fadeIn ?? config.fadeOut ?? DEFAULT_CROSSFADE_SECONDS,
      this.musicToken
    )
  }

  /**
   * Temporarily switch to an event track (e.g. victory), then return to the requested track.
   */
  celebrate(track: MusicTrack = 'victory', durationMs = 20000): void {
    if (this.overrideTimer) clearTimeout(this.overrideTimer)
    this.overrideTrack = track
    this.playMusic(this.requestedTrack ?? track)
    this.overrideTimer = setTimeout(() => {
      this.overrideTimer = null
      this.overrideTrack = null
      if (this.requestedTrack) this.playMusic(this.requestedTrack)
    }, durationMs)
  }

  private async startTrack(track: MusicTrack, fadeSeconds: number, token: number): Promise<void> {
    const ctx = this.audioContext
    if (!ctx) return
    let buffer: AudioBuffer
    try {
      const res = await fetch(`/music/${track}.mp3`)
      if (!res.ok) return
      buffer = await ctx.decodeAudioData(await res.arrayBuffer())
    } catch {
      return
    }
    // A newer request, a stop, or a disable arrived while loading: drop this one.
    const wanted = this.overrideTrack ?? this.requestedTrack
    if (token !== this.musicToken || wanted !== track || !this.enabled || !this.musicEnabled) return

    this.ensureBuses()
    const source = ctx.createBufferSource()
    source.buffer = buffer
    // Buffer looping is sample-accurate; the files are pre-crossfaded at their seam.
    source.loop = true
    const fade = ctx.createGain()
    fade.gain.value = 0
    source.connect(fade)
    fade.connect(this.musicBus as GainNode)
    source.start(0)

    // Every older voice fades out: the current one over the full crossfade, any leftover quickly.
    const previous = this.currentMusic
    for (const voice of this.musicVoices) {
      this.fadeOutVoice(voice, voice === previous ? fadeSeconds : QUICK_FADE_SECONDS)
    }

    const incoming: MusicVoice = { track, source, fade, disposeTimer: null }
    this.musicVoices.add(incoming)
    this.currentMusic = incoming
    fade.gain.setValueCurveAtTime(
      fadeCurve(CURVE_STEPS, 'in'),
      ctx.currentTime,
      Math.max(0.05, fadeSeconds)
    )
  }

  /** Equal-power fade-out scaled from the voice's current gain, then dispose on a timer. */
  private fadeOutVoice(voice: MusicVoice, seconds: number): void {
    const ctx = this.audioContext
    if (!ctx) return
    if (voice.disposeTimer) clearTimeout(voice.disposeTimer)
    const now = ctx.currentTime
    const param = voice.fade.gain
    const level = param.value
    param.cancelScheduledValues(now)
    param.setValueAtTime(level, now)
    const duration = Math.max(0.05, seconds)
    param.setValueCurveAtTime(
      fadeCurve(CURVE_STEPS, 'out').map((g) => g * level),
      now,
      duration
    )
    voice.disposeTimer = setTimeout(() => this.disposeVoice(voice), duration * 1000 + 50)
  }

  private disposeVoice(voice: MusicVoice): void {
    if (voice.disposeTimer) clearTimeout(voice.disposeTimer)
    voice.disposeTimer = null
    try {
      voice.source.stop()
    } catch {
      // already stopped
    }
    voice.source.disconnect()
    voice.fade.disconnect()
    this.musicVoices.delete(voice)
    if (this.currentMusic === voice) this.currentMusic = null
  }

  /**
   * Stop all music: the current track, any track still fading out, and any load in flight.
   */
  stopMusic(): void {
    this.musicToken++
    for (const voice of [...this.musicVoices]) this.disposeVoice(voice)
    this.currentMusic = null
  }

  /**
   * Stop music and forget the pending request (component unmount).
   */
  releaseMusic(): void {
    if (this.overrideTimer) clearTimeout(this.overrideTimer)
    this.overrideTimer = null
    this.overrideTrack = null
    this.requestedTrack = null
    this.stopMusic()
  }

  // ----- NPC voice -----

  private loadVoiceManifest(): Promise<void> {
    if (!this.voiceManifestPromise) {
      this.voiceManifestPromise = fetch('/audio/voice/manifest.json')
        .then((r) => (r.ok ? (r.json() as Promise<VoiceManifest>) : null))
        .then((m) => {
          this.voiceManifest = m && m.version === 1 ? m : null
        })
        .catch(() => {
          this.voiceManifest = null
        })
    }
    return this.voiceManifestPromise
  }

  private voiceStillWanted(token: number): boolean {
    return token === this.voiceToken && this.enabled && this.voiceEnabled && this.isRunning()
  }

  /**
   * Play the pre-generated voice clip for a dialogue line, if one exists.
   * Plays as a decoded buffer through the already-unlocked AudioContext (an HTMLAudioElement
   * created after an await can be blocked by Safari's gesture policy). Each call supersedes the
   * previous one, and every await re-checks the token and the flags so a late clip never plays.
   */
  async playVoiceLine(text: string): Promise<void> {
    const token = ++this.voiceToken
    this.stopVoiceSource()
    if (!this.voiceStillWanted(token)) return
    await this.loadVoiceManifest()
    if (!this.voiceStillWanted(token)) return
    const url = lookupVoiceUrl(this.voiceManifest, text)
    if (!url) return
    const ctx = this.audioContext as AudioContext
    let buffer = this.voiceBuffers.get(url)
    if (!buffer) {
      try {
        const res = await fetch(url)
        if (!res.ok) return
        buffer = await ctx.decodeAudioData(await res.arrayBuffer())
        this.voiceBuffers.set(url, buffer)
      } catch {
        return
      }
    }
    if (!this.voiceStillWanted(token)) return
    this.ensureBuses()
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.voiceBus as GainNode)
    source.onended = () => {
      if (this.currentVoiceSource === source) this.currentVoiceSource = null
    }
    this.currentVoiceSource = source
    source.start(0)
  }

  private stopVoiceSource(): void {
    const source = this.currentVoiceSource
    this.currentVoiceSource = null
    if (!source) return
    try {
      source.stop()
    } catch {
      // already stopped
    }
    source.disconnect()
  }

  stopVoice(): void {
    this.voiceToken++
    this.stopVoiceSource()
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.applyVolumes()
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.applyVolumes()
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    this.applyVolumes()
  }

  /**
   * Enable/disable sound system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.persist(STORAGE_SOUND, enabled)
    if (!enabled) {
      this.stopMusic()
      this.stopVoice()
    } else {
      this.maybeLoadSFX()
      if (this.requestedTrack) this.playMusic(this.requestedTrack)
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled
    this.persist(STORAGE_MUSIC, enabled)
    if (!enabled) this.stopMusic()
    else if (this.requestedTrack) this.playMusic(this.requestedTrack)
  }

  setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = enabled
    this.persist(STORAGE_VOICE, enabled)
    if (!enabled) this.stopVoice()
  }

  private persist(key: string, value: boolean): void {
    try {
      localStorage.setItem(key, value ? 'true' : 'false')
    } catch {
      // storage unavailable
    }
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      enabled: this.enabled,
      musicEnabled: this.musicEnabled,
      voiceEnabled: this.voiceEnabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
    }
  }
}

// Export singleton instance
export const soundSystem = new SoundSystem()

// Initialize on first user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    void soundSystem.unlock()
    document.removeEventListener('click', initOnInteraction)
    document.removeEventListener('keydown', initOnInteraction)
  }

  document.addEventListener('click', initOnInteraction)
  document.addEventListener('keydown', initOnInteraction)
}

// React hook for sound system
import { useEffect } from 'react'

export function useSoundSystem() {
  useEffect(() => {
    soundSystem.init()
  }, [])

  return {
    playSFX: (effect: SoundEffect, config?: Partial<SoundConfig>) =>
      soundSystem.playSFX(effect, config),
    playMusic: (track: MusicTrack, config?: Partial<SoundConfig>) =>
      soundSystem.playMusic(track, config),
    stopMusic: () => soundSystem.stopMusic(),
    playVoiceLine: (text: string) => soundSystem.playVoiceLine(text),
    setMasterVolume: (volume: number) => soundSystem.setMasterVolume(volume),
    setSFXVolume: (volume: number) => soundSystem.setSFXVolume(volume),
    setMusicVolume: (volume: number) => soundSystem.setMusicVolume(volume),
    setEnabled: (enabled: boolean) => soundSystem.setEnabled(enabled),
    settings: soundSystem.getSettings(),
  }
}
