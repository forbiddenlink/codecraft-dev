import { BASE_MAPPINGS } from '@/game/mapping/ElementMapping';

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  source: 'html' | 'css' | 'js';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface LineColumnInfo {
  line: number;
  column: number;
}

function findPositionInCode(code: string, searchText: string, startIndex = 0): LineColumnInfo {
  const lines = code.slice(0, startIndex + searchText.length).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].indexOf(searchText) + 1
  };
}

function getElementPosition(code: string, element: Element): LineColumnInfo {
  const elementString = element.outerHTML;
  const startIndex = code.indexOf(elementString);
  return findPositionInCode(code, elementString, startIndex);
}

export function validateHtml(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, 'text/html');

  // Check for parsing errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    const errorText = parseError.textContent || '';
    const errorMatch = errorText.match(/line (\d+)/i);
    const line = errorMatch ? parseInt(errorMatch[1]) : 1;
    
    errors.push({
      line,
      column: 1,
      message: 'HTML parsing error: ' + errorText.split('\n')[0],
      severity: 'error',
      source: 'html'
    });
    return { isValid: false, errors, warnings };
  }

  // Validate against allowed elements
  const allElements = doc.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    const tagName = element.tagName.toLowerCase();
    const position = getElementPosition(code, element);
    
    if (!BASE_MAPPINGS[tagName]) {
      warnings.push({
        ...position,
        message: `Unsupported element type: ${tagName}`,
        severity: 'warning',
        source: 'html'
      });
    }

    // Check for required attributes based on element type
    if (tagName === 'main' && !element.id) {
      warnings.push({
        ...position,
        message: 'Main element should have an ID for better structure',
        severity: 'warning',
        source: 'html'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateCss(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Create a style element to test CSS
    const style = document.createElement('style');
    style.textContent = code;
    document.head.appendChild(style);
    document.head.removeChild(style);

    // Parse CSS and check for unsupported properties
    const cssRules = code.match(/([^{}]+)(?=\{[^}]*\})/g) || [];
    cssRules.forEach(selector => {
      const ruleStart = code.indexOf(selector);
      const rulePosition = findPositionInCode(code, selector, ruleStart);
      
      const ruleBody = code.slice(
        code.indexOf('{', ruleStart) + 1,
        code.indexOf('}', ruleStart)
      );
      
      const properties = ruleBody.split(';');
      properties.forEach(prop => {
        const [key] = prop.split(':').map(p => p.trim());
        if (key && !isValidCssProperty(key)) {
          const propStart = code.indexOf(key, ruleStart);
          const propPosition = findPositionInCode(code, key, propStart);
          
          warnings.push({
            ...propPosition,
            message: `Unsupported CSS property: ${key}`,
            severity: 'warning',
            source: 'css'
          });
        }
      });
    });
  } catch (error) {
    const match = error.message.match(/line (\d+)/i);
    const line = match ? parseInt(match[1]) : 1;
    
    errors.push({
      line,
      column: 1,
      message: 'CSS parsing error: ' + error.message,
      severity: 'error',
      source: 'css'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateJs(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // Basic syntax check
    new Function(code);

    // Check for common issues
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('document.write')) {
        warnings.push({
          line: index + 1,
          column: line.indexOf('document.write') + 1,
          message: 'document.write is not recommended',
          severity: 'warning',
          source: 'js'
        });
      }

      if (line.includes('eval(')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('eval(') + 1,
          message: 'eval() is not allowed for security reasons',
          severity: 'error',
          source: 'js'
        });
      }
    });
  } catch (error) {
    // Try to extract line number from error message
    const match = error.message.match(/line (\d+)/i);
    const line = match ? parseInt(match[1]) : 1;
    
    errors.push({
      line,
      column: 1,
      message: 'JavaScript syntax error: ' + error.message,
      severity: 'error',
      source: 'js'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Helper function to check if a CSS property is supported
function isValidCssProperty(property: string): boolean {
  const tempElement = document.createElement('div');
  return property in tempElement.style;
} 