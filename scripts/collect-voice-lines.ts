// Collects the dialogue lines that get a recorded voice, from the game's own data modules.
// Run via: node --import ./scripts/lib/register-alias.mjs scripts/generate-voice.ts
import * as exampleDialogues from '../src/data/exampleDialogues.ts'
import { STORY_MISSIONS } from '../src/data/storyMissions.ts'
import { WELCOME_TUTORIAL } from '../src/data/tutorialData.ts'
import { voiceLineId } from '../src/utils/voiceManifest.ts'

export interface VoiceLine {
  id: string
  npcId: string
  text: string
}

/** npcId -> Gemini prebuilt voice. Six NPCs, one distinct voice each. */
export const NPC_VOICES: Record<string, string> = {
  pixel: 'Zephyr',
  tutorial_guide: 'Sulafat',
  resource_manager: 'Charon',
  skill_master: 'Gacrux',
  'captain-rivera': 'Orus',
  'dr-chen': 'Aoede',
}

const MAX_LINES = 60

function characterNpcId(name: string): string | null {
  if (/pixel|codex/i.test(name)) return 'pixel'
  if (/rivera/i.test(name)) return 'captain-rivera'
  if (/chen/i.test(name)) return 'dr-chen'
  return null
}

export function collectVoiceLines(): VoiceLine[] {
  const out: VoiceLine[] = []
  const seen = new Set<string>()
  const add = (npcId: string, text: string | undefined) => {
    if (!text || out.length >= MAX_LINES) return
    const id = voiceLineId(text)
    if (seen.has(id)) return
    seen.add(id)
    out.push({ id, npcId, text: text.replace(/\s+/g, ' ').trim() })
  }

  // Priority order: what players hear first, then the rest, until the cap.
  for (const step of WELCOME_TUTORIAL.steps) add('pixel', step.pixelDialogue)

  for (const tree of Object.values(exampleDialogues)) {
    if (!tree || typeof tree !== 'object' || !('nodes' in tree)) continue
    for (const node of (
      tree as { nodes: Map<string, { text: string }>; npcId: string }
    ).nodes.values()) {
      add((tree as { npcId: string }).npcId, node.text)
    }
  }

  for (const mission of STORY_MISSIONS) {
    for (const character of mission.characters) {
      const npcId = characterNpcId(character.name)
      if (npcId && npcId !== 'pixel') for (const line of character.dialogue) add(npcId, line)
    }
  }
  for (const mission of STORY_MISSIONS) {
    for (const line of mission.story.pixelDialogue) add('pixel', line)
  }
  for (const mission of STORY_MISSIONS) {
    for (const character of mission.characters) {
      if (characterNpcId(character.name) === 'pixel')
        for (const line of character.dialogue) add('pixel', line)
    }
  }
  return out
}
