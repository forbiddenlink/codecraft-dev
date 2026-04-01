// File: /src/lib/judge0.ts
// Judge0 CE API client for code execution

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

export interface Judge0SubmissionResult {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export interface Judge0Language {
  id: number;
  name: string;
}

export interface Judge0Status {
  id: number;
  description: string;
}

// Status IDs from Judge0
export const Judge0StatusId = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
} as const;

// Supported language IDs
export const LanguageId = {
  JAVASCRIPT: 63,      // JavaScript (Node.js 12.14.0)
  TYPESCRIPT: 74,      // TypeScript (3.7.4)
  PYTHON: 71,          // Python (3.8.1)
  GO: 60,              // Go (1.13.5)
  RUST: 73,            // Rust (1.40.0)
  C: 50,               // C (GCC 9.2.0)
  CPP: 54,             // C++ (GCC 9.2.0)
  JAVA: 62,            // Java (OpenJDK 13.0.1)
} as const;

// Supported language ID type
export type SupportedLanguageId = (typeof LanguageId)[keyof typeof LanguageId];

// Language display names
export const LanguageNames: Record<SupportedLanguageId, string> = {
  [LanguageId.JAVASCRIPT]: 'JavaScript',
  [LanguageId.TYPESCRIPT]: 'TypeScript',
  [LanguageId.PYTHON]: 'Python',
  [LanguageId.GO]: 'Go',
  [LanguageId.RUST]: 'Rust',
  [LanguageId.C]: 'C',
  [LanguageId.CPP]: 'C++',
  [LanguageId.JAVA]: 'Java',
};

// Helper to check if a number is a supported language ID
export function isSupportedLanguageId(id: number): id is SupportedLanguageId {
  return id in LanguageNames;
}

// Safe lookup for language name
export function getLanguageName(id: number): string | undefined {
  if (isSupportedLanguageId(id)) {
    return LanguageNames[id];
  }
  return undefined;
}

// File extensions for each language
export const LanguageExtensions: Record<number, string> = {
  [LanguageId.JAVASCRIPT]: 'js',
  [LanguageId.TYPESCRIPT]: 'ts',
  [LanguageId.PYTHON]: 'py',
  [LanguageId.GO]: 'go',
  [LanguageId.RUST]: 'rs',
  [LanguageId.C]: 'c',
  [LanguageId.CPP]: 'cpp',
  [LanguageId.JAVA]: 'java',
};

// Default code templates for each language
export const LanguageTemplates: Record<number, string> = {
  [LanguageId.JAVASCRIPT]: `// JavaScript
console.log("Hello, World!");
`,
  [LanguageId.TYPESCRIPT]: `// TypeScript
const greeting: string = "Hello, World!";
console.log(greeting);
`,
  [LanguageId.PYTHON]: `# Python
print("Hello, World!")
`,
  [LanguageId.GO]: `// Go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`,
  [LanguageId.RUST]: `// Rust
fn main() {
    println!("Hello, World!");
}
`,
  [LanguageId.C]: `// C
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  [LanguageId.CPP]: `// C++
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
  [LanguageId.JAVA]: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
};

class Judge0Client {
  private baseUrl: string;
  private apiKey: string | undefined;
  private rapidApiHost: string | undefined;

  constructor() {
    // Support both self-hosted Judge0 and RapidAPI
    this.baseUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
    this.rapidApiHost = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // RapidAPI authentication
    if (this.apiKey && this.rapidApiHost) {
      headers['X-RapidAPI-Key'] = this.apiKey;
      headers['X-RapidAPI-Host'] = this.rapidApiHost;
    }

    return headers;
  }

  /**
   * Submit code for execution
   * Returns a token that can be used to fetch results
   */
  async submitCode(
    sourceCode: string,
    languageId: number,
    stdin?: string,
    options?: {
      cpuTimeLimit?: number;
      memoryLimit?: number;
      expectedOutput?: string;
    }
  ): Promise<{ token: string }> {
    const submission: Judge0Submission = {
      source_code: btoa(unescape(encodeURIComponent(sourceCode))), // Base64 encode
      language_id: languageId,
      stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : undefined,
      cpu_time_limit: options?.cpuTimeLimit || 5,
      memory_limit: options?.memoryLimit || 128000,
      expected_output: options?.expectedOutput
        ? btoa(unescape(encodeURIComponent(options.expectedOutput)))
        : undefined,
    };

    const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 submission failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Submit code and wait for result (synchronous execution)
   */
  async submitCodeAndWait(
    sourceCode: string,
    languageId: number,
    stdin?: string,
    options?: {
      cpuTimeLimit?: number;
      memoryLimit?: number;
      expectedOutput?: string;
    }
  ): Promise<Judge0SubmissionResult> {
    const submission: Judge0Submission = {
      source_code: btoa(unescape(encodeURIComponent(sourceCode))), // Base64 encode
      language_id: languageId,
      stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : undefined,
      cpu_time_limit: options?.cpuTimeLimit || 5,
      memory_limit: options?.memoryLimit || 128000,
      expected_output: options?.expectedOutput
        ? btoa(unescape(encodeURIComponent(options.expectedOutput)))
        : undefined,
    };

    const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 submission failed: ${error}`);
    }

    const result = await response.json();
    return this.decodeResult(result);
  }

  /**
   * Get submission result by token
   */
  async getSubmission(token: string): Promise<Judge0SubmissionResult> {
    const response = await fetch(
      `${this.baseUrl}/submissions/${token}?base64_encoded=true&fields=*`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 get submission failed: ${error}`);
    }

