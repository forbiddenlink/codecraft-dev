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
