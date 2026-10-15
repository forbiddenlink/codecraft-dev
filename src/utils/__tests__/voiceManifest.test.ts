import {
  lookupVoiceUrl,
  normalizeVoiceText,
  type VoiceManifest,
  voiceLineId,
  voiceUrlForFile,
} from '../voiceManifest'

describe('voiceLineId', () => {
  it('is deterministic and 8 hex chars', () => {
    const id = voiceLineId('Welcome, Commander.')
    expect(id).toMatch(/^[0-9a-f]{8}$/)
    expect(voiceLineId('Welcome, Commander.')).toBe(id)
  })

  it('ignores whitespace differences but not wording', () => {
    expect(voiceLineId('  Welcome,\n  Commander.  ')).toBe(voiceLineId('Welcome, Commander.'))
    expect(voiceLineId('Welcome, Commander!')).not.toBe(voiceLineId('Welcome, Commander.'))
  })

  it('matches the FNV-1a reference value for a known input', () => {
    // FNV-1a 32-bit of "a" is 0xe40c292c
    expect(voiceLineId('a')).toBe('e40c292c')
  })

  it('normalizes text', () => {
    expect(normalizeVoiceText('a \n b')).toBe('a b')
  })
})

describe('lookupVoiceUrl', () => {
  const text = 'Resources are the lifeblood of the colony.'
  const manifest: VoiceManifest = {
    version: 1,
    lines: {
      [voiceLineId(text)]: {
        npcId: 'resource_manager',
        file: `resource_manager/${voiceLineId(text)}.mp3`,
      },
    },
  }

  it('returns the public url for a known line', () => {
    expect(lookupVoiceUrl(manifest, text)).toBe(
      voiceUrlForFile(`resource_manager/${voiceLineId(text)}.mp3`)
    )
  })

  it('returns null for unknown lines and a missing manifest', () => {
    expect(lookupVoiceUrl(manifest, 'Something else entirely')).toBeNull()
    expect(lookupVoiceUrl(null, text)).toBeNull()
  })

  it('does not match inherited object keys', () => {
    // voiceLineId output is hex, but guard the prototype lookup anyway
    expect(lookupVoiceUrl({ version: 1, lines: {} }, 'constructor')).toBeNull()
  })
})
