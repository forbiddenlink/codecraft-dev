// File: /src/hooks/useCodeExecution.ts
// Hook for executing code via Judge0 API

import { useState, useCallback } from 'react';
import type { ExecuteResponse } from '@/app/api/execute/route';

export interface CodeExecutionState {
  isExecuting: boolean;
  result: ExecuteResponse | null;
  error: string | null;
}

export interface CodeExecutionOptions {
  stdin?: string;
  cpuTimeLimit?: number;
  memoryLimit?: number;
}

export interface UseCodeExecutionReturn {
  execute: (code: string, language: string | number, options?: CodeExecutionOptions) => Promise<ExecuteResponse | null>;
  isExecuting: boolean;
  result: ExecuteResponse | null;
  error: string | null;
  reset: () => void;
}

export function useCodeExecution(): UseCodeExecutionReturn {
  const [state, setState] = useState<CodeExecutionState>({
    isExecuting: false,
    result: null,
    error: null,
  });

  const execute = useCallback(
    async (
      code: string,
      language: string | number,
      options?: CodeExecutionOptions
    ): Promise<ExecuteResponse | null> => {
      setState({
        isExecuting: true,
        result: null,
        error: null,
      });

      try {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language,
            stdin: options?.stdin,
            cpuTimeLimit: options?.cpuTimeLimit,
            memoryLimit: options?.memoryLimit,
          }),
        });

        const result: ExecuteResponse = await response.json();

        setState({
          isExecuting: false,
          result,
          error: result.success ? null : result.error || 'Execution failed',
        });

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute code';
        setState({
          isExecuting: false,
          result: null,
          error: errorMessage,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    execute,
    isExecuting: state.isExecuting,
    result: state.result,
    error: state.error,
    reset,
  };
}

// Hook for fetching available languages
export function useCodeLanguages() {
  const [languages, setLanguages] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/execute');
      const data = await response.json();

      if (data.supported) {
        setLanguages(data.supported);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch languages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    languages,
    isLoading,
    error,
    fetchLanguages,
  };
}

export default useCodeExecution;
