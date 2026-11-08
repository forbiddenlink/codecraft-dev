import {
  clampExecutionLimits,
  DEFAULT_RUN_LIMITS,
  MAX_CODE_BYTES,
  MAX_CPU_TIME_SECONDS,
  MAX_MEMORY_KB,
  readRunLimits,
} from '@/lib/execute-limits'

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

describe('readRunLimits', () => {
  it('uses classroom-sized defaults when no env vars are set', () => {
    expect(readRunLimits({})).toEqual(DEFAULT_RUN_LIMITS)
    expect(DEFAULT_RUN_LIMITS.perIpBurst).toBeGreaterThanOrEqual(30)
  })

  it('reads positive integers from env', () => {
    expect(
      readRunLimits({ EXECUTE_PER_IP_PER_MINUTE: '5', EXECUTE_PER_IP_BURST: '8', EXECUTE_SITE_PER_HOUR: '100' })
    ).toEqual({ perIpPerMinute: 5, perIpBurst: 8, sitePerHour: 100 })
  })

  it('ignores zero, negative, fractional and junk values', () => {
    expect(
      readRunLimits({ EXECUTE_PER_IP_PER_MINUTE: '0', EXECUTE_PER_IP_BURST: '-4', EXECUTE_SITE_PER_HOUR: '1.5' })
    ).toEqual(DEFAULT_RUN_LIMITS)
    expect(readRunLimits({ EXECUTE_SITE_PER_HOUR: 'lots' }).sitePerHour).toBe(DEFAULT_RUN_LIMITS.sitePerHour)
  })
})
