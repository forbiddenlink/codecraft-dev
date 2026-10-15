// Generates public/music/<track>.mp3 via Magica lyria_3_5 ($0.08 each).
// Post-processing makes each file loop seamlessly: the last XFADE seconds are
// cross-faded into the start, so HTMLAudioElement.loop has no audible seam.
// Usage: node scripts/generate-music.mjs [track ...]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { download, runNode } from './lib/magica-run.mjs'

const BASE =
  'Instrumental only, no vocals, no lyrics. Seamless loopable arrangement without a hard ending, steady and unobtrusive. Sci-fi space colony setting.'
const TRACKS = {
  main_theme:
    'Hopeful cinematic ambient main theme, warm analog synth pads, soft piano motif, gentle slow build, wonder and discovery, 80 bpm.',
  exploration:
    'Curious light exploratory ambient electronic, glassy plucks, airy pads, soft pulse, sense of drifting across a new planet, 95 bpm.',
  coding_focus:
    'Calm deep focus music for programming, very minimal ambient, soft evolving pads, subtle slow pulse, no melody that distracts, low energy, 70 bpm.',
  victory:
    'Energetic uplifting celebratory synthwave, driving pulse, bright arpeggios, triumphant colony milestone event, 125 bpm.',
  ambient_space:
    'Spacious drifting deep-space ambient drone, slow shimmering textures, distant soft tones, tranquil and weightless, no beat.',
}
const XFADE = 3
const MAX_SECONDS = 110 // keeps each file under ~1.4MB at 96kbps
const out = 'public/music'
mkdirSync(out, { recursive: true })
const tmp = join(tmpdir(), 'cc-music')
mkdirSync(tmp, { recursive: true })
const wanted = process.argv.slice(2)
for (const [name, style] of Object.entries(TRACKS)) {
  if (wanted.length ? !wanted.includes(name) : existsSync(join(out, `${name}.mp3`))) continue
  const { urls, credits } = await runNode('lyria_3_5', { prompt: `${style} ${BASE}` })
  const raw = join(tmp, `${name}.src`)
  await download(urls[0], raw)
  const full = Number(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      raw,
    ]).toString()
  )
  const len = Math.min(full, MAX_SECONDS)
  const cut = len - XFADE
  const filter = `[0:a]atrim=0:${cut},asetpts=PTS-STARTPTS[a];[0:a]atrim=${cut}:${len},asetpts=PTS-STARTPTS[t];[t][a]acrossfade=d=${XFADE}:c1=tri:c2=tri,loudnorm=I=-23:TP=-2[o]`
  const dest = join(out, `${name}.mp3`)
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-filter_complex',
    filter,
    '-map',
    '[o]',
    '-ac',
    '2',
    '-ar',
    '44100',
    '-b:a',
    '96k',
    dest,
  ])
  console.log(name, 'src', full.toFixed(1), 's', statSync(dest).size, 'bytes', 'credits', credits)
}
rmSync(tmp, { recursive: true, force: true })
