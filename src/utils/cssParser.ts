interface GameStructureStyle {
  color?: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  opacity?: number;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  animation?: string;
  glow?: boolean;
  shadow?: boolean;
}

interface ParsedRule {
  selector: string;
  properties: GameStructureStyle;
}

interface HtmlNode {
  elementType: string;
  attributes?: {
    id?: string;
    class?: string;
    [key: string]: string | undefined;
  };
  children?: HtmlNode[];
  parent?: HtmlNode;
}

type CSSValue = string | number | boolean | number[];

/**
 * Convert CSS property values to game structure properties
 */
const convertCSSValue = (property: string, value: string): CSSValue => {
  // Handle numeric values with units
  if (value.endsWith('px') || value.endsWith('em') || value.endsWith('%')) {
    return parseFloat(value);
  }

  // Handle colors
  if (property.includes('color') || property === 'emissive') {
    return value;
  }

  // Handle transforms
  if (value.startsWith('rotate')) {
    const angles = value.match(/\d+/g)?.map(Number) || [0, 0, 0];
    return angles.map(angle => (angle * Math.PI) / 180);
  }

  if (value.startsWith('scale')) {
    const scale = value.match(/\d+(\.\d+)?/)?.[0] || '1';
    return parseFloat(scale);
  }

  // Handle boolean values
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    return JSON.parse(value);
  }

  return value;
};

/**
 * Parse a CSS rule string into a structured format
 */
export const parseCSSRule = (rule: string): ParsedRule | null => {
  try {
    const [selector, propertiesStr] = rule.split('{').map(str => str.trim());
    if (!selector || !propertiesStr) return null;

    const properties: GameStructureStyle = {};
    const propertyRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
    let match;

    while ((match = propertyRegex.exec(propertiesStr))) {
      const [, property, value] = match;
      const camelCaseProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase());
      properties[camelCaseProperty] = convertCSSValue(property, value.trim());
    }

    return {
      selector: selector.replace(/\s+/g, ' ').trim(),
      properties
    };
  } catch (error) {
    console.error('Error parsing CSS rule:', error);
    return null;
  }
};

/**
 * Check if a CSS selector matches an HTML node
 */
function selectorMatchesNode(selector: string, node: HtmlNode): boolean {
  selector = selector.trim();
  
  // Element selector
  if (selector === node.elementType) {
    return true;
  }
  
  // Class selector
  if (selector.startsWith('.') && node.attributes?.class) {
    const className = selector.substring(1);
    const classNames = node.attributes.class.split(' ');
    return classNames.includes(className);
  }
  
  // ID selector
  if (selector.startsWith('#') && node.attributes?.id) {
    const id = selector.substring(1);
    return node.attributes.id === id;
  }
  
  // Descendant selector
  if (selector.includes(' ')) {
    const [parentSelector, ...childSelectors] = selector.split(' ').reverse();
    let currentNode: HtmlNode | undefined = node;
    const currentSelector = parentSelector;
    
    // Check if the current node matches the most specific part of the selector
    if (!selectorMatchesNode(currentSelector, currentNode)) {
      return false;
    }
    
    // Check ancestor selectors
    for (const ancestorSelector of childSelectors) {
      currentNode = currentNode.parent;
      if (!currentNode) return false;
      
      if (!selectorMatchesNode(ancestorSelector, currentNode)) {
        return false;
      }
    }
    
    return true;
  }
  
  return false;
}

/**
 * Apply CSS rules to game structures
 */
export const applyStyles = (
  node: HtmlNode,
  cssRules: ParsedRule[]
): GameStructureStyle => {
  const styles: GameStructureStyle = {
    color: '#ffffff',
    scale: 1,
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    opacity: 1,
    metalness: 0.5,
    roughness: 0.5,
    wireframe: false,
    glow: false,
    shadow: true
  };

  // Apply rules in order of specificity
  for (const rule of cssRules) {
    if (selectorMatchesNode(rule.selector, node)) {
      Object.assign(styles, rule.properties);
    }
  }

  return styles;
};

/**
 * Convert game structure style to Three.js material properties
 */
export const styleToMaterialProps = (style: GameStructureStyle) => {
  return {
    color: style.color,
    emissive: style.glow ? style.emissive || style.color : '#000000',
    emissiveIntensity: style.glow ? 0.5 : 0,
    metalness: style.metalness,
    roughness: style.roughness,
    opacity: style.opacity,
    transparent: style.opacity < 1,
    wireframe: style.wireframe,
  };
};

/**
 * Convert game structure style to Three.js object properties
 */
export const styleToObjectProps = (style: GameStructureStyle) => {
  return {
    scale: typeof style.scale === 'number' ? [style.scale, style.scale, style.scale] : [1, 1, 1],
    rotation: style.rotation || [0, 0, 0],
    position: style.position || [0, 0, 0],
    castShadow: style.shadow,
    receiveShadow: style.shadow,
  };
}; 