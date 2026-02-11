import { parseHtmlToStructure, GameStructureNode } from '@/utils/htmlParser';
import { applyStyles, parseCSSRule } from '@/utils/cssParser';
import { validateHtml, validateCss, validateJs } from '@/utils/codeValidation';
import { BuildingEffect } from '@/data/buildingTemplates';
import { v4 as uuidv4 } from 'uuid';
import { store } from '@/store/store';
import { updateHtmlStructure } from '@/store/slices/gameSlice';
import { placeBuilding } from '@/store/slices/buildingSlice';
import { addGenerator } from '@/store/slices/resourceSlice';

export type ResourceType = 'energy' | 'minerals' | 'water' | 'food';

// Structure for 3D position
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// Base game styles from GameStructureNode
interface GameStyles {
  color?: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  opacity?: number;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  glow?: boolean;
  shadow?: boolean;
}

// Structure for CSS styles
export interface ExtendedStyles extends GameStyles {
  // Layout styles
  display?: string;
  visibility?: string;
  left?: string | number;
  top?: string | number;
  zIndex?: string | number;
  width?: string | number;
  height?: string | number;
  depth?: string | number;
  transform?: string;
  flexDirection?: string;
  [key: string]: string | number | boolean | [number, number, number] | undefined;
}

// Structure for building object derived from HTML
export interface BuildingLayout {
  id: string;
  type: string;
  templateId: string;
  position: Position3D;
  rotation: number;
  scale: [number, number, number];
  nodeReference: string;
  effects: BuildingEffect[];
  properties: Record<string, string | number | boolean>;
}

// Extended GameStructureNode with additional properties
export interface ExtendedGameStructureNode extends Omit<GameStructureNode, 'styles' | 'children'> {
  parent?: ExtendedGameStructureNode;
  children: ExtendedGameStructureNode[];
  styles?: ExtendedStyles;
}

export class CodeToGamePipeline {
  /**
   * Process code from editor into game elements
   */
  processCode(html: string, css: string, js?: string) {
    // 1. Validate each code type
    const htmlValidation = validateHtml(html);
    const cssValidation = validateCss(css);
    const jsValidation = js ? validateJs(js) : { isValid: true, errors: [], warnings: [] };

    // Check if code is valid before proceeding
    if (!htmlValidation.isValid || !cssValidation.isValid || !jsValidation.isValid) {
      return {
        success: false,
        htmlStructure: [],
        buildings: [],
        behaviors: {},
        errors: [
          ...htmlValidation.errors,
          ...cssValidation.errors,
          ...(jsValidation.errors || [])
        ],
        warnings: [
          ...htmlValidation.warnings,
          ...cssValidation.warnings,
          ...(jsValidation.warnings || [])
        ]
      };
    }

    // 2. Parse HTML
    const htmlStructure = parseHtmlToStructure(html) as ExtendedGameStructureNode[];
    
    // 3. Parse CSS and apply styles
    const parsedCss = parseCSSRule(css);
    const styledStructure = this.applyStylesToStructure(htmlStructure, parsedCss);
    
    // 4. Convert to building layouts
    const buildings = this.generateBuildings(styledStructure);
    
    // 5. If there's JavaScript, apply behaviors
    let behaviors = {};
    if (js) {
      behaviors = this.processBehaviors(js);
    }
    
    // 6. Update game state
    this.updateGameState(styledStructure, buildings);
    
    return {
      success: true,
      htmlStructure: styledStructure,
      buildings,
      behaviors,
      errors: [],
      warnings: [
        ...htmlValidation.warnings,
        ...cssValidation.warnings,
        ...(jsValidation.warnings || [])
      ]
    };
  }

  /**
   * Apply CSS rules to HTML structure nodes
   */
  private applyStylesToStructure(
    htmlNodes: ExtendedGameStructureNode[], 
    cssRules: ReturnType<typeof parseCSSRule>
  ): ExtendedGameStructureNode[] {
    return htmlNodes.map(node => {
      // Apply CSS to this node
      const styledNode = { ...node };
      if (cssRules) {
        Object.assign(styledNode, applyStyles(node, [cssRules].filter(Boolean)));
      }
      
      // Recursively apply to children if any
      if (node.children && node.children.length > 0) {
        styledNode.children = this.applyStylesToStructure(node.children, cssRules);
      }
      
      return styledNode;
    });
  }

