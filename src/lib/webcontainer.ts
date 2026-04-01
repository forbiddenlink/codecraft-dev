import { WebContainer } from '@webcontainer/api'

let webcontainer: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

export async function bootWebContainer(): Promise<WebContainer> {
  if (webcontainer) return webcontainer

  // Prevent multiple concurrent boot attempts
  if (bootPromise) return bootPromise

  bootPromise = WebContainer.boot().then((wc) => {
    webcontainer = wc
    return wc
  })

  return bootPromise
}

export interface RunResult {
  output: string
  exitCode: number
}

export async function runCode(code: string, filename = 'index.js'): Promise<RunResult> {
  const wc = await bootWebContainer()

  await wc.mount({
    [filename]: { file: { contents: code } }
  })

  const process = await wc.spawn('node', [filename])

  let output = ''
  const reader = process.output.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    output += value
  }

  const exitCode = await process.exit

  return { output, exitCode }
}

export async function runCodeWithDependencies(
  files: Record<string, string>,
  entrypoint: string,
  dependencies?: Record<string, string>
): Promise<RunResult> {
  const wc = await bootWebContainer()

  // Build file tree
  const fileTree: Record<string, { file: { contents: string } }> = {}
  for (const [path, contents] of Object.entries(files)) {
    fileTree[path] = { file: { contents } }
  }

  // Add package.json if dependencies provided
  if (dependencies && Object.keys(dependencies).length > 0) {
    fileTree['package.json'] = {
      file: {
        contents: JSON.stringify({
          name: 'sandbox',
          type: 'module',
          dependencies
        }, null, 2)
      }
    }
  }

  await wc.mount(fileTree)

  // Install dependencies if package.json exists
  if (dependencies && Object.keys(dependencies).length > 0) {
    const installProcess = await wc.spawn('npm', ['install'])
    await installProcess.exit
  }

  const process = await wc.spawn('node', [entrypoint])

  let output = ''
  const reader = process.output.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    output += value
  }

  const exitCode = await process.exit

  return { output, exitCode }
}

export async function teardownWebContainer(): Promise<void> {
  if (webcontainer) {
    webcontainer.teardown()
    webcontainer = null
    bootPromise = null
  }
}

export function isWebContainerSupported(): boolean {
  return typeof window !== 'undefined' && 'SharedArrayBuffer' in window
}
