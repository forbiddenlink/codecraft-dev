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

export type RunLimits = { perIpPerMinute: number; perIpBurst: number; perIpPerHour: number; sitePerHour: number }

// Without a login, one script on one IP looks the same as a classroom on one IP. The per-IP hourly
// cap keeps any single IP to a quarter of the site cap, so no one IP can lock everyone else out.
// It is clamped to half the site cap even when set higher by env.
export const PER_IP_SHARE_OF_SITE = 4

const envInt = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export function readRunLimits(env: Record<string, string | undefined>): RunLimits {
  const base = {
    perIpPerMinute: envInt(env.EXECUTE_PER_IP_PER_MINUTE, DEFAULT_RUN_LIMITS.perIpPerMinute),
    perIpBurst: envInt(env.EXECUTE_PER_IP_BURST, DEFAULT_RUN_LIMITS.perIpBurst),
    sitePerHour: envInt(env.EXECUTE_SITE_PER_HOUR, DEFAULT_RUN_LIMITS.sitePerHour),
  }
  const ceiling = Math.max(1, Math.floor(base.sitePerHour / 2))
  const perIpPerHour = Math.min(
    envInt(env.EXECUTE_PER_IP_PER_HOUR, Math.max(1, Math.floor(base.sitePerHour / PER_IP_SHARE_OF_SITE))),
    ceiling
  )
  return { ...base, perIpPerHour }
}
