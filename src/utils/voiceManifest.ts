/**
 * NPC voice lines: deterministic ids and manifest lookup.
 *
 * Dialogue lines in the data files have no stable ids (tutorial steps and story
 * missions use plain strings). A line's id is therefore derived from its text:
 * whitespace-collapsed, trimmed, then 32-bit FNV-1a as 8 lowercase hex chars.
 * The same function runs in the generator script and in the browser, so a line
 * that is edited simply stops matching and falls back to text-only (subtitles
 * are never affected).
 *
 * Pure module: no DOM, no fetch. Playback lives in soundSystem.
 */

export interface VoiceManifestEntry {
  npcId: string
  /** Path under /audio/voice, e.g. "pixel/1a2b3c4d.mp3" */
  file: string
}

export interface VoiceManifest {
  version: 1
  lines: Record<string, VoiceManifestEntry>
}

export function normalizeVoiceText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

export function voiceLineId(text: string): string {
  const input = normalizeVoiceText(text)
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function voiceUrlForFile(file: string): string {
  return `/audio/voice/${file}`
}

/** Returns the public URL of the pre-generated clip for this text, or null. */
export function lookupVoiceUrl(manifest: VoiceManifest | null, text: string): string | null {
  if (!manifest) return null
  const id = voiceLineId(text)
  if (!Object.hasOwn(manifest.lines, id)) return null
  return voiceUrlForFile(manifest.lines[id].file)
}
