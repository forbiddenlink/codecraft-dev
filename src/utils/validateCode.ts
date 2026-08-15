// File: /src/utils/validateCode.ts
import type { challenges } from '@/data/challenges'

export function validateCode(code: string, challenge: (typeof challenges)[number]) {
  return challenge.validate(code)
}