    const result = await response.json();
    return this.decodeResult(result);
  }

  /**
   * Poll for submission result until complete
   */
  async pollSubmission(
    token: string,
    maxAttempts: number = 20,
    intervalMs: number = 500
  ): Promise<Judge0SubmissionResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getSubmission(token);

      // Check if processing is complete
      if (result.status.id !== Judge0StatusId.IN_QUEUE && result.status.id !== Judge0StatusId.PROCESSING) {
        return result;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Submission timed out');
  }

  /**
   * Get available languages
   */
  async getLanguages(): Promise<Judge0Language[]> {
    const response = await fetch(`${this.baseUrl}/languages`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 get languages failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Get all possible statuses
   */
  async getStatuses(): Promise<Judge0Status[]> {
    const response = await fetch(`${this.baseUrl}/statuses`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 get statuses failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Submit multiple code submissions in batch
   */
  async submitBatch(
    submissions: Array<{
      sourceCode: string;
      languageId: number;
      stdin?: string;
    }>
  ): Promise<{ tokens: string[] }> {
    const formattedSubmissions = submissions.map((sub) => ({
      source_code: btoa(unescape(encodeURIComponent(sub.sourceCode))),
      language_id: sub.languageId,
      stdin: sub.stdin ? btoa(unescape(encodeURIComponent(sub.stdin))) : undefined,
    }));

    const response = await fetch(`${this.baseUrl}/submissions/batch?base64_encoded=true`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ submissions: formattedSubmissions }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Judge0 batch submission failed: ${error}`);
    }

    const result = await response.json();
    return { tokens: result.map((r: { token: string }) => r.token) };
  }

  /**
   * Decode base64 encoded result fields
   */
  private decodeResult(result: Judge0SubmissionResult): Judge0SubmissionResult {
    const decode = (str: string | null): string | null => {
      if (!str) return null;
      try {
        return decodeURIComponent(escape(atob(str)));
      } catch {
        return str;
      }
    };

    return {
      ...result,
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compile_output: decode(result.compile_output),
      message: decode(result.message),
    };
  }
}

// Export singleton instance
export const judge0 = new Judge0Client();

// Export helper function to check if Judge0 is configured
export function isJudge0Configured(): boolean {
  return !!(process.env.JUDGE0_API_URL || process.env.JUDGE0_API_KEY);
}

// Export helper to get language ID from file extension
export function getLanguageIdFromExtension(extension: string): number | null {
  const extToId: Record<string, number> = {
    js: LanguageId.JAVASCRIPT,
    mjs: LanguageId.JAVASCRIPT,
    ts: LanguageId.TYPESCRIPT,
    tsx: LanguageId.TYPESCRIPT,
    py: LanguageId.PYTHON,
    go: LanguageId.GO,
    rs: LanguageId.RUST,
    c: LanguageId.C,
    cpp: LanguageId.CPP,
    cc: LanguageId.CPP,
    cxx: LanguageId.CPP,
    java: LanguageId.JAVA,
  };

  return extToId[extension.toLowerCase()] || null;
}

// Export helper to get language ID from Monaco language
export function getLanguageIdFromMonaco(monacoLanguage: string): number | null {
  const monacoToId: Record<string, number> = {
    javascript: LanguageId.JAVASCRIPT,
    typescript: LanguageId.TYPESCRIPT,
    python: LanguageId.PYTHON,
    go: LanguageId.GO,
    rust: LanguageId.RUST,
    c: LanguageId.C,
    cpp: LanguageId.CPP,
    java: LanguageId.JAVA,
  };

  return monacoToId[monacoLanguage.toLowerCase()] || null;
}
