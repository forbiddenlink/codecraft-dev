// Server-side caps for /api/execute. The client used to pick its own Judge0 CPU and memory limits,
// so one request could ask for as much as the Judge0 plan allows.
export const MAX_CPU_TIME_SECONDS = 5
export const MAX_MEMORY_KB = 128000
export const MAX_CODE_BYTES = 64 * 1024

const positive = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0

export function clampExecutionLimits(
  cpuTimeLimit: unknown,
  memoryLimit: unknown
): { cpuTimeLimit: number; memoryLimit: number } {
  return {
    cpuTimeLimit: positive(cpuTimeLimit) ? Math.min(cpuTimeLimit, MAX_CPU_TIME_SECONDS) : MAX_CPU_TIME_SECONDS,
    memoryLimit: positive(memoryLimit) ? Math.min(memoryLimit, MAX_MEMORY_KB) : MAX_MEMORY_KB,
  }
}

// Defaults fit a class of about 30 on one network: each student can run code about once a minute,
// with headroom for everyone pressing Run at the same moment.
export const DEFAULT_RUN_LIMITS = { perIpPerMinute: 30, perIpBurst: 60, sitePerHour: 600 } as const

export type RunLimits = { perIpPerMinute: number; perIpBurst: number; sitePerHour: number }

const envInt = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export function readRunLimits(env: Record<string, string | undefined>): RunLimits {
  return {
    perIpPerMinute: envInt(env.EXECUTE_PER_IP_PER_MINUTE, DEFAULT_RUN_LIMITS.perIpPerMinute),
    perIpBurst: envInt(env.EXECUTE_PER_IP_BURST, DEFAULT_RUN_LIMITS.perIpBurst),
    sitePerHour: envInt(env.EXECUTE_SITE_PER_HOUR, DEFAULT_RUN_LIMITS.sitePerHour),
  }
}
