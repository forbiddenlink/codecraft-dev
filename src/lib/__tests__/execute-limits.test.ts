import { clampExecutionLimits, MAX_CODE_BYTES, MAX_CPU_TIME_SECONDS, MAX_MEMORY_KB } from '@/lib/execute-limits'

describe('clampExecutionLimits', () => {
  it('uses defaults when the client sends nothing', () => {
    expect(clampExecutionLimits(undefined, undefined)).toEqual({ cpuTimeLimit: 5, memoryLimit: 128000 })
  })

  it('caps client-requested limits at the server maximum', () => {
    expect(clampExecutionLimits(9999, 99_999_999)).toEqual({
      cpuTimeLimit: MAX_CPU_TIME_SECONDS,
      memoryLimit: MAX_MEMORY_KB,
    })
  })

  it('keeps smaller valid limits', () => {
    expect(clampExecutionLimits(2, 64000)).toEqual({ cpuTimeLimit: 2, memoryLimit: 64000 })
  })

  it('falls back to defaults for zero, negative and non-numeric values', () => {
    expect(clampExecutionLimits(-1, 0)).toEqual({ cpuTimeLimit: 5, memoryLimit: 128000 })
    expect(clampExecutionLimits('10' as unknown as number, Number.NaN)).toEqual({ cpuTimeLimit: 5, memoryLimit: 128000 })
  })

  it('exposes a code size cap', () => {
    expect(MAX_CODE_BYTES).toBe(64 * 1024)
  })
})