  /**
   * Generate building layouts from HTML structure
   */
  private generateBuildings(styledStructure: ExtendedGameStructureNode[]): BuildingLayout[] {
    const buildings: BuildingLayout[] = [];
    
    // Process structure nodes into buildings
    const processNode = (node: ExtendedGameStructureNode, depth: number, index: number, parentPosition?: Position3D) => {
      // Skip non-visible elements or ones with display: none
      if (node.styles?.display === 'none' || node.styles?.visibility === 'hidden') {
        return;
      }
      
      // Determine node type and map to template
      const templateId = this.mapNodeToTemplate(node.elementType);
      if (!templateId) {
        return; // Skip if no matching template
      }
      
      // Calculate position based on parent and layout
      const position = this.calculatePosition(node, depth, index, parentPosition);
      
      // Calculate scale based on CSS properties
      const scale = this.calculateScale(node);
      
      // Calculate rotation based on CSS transform
      const rotation = this.calculateRotation(node);
      
      // Generate effects based on element properties
      const effects = this.generateEffects(node);
      
      // Create building layout
      const building: BuildingLayout = {
        id: uuidv4(),
        type: node.elementType,
        templateId,
        position,
        rotation,
        scale,
        nodeReference: this.generateNodeReference(node),
        effects,
        properties: {
          textContent: node.textContent || '',
          className: node.classes.join(' '),
          ...node.attributes
        }
      };
      
      buildings.push(building);
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, childIndex) => {
          processNode(child, depth + 1, childIndex, position);
        });
      }
    };
    
    // Process all root nodes
    styledStructure.forEach((node, index) => {
      processNode(node, 0, index);
    });
    
    return buildings;
  }

  /**
   * Map HTML element type to building template ID
   */
  private mapNodeToTemplate(elementType: string): string {
    // Mapping of HTML elements to building templates
    const elementMapping: Record<string, string> = {
      'div': 'basic-structure',
      'section': 'section-block',
      'article': 'research-module',
      'header': 'header-structure',
      'footer': 'footer-structure',
      'nav': 'connection-corridor',
      'main': 'command-center',
      'habitat': 'habitat-module',
      'generator': 'energy-generator',
      'greenhouse': 'greenhouse-module',
      'laboratory': 'laboratory-module',
      'storage': 'storage-vault',
      'dock': 'nav-corridor'
    };
    
    return elementMapping[elementType.toLowerCase()] || 'basic-structure';
  }

  /**
   * Calculate position for a node in 3D space
   */
  private calculatePosition(
    node: ExtendedGameStructureNode, 
    depth: number, 
    index: number, 
    parentPosition?: Position3D
  ): Position3D {
    // Base position if no parent
    if (!parentPosition) {
      return { x: index * 5 - 10, y: 0, z: 0 };
    }
    
    // Get position from styles if present
    if (node.styles?.position) {
      const x = parseFloat(String(node.styles.left || 0));
      const y = parseFloat(String(node.styles.top || 0));
      const z = parseFloat(String(node.styles?.zIndex || 0));
      
      return {
        x: parentPosition.x + x / 10, // Scale down CSS pixels
        y: parentPosition.y + y / 10,
        z: parentPosition.z + z / 10
      };
    }
    
    // Default layout based on document flow
    let layoutX = parentPosition.x;
    let layoutY = parentPosition.y;
    const layoutZ = parentPosition.z;
    
    // Apply different layout rules based on parent's display property
    if (node.parent?.styles?.display === 'flex') {
      // Handle flex layout
      const flexDirection = node.parent?.styles?.flexDirection || 'row';
      
      if (flexDirection === 'row') {
        layoutX += index * 3; // Space horizontally
      } else if (flexDirection === 'column') {
        layoutY += index * 3; // Space vertically
      }
    } else {
      // Default block layout
      layoutY += depth * 2;
      layoutX += index * 3;
    }
    
    return { x: layoutX, y: layoutY, z: layoutZ };
  }

  /**
   * Calculate scale based on element dimensions
   */
  private calculateScale(node: ExtendedGameStructureNode): [number, number, number] {
    // Default scale
    const defaultScale: [number, number, number] = [1, 1, 1];
    
    // Get dimensions from styles
    const width = this.parseDimension(node.styles?.width);
    const height = this.parseDimension(node.styles?.height);
    const depth = this.parseDimension(node.styles?.depth);
    
    // Apply scale transform if present
    if (node.styles?.transform?.includes('scale')) {
      const scaleMatch = String(node.styles.transform).match(/scale\(([^)]+)\)/);
      if (scaleMatch && scaleMatch[1]) {
        const scaleValues = scaleMatch[1].split(',').map(parseFloat);
        if (scaleValues.length === 1) {
          // Uniform scale
          return [scaleValues[0], scaleValues[0], scaleValues[0]];
        } else if (scaleValues.length >= 2) {
          // Non-uniform scale
          return [
            scaleValues[0], 
            scaleValues[1], 
            scaleValues.length > 2 ? scaleValues[2] : 1
          ];
        }
      }
    }
    
    // Scale based on dimensions
    return [
      width ? width / 100 : defaultScale[0],
      height ? height / 100 : defaultScale[1],
      depth ? depth / 100 : defaultScale[2]
    ];
  }

  /**
   * Calculate rotation based on CSS transform
   */
  private calculateRotation(node: ExtendedGameStructureNode): number {
    // Default rotation
    let rotation = 0;
    
    // Check for rotate transform
    if (node.styles?.transform?.includes('rotate')) {
      const rotateMatch = String(node.styles.transform).match(/rotate\(([^)]+)deg\)/);
      if (rotateMatch && rotateMatch[1]) {
        // Convert degrees to radians
        rotation = (parseFloat(rotateMatch[1]) * Math.PI) / 180;
      }
    }
    
    return rotation;
  }

  /**
   * Generate effects based on element properties and styles
   */
  private generateEffects(node: ExtendedGameStructureNode): BuildingEffect[] {
    const effects: BuildingEffect[] = [];
    
    // Generate resource production effect for generator elements
    if (node.elementType.toLowerCase() === 'generator') {
      // Check for energy level custom property
      const energyLevel = this.parseCustomProperty(node, '--energy-level', 50);
      effects.push({
        type: 'resource',
        target: 'energy',
        value: energyLevel / 10 // Scale down to reasonable production
      });
    }
    
    // Generate food production for greenhouse elements
    if (node.elementType.toLowerCase() === 'greenhouse') {
      effects.push({
        type: 'resource',
        target: 'food',
        value: 8
      });
      
      // Greenhouses consume water
      effects.push({
        type: 'resource',
        target: 'water',
        value: -3 // Negative value for consumption
      });
    }
    
    // Generate research for laboratory elements
    if (node.elementType.toLowerCase() === 'laboratory') {
      effects.push({
        type: 'resource',
        target: 'research',
        value: 5
      });
    }
    
    // Generate efficiency effects for containers with display:flex
    if (node.styles?.display === 'flex') {
      effects.push({
        type: 'efficiency',
        target: 'energy',
        value: 0.1
      });
    }
    
    return effects;
  }

  /**
   * Parse JavaScript to extract behaviors
   */
  private processBehaviors(js: string) {
    // Simple processing for now - extract event handlers
    const eventHandlers: Record<string, string> = {};
    
    // Look for addEventListener calls
    const eventRegex = /addEventListener\(\s*['"](\w+)['"]\s*,\s*function/g;
    let match;
    while ((match = eventRegex.exec(js)) !== null) {
      const eventType = match[1];
      eventHandlers[eventType] = 'function exists';
    }
    
    return {
      eventHandlers
    };
  }

  /**
   * Update game state with processed structures and buildings
   */
  private updateGameState(styledStructure: ExtendedGameStructureNode[], buildings: BuildingLayout[]) {
    // Convert ExtendedGameStructureNode to GameStructureNode
    const convertedStructure: GameStructureNode[] = styledStructure.map(node => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { parent, ...nodeWithoutParent } = node;
      return {
        ...nodeWithoutParent,
        styles: {
          color: node.styles?.color,
          scale: node.styles?.scale,
          rotation: node.styles?.rotation,
          position: node.styles?.position,
          opacity: node.styles?.opacity,
          emissive: node.styles?.emissive,
          metalness: node.styles?.metalness,
          roughness: node.styles?.roughness,
          wireframe: node.styles?.wireframe,
          glow: node.styles?.glow,
          shadow: node.styles?.shadow
        },
        children: node.children.map(child => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { parent, ...childWithoutParent } = child;
          const gameChild: GameStructureNode = {
            ...childWithoutParent,
            styles: {
              color: child.styles?.color,
              scale: child.styles?.scale,
              rotation: child.styles?.rotation,
              position: child.styles?.position,
              opacity: child.styles?.opacity,
              emissive: child.styles?.emissive,
              metalness: child.styles?.metalness,
              roughness: child.styles?.roughness,
              wireframe: child.styles?.wireframe,
              glow: child.styles?.glow,
              shadow: child.styles?.shadow
            },
            children: []
          };
          return gameChild;
        })
      };
    });

    // Update HTML structure in game state
    store.dispatch(updateHtmlStructure(convertedStructure));
    
    // Place buildings in world
    buildings.forEach(building => {
      store.dispatch(placeBuilding({
        templateId: building.templateId,
        position: building.position,
        rotation: building.rotation,
        effects: building.effects
      }));
      
      // Add resource generators for buildings with resource production
      const resourceEffects = building.effects.filter(effect => 
        effect.type === 'resource' && effect.value > 0 &&
        ['energy', 'minerals', 'water', 'food'].includes(effect.target)
      );
      
      if (resourceEffects.length > 0) {
        store.dispatch(addGenerator({
          id: uuidv4(),
          type: building.type,
          position: [building.position.x, building.position.y, building.position.z],
          rotation: [0, building.rotation, 0],
          outputRate: resourceEffects[0].value,
          resourceType: resourceEffects[0].target as ResourceType,
          status: 'active',
          efficiency: 1,
          lastCollection: Date.now()
        }));
      }
    });
  }
  
  /**
   * Generate a unique reference for a node
   */
  private generateNodeReference(node: ExtendedGameStructureNode): string {
    const idPart = node.attributes?.id ? `#${node.attributes.id}` : '';
    const classPart = node.classes.length > 0 ? `.${node.classes.join('.')}` : '';
    const linePart = node.lineNumber ? `:${node.lineNumber}` : '';
    
    return `${node.elementType}${idPart}${classPart}${linePart}`;
  }
  
  /**
   * Helper to parse CSS dimension values
   */
  private parseDimension(value: string | number | undefined): number | undefined {
    if (!value) return undefined;
    
    const valueStr = String(value);
    
    // Handle percentage
    if (valueStr.endsWith('%')) {
      return parseFloat(valueStr) * 2; // Scale percentage values
    }
    
    // Handle pixels
    if (valueStr.endsWith('px')) {
      return parseFloat(valueStr) / 50; // Scale down pixel values
    }
    
    // Handle em/rem
    if (valueStr.endsWith('em') || valueStr.endsWith('rem')) {
      return parseFloat(valueStr) * 2; // Scale em values
    }
    
    // Try to parse as raw number
    const num = parseFloat(valueStr);
    return isNaN(num) ? undefined : num;
  }
  
  /**
   * Parse custom CSS property with default value
   */
  private parseCustomProperty(node: ExtendedGameStructureNode, property: string, defaultValue: number): number {
    const value = node.styles?.[property];
    if (typeof value !== 'string' && typeof value !== 'number') return defaultValue;
    
    const num = parseFloat(String(value));
    return isNaN(num) ? defaultValue : num;
  }
}

// Export singleton instance
export const codeProcessor = new CodeToGamePipeline(); 