// Generates NPC voice clips with Magica gemini_pro_tts (about $0.0052 per line) and writes
// public/audio/voice/manifest.json. Existing clips are skipped, so reruns cost nothing.
// Run: node --import ./scripts/lib/register-alias.mjs scripts/generate-voice.ts
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { VoiceManifest } from '../src/utils/voiceManifest.ts'
import { collectVoiceLines, NPC_VOICES } from './collect-voice-lines.ts'
import { download, runNode } from './lib/magica-run.mjs'

const out = 'public/audio/voice'
const cache = process.env.VOICE_CACHE ?? join(tmpdir(), 'cc-voice-raw')
mkdirSync(cache, { recursive: true })

const lines = collectVoiceLines()
const manifest: VoiceManifest = { version: 1, lines: {} }
let credits = 0
let bytes = 0
for (const line of lines) {
  const voice = NPC_VOICES[line.npcId]
  if (!voice) throw new Error(`no voice for ${line.npcId}`)
  mkdirSync(join(out, line.npcId), { recursive: true })
  const file = `${line.npcId}/${line.id}.mp3`
  const dest = join(out, file)
  if (!existsSync(dest)) {
    const raw = join(cache, `${line.npcId}-${line.id}.src`)
    if (!existsSync(raw)) {
      const res = await runNode('gemini_pro_tts', { text: line.text, voice })
      await download(res.urls[0], raw)
      credits += res.credits ?? 0
    }
    // mono speech at 48kbps, loudness-matched across all voices
    execFileSync('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-i',
      raw,
      '-af',
      'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-18:TP=-2',
      '-ac',
      '1',
      '-ar',
      '44100',
      '-b:a',
      '48k',
      dest,
    ])
  }
  bytes += statSync(dest).size
  manifest.lines[line.id] = { npcId: line.npcId, file }
}
writeFileSync(join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`${lines.length} lines, ${bytes} bytes, credits this run ${credits}`)
