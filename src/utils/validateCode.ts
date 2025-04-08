// File: /src/utils/validateCode.ts
import { challenges } from '@/data/challenges';

export function validateCode(code: string, challenge: (typeof challenges)[number]) {
  return challenge.validate(code);
}