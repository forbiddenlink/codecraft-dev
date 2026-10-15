/**
 * @jest-environment jsdom
 */
import fs from 'node:fs'
import path from 'node:path'
import { allDialogueTrees } from '@/data/exampleDialogues'
import { resolveDialogueNode } from '../dialogueLookup'
import { SoundSystem } from '../soundSystem'
import { lookupVoiceUrl, type VoiceManifest, voiceLineId } from '../voiceManifest'

class FakeParam {
  value = 0
  targets: number[] = []
  curves = 0
  cancels = 0
  setTargetAtTime(v: number) {
    this.targets.push(v)
  }
  setValueAtTime() {}
  setValueCurveAtTime() {
    this.curves++
  }
  cancelScheduledValues() {
    this.cancels++
  }
}

class FakeNode {
  gain = new FakeParam()
  connect = jest.fn()
  disconnect = jest.fn()
}

class FakeSource extends FakeNode {
  buffer: unknown = null
  loop = false
  onended: (() => void) | null = null
  playbackRate = { value: 1 }
  started = false
  stopped = false
  start = jest.fn(() => {
    this.started = true
  })
  stop = jest.fn(() => {
    this.stopped = true
  })
}

let ctx: FakeCtx
class FakeCtx {
  state = 'running'
  currentTime = 0
  sampleRate = 8000
  destination = {}
  sources: FakeSource[] = []
  gains: FakeNode[] = []
  decodes = 0
  constructor() {
    ctx = this
  }
  createGain() {
    const g = new FakeNode()
    this.gains.push(g)
    return g
  }
  createBufferSource() {
    const s = new FakeSource()
    this.sources.push(s)
    return s
  }
  createBuffer(_c: number, length: number) {
    return { getChannelData: () => new Float32Array(length) }
  }
  async decodeAudioData() {
    this.decodes++
    return { duration: 1 }
  }
  resume = jest.fn(async () => {
    this.state = 'running'
  })
}

const LINE = 'I am Pixel, your AI companion.'
const manifest: VoiceManifest = {
  version: 1,
  lines: { [voiceLineId(LINE)]: { npcId: 'pixel', file: `pixel/${voiceLineId(LINE)}.mp3` } },
}

let holds: Record<string, Promise<void>>
let fetched: string[]
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}
const live = () => ctx.sources.filter((s) => s.started && !s.stopped)
const musicLive = () => live().filter((s) => s.loop)

async function makeSystem(): Promise<SoundSystem> {
  const sys = new SoundSystem()
  await sys.unlock()
  return sys
}

beforeEach(() => {
  jest.useFakeTimers()
  localStorage.clear()
  holds = {}
  fetched = []
  ;(window as unknown as { AudioContext: unknown }).AudioContext = FakeCtx
  global.fetch = jest.fn(async (url: string) => {
    fetched.push(url)
    if (holds[url]) await holds[url]
    return {
      ok: true,
      json: async () => manifest,
      arrayBuffer: async () => new ArrayBuffer(1),
    }
  }) as unknown as typeof fetch
})

afterEach(() => {
  jest.useRealTimers()
})

describe('music transitions', () => {
  it('A to B to C leaves one live source and no stray timers; stop clears everything', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    sys.playMusic('coding_focus')
    await flush()
    sys.playMusic('main_theme')
    await flush()
    expect(ctx.sources.filter((s) => s.loop)).toHaveLength(3)
    jest.advanceTimersByTime(5000)
    expect(musicLive()).toHaveLength(1)
    sys.stopMusic()
    expect(musicLive()).toHaveLength(0)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('stop during a crossfade stops the outgoing source too', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    sys.playMusic('coding_focus')
    await flush()
    expect(musicLive()).toHaveLength(2)
    sys.stopMusic()
    expect(musicLive()).toHaveLength(0)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('muting and releasing stop all sources', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    sys.playMusic('coding_focus')
    await flush()
    sys.setMusicEnabled(false)
    expect(musicLive()).toHaveLength(0)
    sys.setMusicEnabled(true)
    await flush()
    expect(musicLive()).toHaveLength(1)
    sys.releaseMusic()
    expect(musicLive()).toHaveLength(0)
  })

  it('A playing, request B then A before B decodes: B never starts', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    let release!: () => void
    holds['/music/coding_focus.mp3'] = new Promise((r) => {
      release = r
    })
    sys.playMusic('coding_focus')
    sys.playMusic('exploration')
    release()
    await flush()
    jest.advanceTimersByTime(5000)
    expect(ctx.sources.filter((s) => s.loop)).toHaveLength(1)
    expect(musicLive()).toHaveLength(1)
  })

  it('waits for an unlocked context and replays the request on unlock', async () => {
    const sys = new SoundSystem()
    await sys.init()
    ctx.state = 'suspended'
    sys.playMusic('main_theme')
    await flush()
    expect(ctx.sources.filter((s) => s.loop)).toHaveLength(0)
    await sys.unlock()
    await flush()
    expect(musicLive()).toHaveLength(1)
  })

  it('volume changes go to the bus and are not overwritten by transitions', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    sys.playMusic('coding_focus')
    await flush()
    sys.setMusicVolume(0.2)
    jest.advanceTimersByTime(5000)
    const bus = ctx.gains[0]
    expect(bus.gain.targets.at(-1)).toBeCloseTo(0.7 * 0.2)
    // transition gain nodes use curves, never setTargetAtTime, so they cannot fight the bus
    const transition = ctx.gains.slice(2)
    expect(transition.length).toBeGreaterThanOrEqual(2)
    for (const g of transition) {
      expect(g.gain.targets).toHaveLength(0)
      expect(g.gain.curves).toBeGreaterThan(0)
    }
  })

  it('celebrate switches to victory, then returns to the requested track', async () => {
    const sys = await makeSystem()
    sys.playMusic('exploration')
    await flush()
    sys.celebrate('victory', 1000)
    await flush()
    expect(fetched).toContain('/music/victory.mp3')
    jest.advanceTimersByTime(1000)
    await flush()
    expect(fetched.filter((u) => u === '/music/exploration.mp3').length).toBeGreaterThanOrEqual(2)
    jest.advanceTimersByTime(5000)
    expect(musicLive()).toHaveLength(1)
  })
})

