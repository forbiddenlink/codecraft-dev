/**
 * Intelligent Code Hints and Autocomplete System
 * Provides context-aware suggestions and learning support
 */

export interface CodeHint {
  text: string;
  description: string;
  category: 'html' | 'css' | 'javascript' | 'attribute' | 'value';
  insertText: string;
  documentation?: string;
  example?: string;
  difficulty?: number; // 1-5
}

export interface ContextAnalysis {
  language: 'html' | 'css' | 'javascript';
  currentLine: string;
  cursorPosition: number;
  previousLines: string[];
  inTag?: boolean;
  tagName?: string;
  inAttribute?: boolean;
  attributeName?: string;
  inSelector?: boolean;
  inFunction?: boolean;
}

export class CodeHintsSystem {
  private htmlTags: CodeHint[] = [
    {
      text: 'header',
      description: 'Defines a header section for a document or section',
      category: 'html',
      insertText: '<header>\n  \n</header>',
      documentation: 'The <header> element represents introductory content, typically containing heading elements, logos, or navigation.',
      example: '<header>\n  <h1>My Website</h1>\n  <nav>...</nav>\n</header>',
      difficulty: 1
    },
    {
      text: 'nav',
      description: 'Defines a navigation section',
      category: 'html',
      insertText: '<nav>\n  <ul>\n    <li><a href="#">Home</a></li>\n  </ul>\n</nav>',
      documentation: 'The <nav> element defines a set of navigation links.',
      example: '<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
      difficulty: 1
    },
    {
      text: 'section',
      description: 'Defines a thematic grouping of content',
      category: 'html',
      insertText: '<section>\n  <h2>Section Title</h2>\n  <p>Content here...</p>\n</section>',
      documentation: 'The <section> element represents a standalone section of content.',
      difficulty: 1
    },
    {
      text: 'article',
      description: 'Defines independent, self-contained content',
      category: 'html',
      insertText: '<article>\n  <h2>Article Title</h2>\n  <p>Article content...</p>\n</article>',
      documentation: 'The <article> element represents a self-contained composition that could be distributed independently.',
      difficulty: 2
    },
    {
      text: 'div',
      description: 'Defines a division or section (generic container)',
      category: 'html',
      insertText: '<div class="">\n  \n</div>',
      documentation: 'The <div> element is a generic container for flow content.',
      difficulty: 1
    },
    {
      text: 'button',
      description: 'Defines a clickable button',
      category: 'html',
      insertText: '<button onclick="">Click me</button>',
      documentation: 'The <button> element represents a clickable button.',
      example: '<button onclick="alert(\'Hello!\')">Click me</button>',
      difficulty: 2
    }
  ];

  private cssProperties: CodeHint[] = [
    {
      text: 'display',
      description: 'Specifies the display behavior of an element',
      category: 'css',
      insertText: 'display: flex;',
      documentation: 'The display property sets whether an element is treated as a block or inline element.',
      example: 'display: flex; /* or block, inline, grid, none */',
      difficulty: 1
    },
    {
      text: 'flex',
      description: 'Shorthand for flex-grow, flex-shrink, and flex-basis',
      category: 'css',
      insertText: 'flex: 1;',
      documentation: 'The flex property sets how a flex item will grow or shrink.',
      example: 'flex: 1; /* Grow to fill available space */',
      difficulty: 2
    },
    {
      text: 'grid-template-columns',
      description: 'Defines the columns of a grid container',
      category: 'css',
      insertText: 'grid-template-columns: repeat(3, 1fr);',
      documentation: 'Defines the line names and track sizing functions of the grid columns.',
      example: 'grid-template-columns: 1fr 2fr 1fr; /* Three columns */',
      difficulty: 3
    },
    {
      text: 'background-color',
      description: 'Sets the background color of an element',
      category: 'css',
      insertText: 'background-color: #3b82f6;',
      documentation: 'Sets the background color of an element.',
      example: 'background-color: #3b82f6; /* Blue color */',
      difficulty: 1
    },
    {
      text: 'padding',
      description: 'Sets the padding area on all four sides',
      category: 'css',
      insertText: 'padding: 20px;',
      documentation: 'The padding property creates space around an element\'s content, inside any defined borders.',
      example: 'padding: 20px; /* All sides */\npadding: 10px 20px; /* Top/bottom, Left/right */',
      difficulty: 1
    },
    {
      text: 'margin',
      description: 'Sets the margin area on all four sides',
      category: 'css',
      insertText: 'margin: 20px;',
      documentation: 'The margin property creates space around an element, outside any defined borders.',
      example: 'margin: 20px auto; /* Top/bottom 20px, Left/right auto (center) */',
      difficulty: 1
    },
    {
      text: 'animation',
      description: 'Shorthand for animation properties',
      category: 'css',
      insertText: 'animation: slideIn 1s ease-in-out;',
      documentation: 'The animation property applies an animation between styles.',
      example: '@keyframes slideIn {\n  from { transform: translateX(-100%); }\n  to { transform: translateX(0); }\n}\n\nanimation: slideIn 1s ease-in-out;',
      difficulty: 4
    }
  ];

