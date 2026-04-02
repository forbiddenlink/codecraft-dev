/**
 * useWebContainerSandbox — WebContainer-based in-browser Node.js execution
 * for codecraft-dev coding challenges.
 *
 * WHY ADDED: codecraft-dev already has @webcontainer/api in deps but no hook
 * wrapping it. WebContainers let learners execute real Node.js code inside the
 * browser sandbox with zero backend — perfect for game-level coding challenges
 * where you want immediate, safe, full-fidelity execution.
 *
 * WHAT IT DOES:
 *  - Boots a WebContainer only once (singleton across challenges)
 *  - Writes the user's code to a virtual filesystem file
 *  - Runs it with Node.js, captures stdout + stderr
 *  - Returns execution output, exit code, and timing
 *  - Auto-tests against expected output for XP award
 *
 * REQUIRES: Cross-Origin-Isolation headers (COOP/COEP) — add vercel.json headers.
 *
 * USAGE:
 *   const { run, output, isRunning, didPass } = useWebContainerSandbox()
 *   await run(userCode, expectedOutput)
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  didPass: boolean;
}

interface UseWebContainerSandboxReturn {
  run: (code: string, expected?: string) => Promise<ExecutionResult>;
  output: ExecutionResult | null;
  isRunning: boolean;
  isBooting: boolean;
  error: string | null;
}

// WebContainer singleton shared across all hook instances
let wcInstance: Awaited<
  ReturnType<typeof import("@webcontainer/api").WebContainer.boot>
> | null = null;
let bootPromise: Promise<Awaited<ReturnType<typeof import("@webcontainer/api").WebContainer.boot>>> | null = null;

async function getWebContainer() {
  if (wcInstance) return wcInstance;
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    const { WebContainer } = await import("@webcontainer/api");
    wcInstance = await WebContainer.boot();
    // Install a minimal package.json so Node resolution works
    await wcInstance.mount({
      "package.json": {
        file: { contents: JSON.stringify({ name: "sandbox", type: "module" }) },
      },
    });
    return wcInstance;
  })();

  return bootPromise;
}

const TIMEOUT_MS = 8_000;

export function useWebContainerSandbox(): UseWebContainerSandboxReturn {
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Pre-warm the container on first render so it's ready when the user clicks Run
  useEffect(() => {
    mountedRef.current = true;
    setIsBooting(true);
    getWebContainer()
      .then(() => {
        if (mountedRef.current) setIsBooting(false);
      })
      .catch((e) => {
        if (mountedRef.current) {
          setIsBooting(false);
          setError(e instanceof Error ? e.message : "WebContainer boot failed");
        }
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (code: string, expected?: string): Promise<ExecutionResult> => {
      setIsRunning(true);
      setError(null);
      const start = Date.now();

      try {
        const wc = await getWebContainer();
        if (!wc) throw new Error("WebContainer not available");

        // Write the user's code
        await wc.fs.writeFile("/solution.js", code);

        // Execute with a timeout
        const proc = await wc.spawn("node", ["/solution.js"]);

        let stdout = "";
        let stderr = "";

        proc.output.pipeTo(
          new WritableStream({
            write(chunk) {
              stdout += chunk;
            },
          }),
        );

        const exitCode = await Promise.race<number>([
          proc.exit,
          new Promise<number>((_, reject) =>
            setTimeout(
              () => reject(new Error("Execution timed out after 8s")),
              TIMEOUT_MS,
            ),
          ),
        ]);

        const durationMs = Date.now() - start;
        const didPass =
          expected !== undefined
            ? stdout.trim() === expected.trim()
            : exitCode === 0;

        const result: ExecutionResult = {
          stdout,
          stderr,
          exitCode,
          durationMs,
          didPass,
        };

        if (mountedRef.current) {
          setOutput(result);
          setIsRunning(false);
        }
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Execution failed";
        if (mountedRef.current) {
          setError(msg);
          setIsRunning(false);
        }
        return {
          stdout: "",
          stderr: msg,
          exitCode: 1,
          durationMs: Date.now() - start,
          didPass: false,
        };
      }
    },
    [],
  );

  return { run, output, isRunning, isBooting, error };
}
