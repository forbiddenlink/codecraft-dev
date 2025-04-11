/**
 * HTML Parsing Utility Functions
 * This module is responsible for parsing HTML into a structured format
 * that can be used to generate buildings in the game world
 */

export interface GameStructureNode {
  type: string;
  elementType: string;
  id?: string;
  classes: string[];
  content?: string;
  textContent?: string;
  children: GameStructureNode[];
  attributes: Record<string, string>;
  level: number;
  index: number;
  lineNumber?: number;
  styles?: {
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
  };
}

/**
 * Parse HTML attributes string into an object
 */
const parseAttributes = (attributesStr: string): Record<string, string> => {
  const attributes: Record<string, string> = {};
  const regex = /(\w+)(?:=["']([^"']*)["'])?/g;
  let match;

  while ((match = regex.exec(attributesStr))) {
    const [, name, value = ''] = match;
    attributes[name] = value;
  }

  return attributes;
};

/**
 * Extract classes from attributes and return both classes array and remaining attributes
 */
const extractClasses = (attributes: Record<string, string>): {
  classes: string[];
  remainingAttributes: Record<string, string>;
} => {
  const classes = (attributes.class || '').split(' ').filter(Boolean);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, ...remainingAttributes } = attributes;
  return { classes, remainingAttributes };
};

/**
 * Parse HTML string into a structured format using DOM parser
 */
export function parseHtmlToStructure(htmlString: string): GameStructureNode[] {
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Get the body content
    const body = doc.body;
    
    // Process the body's children
    const structure = Array.from(body.children).map((element, index) => 
      processElement(element as HTMLElement, index, 0)
    );
    
    // Add line numbers to the structure
    return addLineNumbers(structure, htmlString);
  } catch (error) {
    console.error('HTML parsing error:', error);
    // Fallback to regex-based parsing if DOM parser fails
    return parseHtmlToStructureLegacy(htmlString);
  }
}

/**
 * Process a single HTML element into a structured node
 */
function processElement(element: HTMLElement, index: number, level: number): GameStructureNode {
  // Extract attributes
  const attributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    attributes[attr.name] = attr.value;
  }
  
  const { classes, remainingAttributes } = extractClasses(attributes);
  
  // Extract text content directly contained in this element
  let textContent = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      textContent += node.textContent.trim() + ' ';
    }
  }
  textContent = textContent.trim();
  
  // Process child elements
  const children = Array.from(element.children).map((child, childIndex) => 
    processElement(child as HTMLElement, childIndex, level + 1)
  );
  
  // Create the node structure
  return {
    type: element.tagName.toLowerCase(),
    elementType: element.tagName.toLowerCase(),
    id: remainingAttributes.id,
    classes,
    content: textContent || undefined,
    textContent: textContent || undefined,
    children,
    attributes: remainingAttributes,
    level,
    index,
    styles: {}
  };
}

/**
 * Legacy regex-based HTML parsing (fallback method)
 */
function parseHtmlToStructureLegacy(html: string): GameStructureNode[] {
  // Remove comments and normalize whitespace
  const cleanHtml = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim();

  const stack: GameStructureNode[] = [];
  const root: GameStructureNode[] = [];
  let currentContent = '';

  let pos = 0;
  while (pos < cleanHtml.length) {
    // Find next tag
    const tagStart = cleanHtml.indexOf('<', pos);
    
    if (tagStart === -1) {
      // No more tags, just text content
      currentContent += cleanHtml.slice(pos).trim();
      break;
    }

    // Add any text content before the tag
    if (tagStart > pos) {
      currentContent += cleanHtml.slice(pos, tagStart).trim();
    }

    // Check if it's a closing tag
    if (cleanHtml[tagStart + 1] === '/') {
      const tagEnd = cleanHtml.indexOf('>', tagStart);
      const tagName = cleanHtml.slice(tagStart + 2, tagEnd).toLowerCase();
      
      // Find matching opening tag in stack
      const lastIndex = stack.length - 1;
      if (lastIndex >= 0 && stack[lastIndex].type === tagName) {
        const node = stack.pop()!;
        if (currentContent) {
          node.content = currentContent;
          node.textContent = currentContent;
          currentContent = '';
        }
        
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          root.push(node);
        }
      }
      
      pos = tagEnd + 1;
      continue;
    }

    // Parse opening tag
    const tagEnd = cleanHtml.indexOf('>', tagStart);
    if (tagEnd === -1) break;

    const tag = cleanHtml.slice(tagStart, tagEnd + 1);
    const match = tag.match(/<(\w+)([^>]*)>/);
    
    if (match) {
      const [, tagName, attributesStr] = match;
      const attributes = parseAttributes(attributesStr.trim());
      const { classes, remainingAttributes } = extractClasses(attributes);

      const node: GameStructureNode = {
        type: tagName.toLowerCase(),
        elementType: tagName.toLowerCase(),
        id: remainingAttributes.id,
        classes,
        children: [],
        attributes: remainingAttributes,
        level: stack.length,
        index: root.length + stack.length,
        styles: {}
      };

      if (tag.endsWith('/>') || ['img', 'input', 'br', 'hr'].includes(tagName)) {
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
        } else {
          root.push(node);
        }
      } else {
        stack.push(node);
      }
    }

    pos = tagEnd + 1;
  }

  // Add any remaining unclosed tags to root
  while (stack.length > 0) {
    root.push(stack.pop()!);
  }

  return addLineNumbers(root, html);
}

