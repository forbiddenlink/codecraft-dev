// Build-time Magica client. MAGICA_KEY is read from the environment and is never
// bundled into client code. Output URLs are downloaded into public/ by the callers.
const BASE = 'https://api.magica.com/api/v1'

function headers() {
  const key = process.env.MAGICA_KEY
  if (!key) throw new Error('MAGICA_KEY missing from environment')
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
}

export async function runNode(nodeType, input, opts = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await runNodeOnce(nodeType, input, opts)
    } catch (e) {
      if (attempt < 3 && /rate limit/i.test(String(e))) {
        await new Promise((r) => setTimeout(r, 30000 * (attempt + 1)))
        continue
      }
      throw e
    }
  }
}

async function runNodeOnce(nodeType, input, { timeoutMs = 300000 } = {}) {
  let start
  for (let attempt = 0; attempt < 6; attempt++) {
    start = await fetch(`${BASE}/nodes/${nodeType}/run`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ input }),
    })
    if (start.status !== 429) break
    await new Promise((r) => setTimeout(r, 15000 * (attempt + 1)))
  }
  if (!start.ok) throw new Error(`start ${nodeType} failed: ${start.status} ${await start.text()}`)
  const { runId } = await start.json()
  const deadline = Date.now() + timeoutMs
  for (;;) {
    await new Promise((r) => setTimeout(r, 3000))
    const res = await fetch(`${BASE}/nodes/runs/${runId}`, { headers: headers() })
    const run = await res.json()
    if (!['RUNNING', 'PENDING', 'QUEUED'].includes(run.status)) {
      if (run.status === 'FAILED' || run.error)
        throw new Error(`run ${runId} failed: ${JSON.stringify(run.error ?? run.status)}`)
      return { urls: run.output?.result ?? [], credits: run.creditUsed ?? null, runId }
    }
    if (Date.now() > deadline) throw new Error(`run ${runId} timed out`)
  }
}

export async function download(url, dest) {
  const { writeFile } = await import('node:fs/promises')
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed ${res.status}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}
