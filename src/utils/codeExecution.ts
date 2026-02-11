import { validateHtml, validateCss, validateJs, ValidationResult } from './codeValidation';
import { parseHtmlToGameObjects, GameObject } from './parseHtmlToGameObjects';
import { applyCSSToGameObject } from '@/game/mapping/ElementMapping';
import { BuildingTemplate } from '@/types/buildings';

export interface ExecutionResult {
  success: boolean;
  gameObjects: GameObject[];
  validationResults: {
    html: ValidationResult;
    css: ValidationResult;
    js: ValidationResult;
  };
  error?: string;
}

export interface CodeExecutionContext {
  html: string;
  css: string;
  js?: string;
  buildingTemplate?: BuildingTemplate;
}

export class CodeExecutionEngine {
  private sandbox: HTMLIFrameElement | null = null;

  constructor() {
    // Create a sandboxed environment for code execution
    if (typeof window !== 'undefined') {
      this.sandbox = document.createElement('iframe');
      this.sandbox.style.display = 'none';
      this.sandbox.sandbox.add('allow-scripts');
      document.body.appendChild(this.sandbox);
    }
  }

  public async execute(context: CodeExecutionContext): Promise<ExecutionResult> {
    try {
      // Validate all code first
      const validationResults = {
        html: validateHtml(context.html),
        css: validateCss(context.css),
        js: context.js ? validateJs(context.js) : { isValid: true, errors: [], warnings: [] }
      };

      // Check for validation errors
      if (!validationResults.html.isValid || !validationResults.css.isValid || !validationResults.js.isValid) {
        return {
          success: false,
          gameObjects: [],
          validationResults,
          error: 'Code validation failed. Check the validation results for details.'
        };
      }

      // Parse HTML into game objects
      const gameObjects = parseHtmlToGameObjects(context.html);

      // Apply CSS to game objects
      this.applyCssToGameObjects(gameObjects, context.css);

      // If there's JavaScript, execute it in the sandbox
      if (context.js) {
        await this.executeJavaScript(context.js, gameObjects);
      }

      // TODO: If this is for a building template, validate against template requirements
      // Commented out - requires BuildingTemplate to have requiredElements property
      // if (context.buildingTemplate) {
      //   this.validateAgainstTemplate(gameObjects, context.buildingTemplate);
      // }

      return {
        success: true,
        gameObjects,
        validationResults
      };
    } catch (error: any) {
      return {
        success: false,
        gameObjects: [],
        validationResults: {
          html: { isValid: false, errors: [], warnings: [] },
          css: { isValid: false, errors: [], warnings: [] },
          js: { isValid: false, errors: [], warnings: [] }
        },
        error: error?.message || 'Unknown error'
      };
    }
  }

  private applyCssToGameObjects(objects: GameObject[], css: string): void {
    // Create a style element to parse CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Apply CSS to each game object
    const applyToObject = (obj: GameObject) => {
      const element = document.createElement(obj.tag);
      
      // Apply classes and compute styles
      if (obj.className) {
        element.className = obj.className;
      }
      const computedStyle = window.getComputedStyle(element);

      // TODO: Convert CSS properties to game object properties
      // applyCSSToGameObject expects Object3D, not GameObject
      // Need to create a proper conversion layer
      // applyCSSToGameObject(obj, computedStyle);

      // Recursively apply to children
      if (obj.children) {
        obj.children.forEach(applyToObject);
      }
    };

    objects.forEach(applyToObject);
    document.head.removeChild(style);
  }

  private async executeJavaScript(code: string, gameObjects: GameObject[]): Promise<void> {
    if (!this.sandbox) return;

    return new Promise((resolve, reject) => {
      try {
        // Create a safe context for the code
        const context = {
          gameObjects,
          console: {
            log: console.log,
            warn: console.warn,
            error: console.error
          },
          setTimeout: setTimeout,
          clearTimeout: clearTimeout,
          // Add other safe APIs as needed
        };

        // Execute the code in the sandbox
        const wrappedCode = `
          try {
            with (context) {
              ${code}
            }
          } catch (error) {
            window.parent.postMessage({ type: 'error', message: error.message }, '*');
          }
        `;

        // Handle messages from the sandbox
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'error') {
            reject(new Error(event.data.message));
          }
        };

        window.addEventListener('message', handleMessage);

        // Execute the code
        const scriptContent = `(${wrappedCode})(${JSON.stringify(context)});`;
        const contentDoc = this.sandbox?.contentDocument;
        if (!contentDoc) {
          reject(new Error('Sandbox content document not available'));
          return;
        }

        const script = contentDoc.createElement('script');
        script.textContent = scriptContent;
        contentDoc.body.appendChild(script);

        // Clean up
        window.removeEventListener('message', handleMessage);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // TODO: Re-implement validation against building template requirements
  // Current BuildingTemplate type doesn't have requiredElements or size constraints
  // Also GameObject doesn't have properties field
  /*
  private validateAgainstTemplate(objects: GameObject[], template: BuildingTemplate): void {
    const requiredTags = new Set(template.requiredElements || []);
    const foundTags = new Set<string>();
    let maxWidth = 0;
    let maxHeight = 0;

    // Helper to recursively check objects and their children
    const checkObject = (obj: GameObject) => {
      foundTags.add(obj.tag);

      // Track size constraints
      if (obj.properties) {
        const width = obj.properties.width || 0;
        const height = obj.properties.height || 0;
        maxWidth = Math.max(maxWidth, width);
        maxHeight = Math.max(maxHeight, height);
      }

      // Check children recursively
      if (obj.children) {
        obj.children.forEach(checkObject);
      }
    };

    // Process all objects
    objects.forEach(checkObject);

    // Check for missing required elements
    const missingTags = Array.from(requiredTags).filter(tag => !foundTags.has(tag));
    if (missingTags.length > 0) {
      throw new Error(`Missing required elements: ${missingTags.join(', ')}`);
    }

    // Check size constraints
    if (template.maxWidth && maxWidth > template.maxWidth) {
      throw new Error(`Building exceeds maximum width of ${template.maxWidth}`);
    }
    if (template.maxHeight && maxHeight > template.maxHeight) {
      throw new Error(`Building exceeds maximum height of ${template.maxHeight}`);
    }

    // Check resource requirements
    if (template.resourceRequirements) {
      const resourceCost = this.calculateResourceCost(objects);
      for (const [resource, required] of Object.entries(template.resourceRequirements)) {
        if (!resourceCost[resource] || resourceCost[resource] < required) {
          throw new Error(`Insufficient ${resource}: requires ${required}, found ${resourceCost[resource] || 0}`);
        }
      }
    }
  }
  */

  // TODO: Re-implement resource cost calculation
  // GameObject doesn't have a properties field
  /*
  private calculateResourceCost(objects: GameObject[]): Record<string, number> {
    const costs: Record<string, number> = {};

    const addCosts = (obj: GameObject) => {
      if (obj.properties?.resourceCost) {
        for (const [resource, amount] of Object.entries(obj.properties.resourceCost)) {
          costs[resource] = (costs[resource] || 0) + amount;
        }
      }

      if (obj.children) {
        obj.children.forEach(addCosts);
      }
    };

    objects.forEach(addCosts);
    return costs;
  }
  */

  public destroy(): void {
    if (this.sandbox) {
      document.body.removeChild(this.sandbox);
      this.sandbox = null;
    }
  }
} 