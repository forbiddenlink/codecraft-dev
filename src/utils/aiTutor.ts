/**
 * Advanced AI Tutoring System
 * Provides intelligent, context-aware coding assistance
 */

import { getAnalytics } from './analyticsSystem';

export interface TutorResponse {
  message: string;
  tone: 'encouraging' | 'neutral' | 'celebratory' | 'concerned';
  suggestions: string[];
  resources?: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'example';
  }[];
  codeExample?: string;
}

export interface CodeAnalysis {
  errors: {
    line: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    fix?: string;
  }[];
  suggestions: {
    type: 'performance' | 'accessibility' | 'bestPractice' | 'readability';
    message: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  score: {
    overall: number;
    readability: number;
    maintainability: number;
    accessibility: number;
  };
}

class AITutorSystem {
  /**
   * Analyze user's code and provide feedback
   */
  analyzeCode(code: string, language: 'html' | 'css' | 'javascript'): CodeAnalysis {
    const analysis: CodeAnalysis = {
      errors: [],
      suggestions: [],
      score: {
        overall: 100,
        readability: 100,
        maintainability: 100,
        accessibility: 100,
      },
    };

    switch (language) {
      case 'html':
        this.analyzeHTML(code, analysis);
        break;
      case 'css':
        this.analyzeCSS(code, analysis);
        break;
      case 'javascript':
        this.analyzeJavaScript(code, analysis);
        break;
    }

    // Calculate overall score
    analysis.score.overall = Math.round(
      (analysis.score.readability +
        analysis.score.maintainability +
        analysis.score.accessibility) /
        3
    );

    return analysis;
  }

  private analyzeHTML(code: string, analysis: CodeAnalysis): void {
    // Check for semantic HTML
    if (!code.includes('<main>') && !code.includes('<article>')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Consider using semantic HTML5 elements like <main>, <article>, or <section>',
        impact: 'medium',
      });
      analysis.score.readability -= 5;
    }

    // Check for accessibility
    const imgRegex = /<img[^>]+>/g;
    const imgs = code.match(imgRegex) || [];
    imgs.forEach((img, index) => {
      if (!img.includes('alt=')) {
        analysis.errors.push({
          line: this.getLineNumber(code, img),
          message: 'Image missing alt attribute (accessibility issue)',
          severity: 'error',
          fix: 'Add alt="descriptive text" to the image',
        });
        analysis.score.accessibility -= 10;
      }
    });

    // Check for proper heading hierarchy
    const h1Count = (code.match(/<h1/g) || []).length;
    if (h1Count === 0) {
      analysis.suggestions.push({
        type: 'accessibility',
        message: 'Page should have one <h1> heading for main content',
        impact: 'high',
      });
      analysis.score.accessibility -= 5;
    } else if (h1Count > 1) {
      analysis.suggestions.push({
        type: 'accessibility',
        message: 'Page should only have one <h1> heading',
        impact: 'medium',
      });
      analysis.score.accessibility -= 3;
    }

