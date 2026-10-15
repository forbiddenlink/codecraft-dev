// Generates public/audio/sfx/<name>.mp3 via Magica cassette-ai-sfx ($0.01 each).
// Usage: MAGICA_KEY=... node scripts/generate-sfx.mjs [name ...]
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { download, runNode } from './lib/magica-run.mjs'

const STYLE =
  'Sci-fi space colony interface sound, clean, soft, polished, no music, no voice, short.'
const SFX = {
  achievement_unlock: [
    'Rising triumphant synth chime with shimmering sparkle tail, rewarding',
    1.5,
  ],
  challenge_complete: ['Warm uplifting three-note synth arpeggio success jingle', 1.5],
  code_error: ['Gentle low soft descending two-tone alert, mild, not harsh', 0.8],
  code_success: ['Quick bright positive digital confirm blip, crisp', 0.5],
  building_place: [
    'Soft mechanical thunk with servo whirr and metallic clamp lock, construction',
    1.2,
  ],
  building_upgrade: ['Ascending servo power-up with energy hum and a bright finishing ping', 1.5],
  resource_collect: ['Light glassy collect ping, coin-like pickup, sparkle', 0.6],
  ui_click: ['Tiny crisp subtle holographic interface click', 0.25],
  ui_hover: ['Very faint airy soft holographic hover tick', 0.15],
  pixel_talk: ['Short cute robotic beep chirp, friendly droid voice blip', 1],
  notification: ['Two-note gentle sci-fi notification chime, attention, pleasant', 0.25],
  level_up: ['Short heroic synth fanfare rising sweep with sparkle, level up', 1.5],
  unlock: ['Magical digital unlock, latch release then airy shimmer rising', 1.2],
  typing: ['Single soft mechanical keyboard key tap, quiet', 0.12],
  whoosh: ['Smooth airy sci-fi transition whoosh sweep, soft', 0.8],
}

const out = 'public/audio/sfx'
// Raw downloads are cached (gitignored) so --reprocess can re-run the audio chain for free.
const cache = process.env.SFX_CACHE ?? join(tmpdir(), 'cc-sfx-raw')
mkdirSync(out, { recursive: true })
mkdirSync(cache, { recursive: true })
const args = process.argv.slice(2)
const reprocess = args.includes('--reprocess')
const wanted = args.filter((a) => !a.startsWith('--'))
const PEAK_LIMIT = 0.708 // -3 dBFS ceiling
// Target RMS (dB) per effect: frequent UI sounds sit well below rare reward stingers so repeats never fatigue.
const TARGET_RMS = {
  ui_click: -24,
  ui_hover: -28,
  typing: -28,
  whoosh: -21,
  pixel_talk: -21,
  code_success: -20,
  code_error: -20,
  resource_collect: -20,
  notification: -19,
  building_place: -18,
  building_upgrade: -18,
  unlock: -18,
  achievement_unlock: -16,
  challenge_complete: -16,
  level_up: -16,
}
const FADE = 0.015
let credits = 0

function measureRms(file) {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', file, '-af', 'astats=metadata=0', '-f', 'null', '-'],
    { encoding: 'utf8' }
  )
  const m = /Overall[\s\S]*?RMS level dB: (-?[\d.]+)/.exec(r.stderr)
  if (!m) throw new Error('astats failed')
  return Number(m[1])
}

for (const [name, [prompt, maxSec]] of Object.entries(SFX)) {
  if (wanted.length && !wanted.includes(name)) continue
  const raw = join(cache, `${name}.src`)
  if (!existsSync(raw)) {
    if (reprocess) throw new Error(`no cached raw for ${name}`)
    const res = await runNode('cassette_ai_sfx', { prompt: `${prompt}. ${STYLE}`, duration: 1 })
    await download(res.urls[0], raw)
    credits += res.credits ?? 0
  }
  // 1) strip leading silence, hard-trim to maxSec, 2) gain to the per-effect target RMS, 3) -3 dBFS limiter, 4) 15ms fade-out, 5) mono mp3
  const trimmed = join(cache, `${name}.trim.wav`)
  const chain = `silenceremove=start_periods=1:start_threshold=-50dB,atrim=0:${maxSec},asetpts=PTS-STARTPTS`
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-af',
    chain,
    '-ac',
    '1',
    '-ar',
    '44100',
    trimmed,
  ])
  const gain = TARGET_RMS[name] - measureRms(trimmed)
  const dur = Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      trimmed,
    ]).toString()
  )
  const dest = join(out, `${name}.mp3`)
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    trimmed,
    '-af',
    `volume=${gain.toFixed(2)}dB,alimiter=limit=${PEAK_LIMIT}:level=disabled,afade=t=out:st=${Math.max(0, dur - FADE).toFixed(3)}:d=${FADE}`,
    '-b:a',
    '64k',
    dest,
  ])
  console.log(name, `${dur.toFixed(2)}s`, statSync(dest).size, 'bytes')
}
console.log('credits this run', credits)