  private jsFunctions: CodeHint[] = [
    {
      text: 'getElementById',
      description: 'Returns an element by its ID',
      category: 'javascript',
      insertText: 'document.getElementById(\'id\')',
      documentation: 'Returns a reference to the element by its ID.',
      example: 'const element = document.getElementById(\'myElement\');',
      difficulty: 1
    },
    {
      text: 'querySelector',
      description: 'Returns the first element that matches a CSS selector',
      category: 'javascript',
      insertText: 'document.querySelector(\'.class\')',
      documentation: 'Returns the first Element that matches the specified CSS selector.',
      example: 'const element = document.querySelector(\'.my-class\');',
      difficulty: 2
    },
    {
      text: 'addEventListener',
      description: 'Attaches an event handler to an element',
      category: 'javascript',
      insertText: 'element.addEventListener(\'click\', function() {\n  // Your code here\n});',
      documentation: 'Sets up a function to be called whenever the specified event is delivered to the target.',
      example: 'button.addEventListener(\'click\', () => {\n  alert(\'Button clicked!\');\n});',
      difficulty: 2
    },
    {
      text: 'function',
      description: 'Declares a function',
      category: 'javascript',
      insertText: 'function functionName() {\n  // Your code here\n}',
      documentation: 'Functions are one of the fundamental building blocks in JavaScript.',
      example: 'function greet(name) {\n  return `Hello, ${name}!`;\n}',
      difficulty: 1
    },
    {
      text: 'for',
      description: 'Creates a loop',
      category: 'javascript',
      insertText: 'for (let i = 0; i < 10; i++) {\n  // Your code here\n}',
      documentation: 'The for statement creates a loop with three optional expressions.',
      example: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}',
      difficulty: 2
    },
    {
      text: 'if',
      description: 'Conditional statement',
      category: 'javascript',
      insertText: 'if (condition) {\n  // Your code here\n}',
      documentation: 'The if statement executes a statement if a specified condition is truthy.',
      example: 'if (score > 90) {\n  console.log(\'Excellent!\');\n}',
      difficulty: 1
    }
  ];

  private htmlAttributes: CodeHint[] = [
    {
      text: 'class',
      description: 'Specifies one or more class names for an element',
      category: 'attribute',
      insertText: 'class=""',
      documentation: 'The class attribute specifies one or more class names for an element.',
      difficulty: 1
    },
    {
      text: 'id',
      description: 'Specifies a unique id for an element',
      category: 'attribute',
      insertText: 'id=""',
      documentation: 'The id attribute specifies a unique id for an HTML element.',
      difficulty: 1
    },
    {
      text: 'onclick',
      description: 'Script to run when element is clicked',
      category: 'attribute',
      insertText: 'onclick=""',
      documentation: 'The onclick attribute fires when the user clicks on an element.',
      difficulty: 2
    },
    {
      text: 'style',
      description: 'Inline CSS styles',
      category: 'attribute',
      insertText: 'style=""',
      documentation: 'The style attribute specifies an inline style for an element.',
      difficulty: 2
    }
  ];

  /**
   * Analyze code context to provide relevant hints
   */
  analyzeContext(code: string, cursorPosition: number): ContextAnalysis {
    const lines = code.substring(0, cursorPosition).split('\n');
    const currentLine = lines[lines.length - 1];
    const previousLines = lines.slice(0, -1);

    // Detect language
    let language: 'html' | 'css' | 'javascript' = 'html';
    if (code.includes('<style>') || currentLine.includes('{')) {
      language = 'css';
    } else if (code.includes('<script>') || currentLine.includes('function')) {
      language = 'javascript';
    }

    // Detect if inside a tag
    const inTag = currentLine.includes('<') && !currentLine.includes('>');
    const tagMatch = currentLine.match(/<(\w+)/);
    const tagName = tagMatch ? tagMatch[1] : undefined;

    // Detect if in attribute
    const inAttribute = inTag && currentLine.includes(' ');
    const attrMatch = currentLine.match(/\s(\w+)="?$/);
    const attributeName = attrMatch ? attrMatch[1] : undefined;

    return {
      language,
      currentLine,
      cursorPosition,
      previousLines,
      inTag,
      tagName,
      inAttribute,
      attributeName
    };
  }

  /**
   * Get relevant hints based on context
   */
  getHints(context: ContextAnalysis, userLevel: number = 1): CodeHint[] {
    let hints: CodeHint[] = [];

    if (context.language === 'html') {
      if (context.inAttribute) {
        // Suggest attributes
        hints = this.htmlAttributes.filter(h => 
          h.difficulty! <= userLevel + 1
        );
      } else if (context.inTag) {
        // Already in a tag, suggest attributes
        hints = this.htmlAttributes;
      } else {
        // Suggest HTML tags
        hints = this.htmlTags.filter(h => 
          h.difficulty! <= userLevel + 1
        );
      }
    } else if (context.language === 'css') {
      // Suggest CSS properties
      hints = this.cssProperties.filter(h => 
        h.difficulty! <= userLevel + 1
      );
    } else if (context.language === 'javascript') {
      // Suggest JavaScript functions and keywords
      hints = this.jsFunctions.filter(h => 
        h.difficulty! <= userLevel + 1
      );
    }

    // Filter by current input
    const currentWord = this.getCurrentWord(context.currentLine, context.cursorPosition);
    if (currentWord) {
      hints = hints.filter(h => 
        h.text.toLowerCase().startsWith(currentWord.toLowerCase())
      );
    }

    return hints.slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Get current word being typed
   */
  private getCurrentWord(line: string, position: number): string {
    const beforeCursor = line.substring(0, position);
    const match = beforeCursor.match(/[\w-]+$/);
    return match ? match[0] : '';
  }

  /**
   * Get smart suggestions based on challenge context
   */
  getChallengeHints(challengeId: string, context: ContextAnalysis): CodeHint[] {
    // Challenge-specific hints
    const challengeHints: Record<string, CodeHint[]> = {
      'awakening-1': [
        {
          text: 'header',
          description: 'Start with a header element',
          category: 'html',
          insertText: '<header>\n  <h1>Colony Name</h1>\n</header>',
          documentation: 'The header element is perfect for your communication beacon!',
          difficulty: 1
        }
      ],
      'awakening-2': [
        {
          text: 'section',
          description: 'Create a section for living quarters',
          category: 'html',
          insertText: '<section>\n  <p>Living quarters description</p>\n</section>',
          documentation: 'Sections help organize your colony structure.',
          difficulty: 1
        }
      ],
      'discovery-1': [
        {
          text: 'background-color',
          description: 'Add color to activate the ruins',
          category: 'css',
          insertText: 'background-color: #1e293b;',
          documentation: 'Colors bring the ancient ruins to life!',
          difficulty: 1
        }
      ]
    };

    return challengeHints[challengeId] || this.getHints(context);
  }

  /**
   * Get error-specific hints
   */
  getErrorHints(error: string): CodeHint[] {
    const errorHints: CodeHint[] = [];

    if (error.includes('closing tag')) {
      errorHints.push({
        text: 'Closing Tag',
        description: 'Every opening tag needs a closing tag',
        category: 'html',
        insertText: '</tagname>',
        documentation: 'HTML elements must be properly closed. For example: <div>content</div>',
        example: '<header>\n  <h1>Title</h1>\n</header> <!-- Don\'t forget to close! -->',
        difficulty: 1
      });
    }

    if (error.includes('semicolon')) {
      errorHints.push({
        text: 'Semicolon',
        description: 'CSS properties need semicolons',
        category: 'css',
        insertText: ';',
        documentation: 'Every CSS declaration should end with a semicolon.',
        example: 'color: blue; /* Semicolon here! */',
        difficulty: 1
      });
    }

    return errorHints;
  }

  /**
   * Get learning resources for a concept
   */
  getLearningResource(concept: string): {
    title: string;
    description: string;
    examples: string[];
    tips: string[];
  } | null {
    const resources: Record<string, any> = {
      'flexbox': {
        title: 'CSS Flexbox',
        description: 'Flexbox is a one-dimensional layout method for arranging items in rows or columns.',
        examples: [
          'display: flex; /* Enable flexbox */',
          'justify-content: space-between; /* Distribute items */',
          'align-items: center; /* Center vertically */'
        ],
        tips: [
          'Use flexbox for one-dimensional layouts (row or column)',
          'justify-content controls horizontal spacing',
          'align-items controls vertical alignment'
        ]
      },
      'grid': {
        title: 'CSS Grid',
        description: 'Grid is a two-dimensional layout system for creating complex layouts.',
        examples: [
          'display: grid; /* Enable grid */',
          'grid-template-columns: repeat(3, 1fr); /* 3 equal columns */',
          'gap: 20px; /* Space between items */'
        ],
        tips: [
          'Use grid for two-dimensional layouts',
          '1fr means "one fraction of available space"',
          'gap adds space between grid items'
        ]
      }
    };

    return resources[concept.toLowerCase()] || null;
  }
}

// Export singleton instance
export const codeHintsSystem = new CodeHintsSystem();

// React hook for code hints
import { useState, useEffect } from 'react';

export function useCodeHints(
  code: string,
  cursorPosition: number,
  userLevel: number = 1
) {
  const [hints, setHints] = useState<CodeHint[]>([]);
  const [context, setContext] = useState<ContextAnalysis | null>(null);

  useEffect(() => {
    const ctx = codeHintsSystem.analyzeContext(code, cursorPosition);
    setContext(ctx);
    
    const relevantHints = codeHintsSystem.getHints(ctx, userLevel);
    setHints(relevantHints);
  }, [code, cursorPosition, userLevel]);

  return { hints, context };
}