    // Check for inline styles (discouraged)
    if (code.includes('style=')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Avoid inline styles. Use CSS classes instead for better maintainability',
        impact: 'medium',
      });
      analysis.score.maintainability -= 10;
    }

    // Check for proper structure
    if (!code.includes('<!DOCTYPE html>') && code.includes('<html')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Add <!DOCTYPE html> declaration at the beginning',
        impact: 'low',
      });
    }
  }

  private analyzeCSS(code: string, analysis: CodeAnalysis): void {
    // Check for !important overuse
    const importantCount = (code.match(/!important/g) || []).length;
    if (importantCount > 2) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Excessive use of !important. Consider improving CSS specificity instead',
        impact: 'medium',
      });
      analysis.score.maintainability -= 10;
    }

    // Check for vendor prefixes
    if (code.includes('-webkit-') || code.includes('-moz-')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Consider using autoprefixer instead of manual vendor prefixes',
        impact: 'low',
      });
    }

    // Check for color contrast (basic check)
    const colorRegex = /color\s*:\s*([^;]+)/g;
    const bgRegex = /background(?:-color)?\s*:\s*([^;]+)/g;

    // Check for CSS variables (modern practice)
    if (!code.includes('--') && code.length > 100) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Consider using CSS custom properties (variables) for reusable values',
        impact: 'medium',
      });
      analysis.score.maintainability -= 5;
    }

    // Check for units on zero values
    if (code.match(/:\s*0px|0em|0rem/)) {
      analysis.suggestions.push({
        type: 'readability',
        message: 'Remove units from zero values (0px → 0)',
        impact: 'low',
      });
      analysis.score.readability -= 3;
    }

    // Check for shorthand properties
    if (code.includes('margin-top') && code.includes('margin-bottom')) {
      analysis.suggestions.push({
        type: 'readability',
        message: 'Consider using shorthand margin property',
        impact: 'low',
      });
    }
  }

  private analyzeJavaScript(code: string, analysis: CodeAnalysis): void {
    // Check for var usage
    if (code.includes('var ')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Use const or let instead of var for better scoping',
        impact: 'medium',
      });
      analysis.score.maintainability -= 5;
    }

    // Check for console.log (should be removed in production)
    if (code.includes('console.log')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Remember to remove console.log statements in production code',
        impact: 'low',
      });
    }

    // Check for == instead of ===
    if (code.match(/[^=!]=[^=]/)) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Use === instead of == for strict equality comparison',
        impact: 'medium',
      });
      analysis.score.maintainability -= 5;
    }

    // Check for function declarations
    const functionCount = (code.match(/function\s+\w+/g) || []).length;
    const arrowCount = (code.match(/=>\s*{/g) || []).length;

    if (functionCount > 0 && arrowCount === 0) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Consider using arrow functions for cleaner syntax',
        impact: 'low',
      });
    }

    // Check for error handling
    if (code.includes('fetch(') && !code.includes('catch(')) {
      analysis.suggestions.push({
        type: 'bestPractice',
        message: 'Add error handling (catch) to async operations',
        impact: 'high',
      });
      analysis.score.maintainability -= 10;
    }

    // Check for proper async/await
    if (code.includes('.then(') && code.includes('async ')) {
      analysis.suggestions.push({
        type: 'readability',
        message: 'Consider using await instead of .then() for cleaner async code',
        impact: 'low',
      });
    }
  }

  private getLineNumber(code: string, substring: string): number {
    const index = code.indexOf(substring);
    if (index === -1) return 0;
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Generate personalized tutor response based on context
   */
  generateResponse(context: {
    challengeId: string;
    concept: string;
    attempts: number;
    timeSpent: number;
    lastError?: string;
    userLevel: number;
  }): TutorResponse {
    const analytics = getAnalytics();
    const weakConcepts = analytics.weakConcepts;

    // Determine tone based on attempts and time
    let tone: TutorResponse['tone'] = 'neutral';
    if (context.attempts === 0) {
      tone = 'encouraging';
    } else if (context.attempts >= 5) {
      tone = 'concerned';
    } else if (context.attempts === 1 && context.timeSpent < 60000) {
      tone = 'celebratory';
    }

    const response: TutorResponse = {
      message: '',
      tone,
      suggestions: [],
    };

    // Generate contextual message
    if (context.attempts === 0) {
      response.message = `Let's tackle this ${context.concept} challenge! Take your time and remember the fundamentals.`;
      response.suggestions.push('Read the challenge description carefully');
      response.suggestions.push('Start with the basic structure');
      response.suggestions.push("Don't worry about perfection on your first try");
    } else if (context.attempts <= 2) {
      response.message = `You're making progress! ${context.lastError ? "Let's work through this error together." : 'Keep refining your solution.'}`;

      if (context.lastError) {
        response.suggestions.push('Check the error message carefully');
        response.suggestions.push('Review the relevant syntax');
      }
      response.suggestions.push('Try using the hint system if you need guidance');
    } else if (context.attempts <= 5) {
      const challengeText = weakConcepts.includes(context.concept) 
        ? `${context.concept} has been challenging for you before.` 
        : '';
      response.message = `I can see you're working hard on this. ${challengeText} Let's break it down step by step.`;
      response.suggestions.push('Take a short break if you need to');
      response.suggestions.push("Review similar examples you've completed");
      response.suggestions.push('Use a hint to get unstuck');
    } else {
      response.message = `This is a tough one, but I believe in you! Sometimes stepping back helps. Would you like a more specific hint?`;
      response.suggestions.push('Review the concept fundamentals');
      response.suggestions.push('Look at the code example provided');
      response.suggestions.push('Consider skipping and returning to this later');

      // Provide code example for struggling users
      response.codeExample = this.getConceptExample(context.concept);
    }

    // Add resources
    response.resources = this.getRelevantResources(context.concept);

    return response;
  }

  private getConceptExample(concept: string): string {
    const examples: Record<string, string> = {
      HTML: `<!-- Basic HTML structure -->
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>This is a paragraph.</p>
  </body>
</html>`,

      CSS: `/* Basic CSS styling */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 20px;
}`,

      JavaScript: `// Basic JavaScript function
function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message);
  return message;
}

greet('Developer');`,
    };

    return examples[concept] || '';
  }

  private getRelevantResources(concept: string): TutorResponse['resources'] {
    const resources: Record<string, TutorResponse['resources']> = {
      HTML: [
        {
          title: 'MDN HTML Guide',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
          type: 'documentation',
        },
        {
          title: 'HTML Semantic Elements',
          url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantic_elements',
          type: 'tutorial',
        },
      ],
      CSS: [
        {
          title: 'MDN CSS Guide',
          url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
          type: 'documentation',
        },
        {
          title: 'CSS Flexbox Guide',
          url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
          type: 'tutorial',
        },
      ],
      JavaScript: [
        {
          title: 'MDN JavaScript Guide',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          type: 'documentation',
        },
        {
          title: 'JavaScript.info',
          url: 'https://javascript.info/',
          type: 'tutorial',
        },
      ],
    };

    return resources[concept] || [];
  }

  /**
   * Provide error-specific guidance
   */
  explainError(error: string, language: 'html' | 'css' | 'javascript'): string {
    const errorGuides: Record<string, string> = {
      'Unclosed tag': 'You have an HTML tag that is not properly closed. Every opening tag like <div> needs a closing tag like </div>.',
      'Unexpected token': 'There is a syntax error in your code. Check for missing or extra brackets, parentheses, or semicolons.',
      'Cannot read property': 'You are trying to access a property of something that is undefined or null. Make sure the variable exists before accessing it.',
      'is not defined': 'You are using a variable or function that has not been declared. Make sure to define it first.',
      'Missing semicolon': 'JavaScript statements should end with a semicolon. Add ; at the end of the statement.',
    };

    // Find matching error guide
    for (const [key, guide] of Object.entries(errorGuides)) {
      if (error.includes(key)) {
        return guide;
      }
    }

    return 'Check your syntax carefully. Look for typos, missing brackets, or incorrect formatting.';
  }
}

// Singleton instance
let tutorInstance: AITutorSystem | null = null;

export function getAITutor(): AITutorSystem {
  if (!tutorInstance) {
    tutorInstance = new AITutorSystem();
  }
  return tutorInstance;
}

// Convenience exports
export const analyzeCode = (code: string, language: 'html' | 'css' | 'javascript') =>
  getAITutor().analyzeCode(code, language);
export const generateTutorResponse = (context: Parameters<AITutorSystem['generateResponse']>[0]) =>
  getAITutor().generateResponse(context);
export const explainError = (error: string, language: 'html' | 'css' | 'javascript') =>
  getAITutor().explainError(error, language);
