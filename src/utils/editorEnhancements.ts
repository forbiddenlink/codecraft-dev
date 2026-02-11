/**
 * Code Editor Enhancements
 * Autocomplete, snippets, themes, and quality-of-life features
 */

import type * as Monaco from 'monaco-editor';

export interface CodeSnippet {
  prefix: string;
  body: string | string[];
  description: string;
  scope?: 'html' | 'css' | 'javascript';
}

export interface EditorTheme {
  name: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: {
    token: string;
    foreground?: string;
    background?: string;
    fontStyle?: string;
  }[];
  colors: {
    [key: string]: string;
  };
}

/**
 * HTML Code Snippets
 */
export const htmlSnippets: CodeSnippet[] = [
  {
    prefix: 'html5',
    body: [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>${1:Document}</title>',
      '</head>',
      '<body>',
      '  $0',
      '</body>',
      '</html>',
    ],
    description: 'HTML5 boilerplate',
    scope: 'html',
  },
  {
    prefix: 'div',
    body: '<div class="${1:container}">$0</div>',
    description: 'Div element with class',
    scope: 'html',
  },
  {
    prefix: 'section',
    body: ['<section class="${1:section}">', '  $0', '</section>'],
    description: 'Section element',
    scope: 'html',
  },
  {
    prefix: 'article',
    body: ['<article>', '  <h2>${1:Title}</h2>', '  <p>$0</p>', '</article>'],
    description: 'Article with heading and paragraph',
    scope: 'html',
  },
  {
    prefix: 'nav',
    body: [
      '<nav>',
      '  <ul>',
      '    <li><a href="${1:#}">${2:Link}</a></li>',
      '  </ul>',
      '</nav>',
    ],
    description: 'Navigation menu',
    scope: 'html',
  },
  {
    prefix: 'button',
    body: '<button type="${1:button}" class="${2:btn}">${3:Click me}</button>',
    description: 'Button element',
    scope: 'html',
  },
  {
    prefix: 'form',
    body: ['<form action="${1:#}" method="${2:post}">', '  $0', '</form>'],
    description: 'Form element',
    scope: 'html',
  },
  {
    prefix: 'input',
    body: '<input type="${1:text}" name="${2:name}" placeholder="${3:Enter text}">',
    description: 'Input element',
    scope: 'html',
  },
];

/**
 * CSS Code Snippets
 */
export const cssSnippets: CodeSnippet[] = [
  {
    prefix: 'flexcenter',
    body: [
      'display: flex;',
      'justify-content: center;',
      'align-items: center;',
    ],
    description: 'Flex center (both axes)',
    scope: 'css',
  },
  {
    prefix: 'grid',
    body: [
      'display: grid;',
      'grid-template-columns: repeat(${1:3}, 1fr);',
      'gap: ${2:1rem};',
    ],
    description: 'CSS Grid layout',
    scope: 'css',
  },
  {
    prefix: 'transition',
    body: 'transition: ${1:all} ${2:0.3s} ${3:ease};',
    description: 'CSS transition',
    scope: 'css',
  },
  {
    prefix: 'animation',
    body: [
      'animation: ${1:name} ${2:1s} ${3:ease} ${4:infinite};',
      '',
      '@keyframes ${1:name} {',
      '  0% { ${5:opacity: 0;} }',
      '  100% { ${6:opacity: 1;} }',
      '}',
    ],
    description: 'CSS animation with keyframes',
    scope: 'css',
  },
  {
    prefix: 'media',
    body: ['@media (min-width: ${1:768px}) {', '  $0', '}'],
    description: 'Media query',
    scope: 'css',
  },
  {
    prefix: 'gradient',
    body: 'background: linear-gradient(${1:to right}, ${2:#667eea}, ${3:#764ba2});',
    description: 'Linear gradient',
    scope: 'css',
  },
];

/**
 * JavaScript Code Snippets
 */
export const jsSnippets: CodeSnippet[] = [
  {
    prefix: 'func',
    body: ['function ${1:functionName}(${2:params}) {', '  $0', '}'],
    description: 'Function declaration',
    scope: 'javascript',
  },
  {
    prefix: 'arrow',
    body: ['const ${1:functionName} = (${2:params}) => {', '  $0', '};'],
    description: 'Arrow function',
    scope: 'javascript',
  },
  {
    prefix: 'foreach',
    body: ['${1:array}.forEach((${2:item}) => {', '  $0', '});'],
    description: 'forEach loop',
    scope: 'javascript',
  },
  {
    prefix: 'map',
    body: 'const ${1:newArray} = ${2:array}.map((${3:item}) => ${4:item});',
    description: 'Array map',
    scope: 'javascript',
  },
  {
    prefix: 'filter',
    body: 'const ${1:filtered} = ${2:array}.filter((${3:item}) => ${4:condition});',
    description: 'Array filter',
    scope: 'javascript',
  },
  {
    prefix: 'async',
    body: [
      'async function ${1:functionName}(${2:params}) {',
      '  try {',
      '    $0',
      '  } catch (error) {',
      '    console.error(error);',
      '  }',
      '}',
    ],
    description: 'Async function with try-catch',
    scope: 'javascript',
  },
  {
    prefix: 'fetch',
    body: [
      'fetch(${1:url})',
      '  .then(response => response.json())',
      '  .then(data => {',
      '    $0',
      '  })',
      '  .catch(error => console.error(error));',
    ],
    description: 'Fetch API call',
    scope: 'javascript',
  },
  {
    prefix: 'eventlistener',
    body: [
      '${1:element}.addEventListener(\'${2:click}\', (${3:event}) => {',
      '  $0',
      '});',
    ],
    description: 'Event listener',
    scope: 'javascript',
  },
];