/**
 * Add line numbers to HTML structure based on original code
 */
export function addLineNumbers(structure: GameStructureNode[], htmlString: string): GameStructureNode[] {
  const lines = htmlString.split('\n');
  const tagLineMap: Record<string, number[]> = {};
  
  lines.forEach((line, index) => {
    const openTags = line.match(/<([a-zA-Z][a-zA-Z0-9-]*)(?:\s|>)/g);
    if (openTags) {
      openTags.forEach(tag => {
        const tagName = tag.slice(1).trim().replace(/[\s>]/g, '').toLowerCase();
        if (!tagLineMap[tagName]) {
          tagLineMap[tagName] = [];
        }
        tagLineMap[tagName].push(index + 1);
      });
    }
  });

  function assignLineNumbers(node: GameStructureNode): GameStructureNode {
    const tagName = node.type.toLowerCase();
    
    if (tagLineMap[tagName] && tagLineMap[tagName].length > 0) {
      node.lineNumber = tagLineMap[tagName].shift();
    }
    
    node.children = node.children.map(assignLineNumbers);
    return node;
  }

  return structure.map(assignLineNumbers);
}

/**
 * Find a node by line number in the HTML structure
 */
export function findNodeByLine(structure: GameStructureNode[], lineNumber: number): GameStructureNode | undefined {
  function searchNode(node: GameStructureNode): GameStructureNode | undefined {
    if (node.lineNumber === lineNumber) {
      return node;
    }
    
    for (const child of node.children) {
      const result = searchNode(child);
      if (result) return result;
    }
    
    return undefined;
  }
  
  for (const node of structure) {
    const result = searchNode(node);
    if (result) return result;
  }
  
  return undefined;
}

/**
 * Get a flattened array of all nodes in the structure
 */
export function getAllNodes(structure: GameStructureNode[]): GameStructureNode[] {
  const nodes: GameStructureNode[] = [];
  
  function traverse(node: GameStructureNode) {
    nodes.push(node);
    node.children.forEach(traverse);
  }
  
  structure.forEach(traverse);
  return nodes;
}

/**
 * Find a specific node in the structure by predicate
 */
export function findNode(
  structure: GameStructureNode[],
  predicate: (node: GameStructureNode) => boolean
): GameStructureNode | null {
  for (const node of getAllNodes(structure)) {
    if (predicate(node)) return node;
  }
  return null;
}

/**
 * Validate HTML structure against a template
 */
export const validateStructure = (
  structure: GameStructureNode[],
  template: string
): boolean => {
  const templateStructure = parseHtmlToStructure(template);
  
  const compareNodes = (
    actual: GameStructureNode[],
    expected: GameStructureNode[]
  ): boolean => {
    if (actual.length !== expected.length) return false;

    return actual.every((node, index) => {
      const templateNode = expected[index];
      
      // Check type match
      if (node.type !== templateNode.type) return false;

      // Check required classes
      if (templateNode.classes.some(cls => !node.classes.includes(cls))) {
        return false;
      }

      // Check required attributes
      for (const [key, value] of Object.entries(templateNode.attributes)) {
        if (node.attributes[key] !== value) return false;
      }

      // Recursively check children
      return compareNodes(node.children, templateNode.children);
    });
  };

  return compareNodes(structure, templateStructure);
}; 