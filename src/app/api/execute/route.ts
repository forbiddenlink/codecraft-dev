// File: /src/app/api/execute/route.ts
// API route for code execution via Judge0

import { NextRequest, NextResponse } from 'next/server';
import {
  judge0,
  LanguageId,
  Judge0StatusId,
  getLanguageIdFromMonaco,
  isSupportedLanguageId,
  getLanguageName,
  LanguageNames,
  type SupportedLanguageId,
} from '@/lib/judge0';

export interface ExecuteRequest {
  code: string;
  language: string | number; // Monaco language name or Judge0 language ID
  stdin?: string;
  cpuTimeLimit?: number;
  memoryLimit?: number;
}

export interface ExecuteResponse {
  success: boolean;
  output?: string;
  error?: string;
  stderr?: string;
  compileOutput?: string;
  status: {
    id: number;
    description: string;
  };
  executionTime?: string;
  memoryUsed?: number;
  languageName?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteResponse>> {
  try {
    const body: ExecuteRequest = await request.json();
    const { code, language, stdin, cpuTimeLimit, memoryLimit } = body;

    // Validate required fields
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Code is required',
          status: { id: -1, description: 'Bad Request' },
        },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: 'Language is required',
          status: { id: -1, description: 'Bad Request' },
        },
        { status: 400 }
      );
    }

    // Resolve language ID
    let languageId: number;
    if (typeof language === 'number') {
      languageId = language;
    } else {
      const resolved = getLanguageIdFromMonaco(language);
      if (!resolved) {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported language: ${language}`,
            status: { id: -1, description: 'Bad Request' },
          },
          { status: 400 }
        );
      }
      languageId = resolved;
    }

    // Validate language is in our supported list
    if (!isSupportedLanguageId(languageId)) {
      return NextResponse.json(
        {
          success: false,
          error: `Language ID ${languageId} is not supported`,
          status: { id: -1, description: 'Bad Request' },
        },
        { status: 400 }
      );
    }

    // Submit code and wait for result
    const result = await judge0.submitCodeAndWait(code, languageId, stdin, {
      cpuTimeLimit: cpuTimeLimit || 5,
      memoryLimit: memoryLimit || 128000,
    });

    // Determine success based on status
    const isSuccess = result.status.id === Judge0StatusId.ACCEPTED;

    // Build output string
    let output = '';
    if (result.stdout) {
      output = result.stdout;
    }

    // Build error string
    let error: string | undefined;
    if (result.status.id === Judge0StatusId.COMPILATION_ERROR) {
      error = result.compile_output || 'Compilation error';
    } else if (result.status.id >= Judge0StatusId.RUNTIME_ERROR_SIGSEGV) {
      error = result.stderr || result.message || 'Runtime error';
    } else if (result.status.id === Judge0StatusId.TIME_LIMIT_EXCEEDED) {
      error = 'Time limit exceeded';
    } else if (result.status.id === Judge0StatusId.INTERNAL_ERROR) {
      error = 'Internal error occurred';
    }

    return NextResponse.json({
      success: isSuccess,
      output: output || undefined,
      error,
      stderr: result.stderr || undefined,
      compileOutput: result.compile_output || undefined,
      status: result.status,
      executionTime: result.time || undefined,
      memoryUsed: result.memory || undefined,
      languageName: getLanguageName(languageId),
    });
  } catch (err) {
    console.error('Code execution error:', err);

    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

    // Check if it's a Judge0 configuration error
    if (errorMessage.includes('Judge0')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code execution service is not configured. Please check JUDGE0_API_URL and JUDGE0_API_KEY.',
          status: { id: -1, description: 'Service Unavailable' },
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        status: { id: -1, description: 'Internal Error' },
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check available languages
export async function GET(): Promise<NextResponse> {
  try {
    const languages = await judge0.getLanguages();

    // Filter to our supported languages
    const supportedLanguages = languages.filter((lang) => isSupportedLanguageId(lang.id));

    // Build supported list from our LanguageNames
    const supportedList = (Object.keys(LanguageNames) as unknown as SupportedLanguageId[]).map(
      (id) => ({
        id: Number(id),
        name: LanguageNames[id],
      })
    );

    return NextResponse.json({
      languages: supportedLanguages,
      supported: supportedList,
    });
  } catch (err) {
    console.error('Get languages error:', err);

    // Build supported list from our LanguageNames
    const supportedList = (Object.keys(LanguageNames) as unknown as SupportedLanguageId[]).map(
      (id) => ({
        id: Number(id),
        name: LanguageNames[id],
      })
    );

    return NextResponse.json(
      {
        error: 'Failed to fetch languages',
        supported: supportedList,
      },
      { status: 500 }
    );
  }
}