describe('voice', () => {
  it('does not speak when voice is disabled while the manifest is loading', async () => {
    const sys = await makeSystem()
    let release!: () => void
    holds['/audio/voice/manifest.json'] = new Promise((r) => {
      release = r
    })
    const p = sys.playVoiceLine(LINE)
    sys.setVoiceEnabled(false)
    release()
    await p
    expect(live().filter((s) => !s.loop)).toHaveLength(0)
  })

  it('does not speak after master sound is disabled or stopVoice (unmount)', async () => {
    const sys = await makeSystem()
    let release!: () => void
    holds['/audio/voice/manifest.json'] = new Promise((r) => {
      release = r
    })
    const p1 = sys.playVoiceLine(LINE)
    sys.stopVoice()
    release()
    await p1
    expect(live().filter((s) => !s.loop)).toHaveLength(0)
    const p2 = sys.playVoiceLine(LINE)
    sys.setEnabled(false)
    await p2
    expect(live().filter((s) => !s.loop)).toHaveLength(0)
  })

  it('a newer line supersedes an older one and never overlaps', async () => {
    const sys = await makeSystem()
    await sys.playVoiceLine(LINE)
    expect(live().filter((s) => !s.loop)).toHaveLength(1)
    await sys.playVoiceLine(LINE)
    const voices = ctx.sources.filter((s) => !s.loop)
    expect(voices).toHaveLength(2)
    expect(voices[0].stopped).toBe(true)
    expect(live().filter((s) => !s.loop)).toHaveLength(1)
  })

  it('plays through the AudioContext (no HTMLAudioElement) and follows master volume', async () => {
    const sys = await makeSystem()
    await sys.playVoiceLine(LINE)
    expect(live().filter((s) => !s.loop)).toHaveLength(1)
    sys.setMasterVolume(0)
    const voiceBus = ctx.gains[1]
    expect(voiceBus.gain.targets.at(-1)).toBe(0)
  })
})

describe('sfx loading', () => {
  it('does not fetch SFX files while sound is disabled, and loads them once enabled', async () => {
    localStorage.setItem('codecraft_sound', 'false')
    const sys = await makeSystem()
    expect(fetched.filter((u) => u.startsWith('/audio/sfx/'))).toHaveLength(0)
    sys.setEnabled(true)
    await flush()
    expect(fetched.filter((u) => u.startsWith('/audio/sfx/'))).toHaveLength(15)
    sys.setEnabled(false)
    sys.setEnabled(true)
    await flush()
    expect(fetched.filter((u) => u.startsWith('/audio/sfx/'))).toHaveLength(15)
  })

  it('loads SFX on unlock when sound is enabled', async () => {
    await makeSystem()
    await flush()
    expect(fetched.filter((u) => u.startsWith('/audio/sfx/'))).toHaveLength(15)
  })
})

describe('real dialogue resolves to a recorded clip', () => {
  const real: VoiceManifest = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'public/audio/voice/manifest.json'), 'utf8')
  )

  it('resolves the active node from tree and node ids', () => {
    const tree = allDialogueTrees[0]
    const node = resolveDialogueNode(allDialogueTrees, tree.id, tree.startNodeId)
    expect(node?.id).toBe(tree.startNodeId)
    expect(resolveDialogueNode(allDialogueTrees, 'nope', 'x')).toBeNull()
    expect(resolveDialogueNode(allDialogueTrees, null, null)).toBeNull()
  })

  it('every start-node line of the three guide trees has a clip on disk', () => {
    for (const tree of allDialogueTrees) {
      const node = resolveDialogueNode(allDialogueTrees, tree.id, tree.startNodeId)
      const url = lookupVoiceUrl(real, node?.text ?? '')
      expect(url).not.toBeNull()
      expect(fs.existsSync(path.join(process.cwd(), 'public', url as string))).toBe(true)
    }
  })
})