/**
 * Custom Editor Themes
 */
export const editorThemes: Record<string, EditorTheme> = {
  codecraft: {
    name: 'codecraft',
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#2A2A2A',
      'editor.selectionBackground': '#264F78',
      'editorCursor.foreground': '#AEAFAD',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#C6C6C6',
    },
  },
  ocean: {
    name: 'ocean',
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4A9EAF', fontStyle: 'italic' },
      { token: 'keyword', foreground: '82AAFF' },
      { token: 'string', foreground: 'C3E88D' },
      { token: 'number', foreground: 'F78C6C' },
      { token: 'tag', foreground: '89DDFF' },
    ],
    colors: {
      'editor.background': '#0F111A',
      'editor.foreground': '#A6ACCD',
      'editor.lineHighlightBackground': '#1A1C2B',
      'editorCursor.foreground': '#FFCC00',
    },
  },
  light: {
    name: 'light',
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'keyword', foreground: '0000FF' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#F5F5F5',
    },
  },
};

/**
 * Setup Monaco Editor with enhancements
 */
export function setupMonacoEnhancements(
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor
): void {
  // Register custom themes
  Object.values(editorThemes).forEach((theme) => {
    monaco.editor.defineTheme(theme.name, theme as any);
  });

  // Setup autocomplete providers
  setupHTMLAutocomplete(monaco);
  setupCSSAutocomplete(monaco);
  setupJavaScriptAutocomplete(monaco);

  // Setup code actions (quick fixes)
  setupCodeActions(monaco);

  // Setup formatting
  setupFormatting(monaco, editor);

  // Setup keyboard shortcuts
  setupKeyboardShortcuts(editor);
}

function setupHTMLAutocomplete(monaco: typeof Monaco): void {
  monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: (model, position) => {
      const suggestions: Monaco.languages.CompletionItem[] = htmlSnippets.map((snippet) => ({
        label: snippet.prefix,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.description,
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        },
      }));

      return { suggestions };
    },
  });
}

function setupCSSAutocomplete(monaco: typeof Monaco): void {
  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model, position) => {
      const suggestions: Monaco.languages.CompletionItem[] = cssSnippets.map((snippet) => ({
        label: snippet.prefix,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.description,
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        },
      }));

      return { suggestions };
    },
  });
}

function setupJavaScriptAutocomplete(monaco: typeof Monaco): void {
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const suggestions: Monaco.languages.CompletionItem[] = jsSnippets.map((snippet) => ({
        label: snippet.prefix,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: snippet.description,
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column,
          endColumn: position.column,
        },
      }));

      return { suggestions };
    },
  });
}

function setupCodeActions(monaco: typeof Monaco): void {
  // Add quick fixes for common issues
  monaco.languages.registerCodeActionProvider('html', {
    provideCodeActions: (model, range, context) => {
      const actions: Monaco.languages.CodeAction[] = [];

      context.markers.forEach((marker) => {
        if (marker.message.includes('alt')) {
          actions.push({
            title: 'Add alt attribute',
            kind: 'quickfix',
            edit: {
              edits: [
                {
                  resource: model.uri,
                  textEdit: {
                    range: marker,
                    text: ' alt="description"',
                  },
                  versionId: undefined,
                },
              ],
            },
          });
        }
      });

      return { actions, dispose: () => {} };
    },
  });
}

function setupFormatting(
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor
): void {
  // Format on paste
  editor.onDidPaste(() => {
    editor.getAction('editor.action.formatDocument')?.run();
  });
}

function setupKeyboardShortcuts(editor: Monaco.editor.IStandaloneCodeEditor): void {
  // Ctrl+S to save (can trigger save callback)
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    // Trigger save event
    editor.trigger('keyboard', 'editor.action.formatDocument', null);
    console.log('Save triggered');
  });

  // Ctrl+/ for comment toggle
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
    editor.trigger('keyboard', 'editor.action.commentLine', null);
  });

  // Ctrl+D for duplicate line
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
    editor.trigger('keyboard', 'editor.action.copyLinesDownAction', null);
  });
}

/**
 * Get editor configuration based on user level
 */
export function getEditorConfig(userLevel: number): Monaco.editor.IStandaloneEditorConstructionOptions {
  const baseConfig: Monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: userLevel >= 5 },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: true,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    acceptSuggestionOnEnter: 'on',
  };

  // Beginners get more assistance
  if (userLevel < 3) {
    return {
      ...baseConfig,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      parameterHints: { enabled: true },
      hover: { enabled: true },
      folding: false,
    };
  }

  // Advanced users get full features
  return {
    ...baseConfig,
    folding: true,
    bracketPairColorization: { enabled: true },
  };
}

// Re-export monaco types
declare global {
  const monaco: typeof Monaco;
}
