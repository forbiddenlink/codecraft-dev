/**
 * HTML Structure Utilities
 * Helper functions for working with HTML structure in the game
 */

/**
 * Represents a node in the HTML structure
 */
export interface HtmlNode {
  elementType: string;
  lineNumber: number;
  attributes?: {
    class?: string;
    [key: string]: string | undefined;
  };
  children?: HtmlNode[];
  content?: string;
}

/**
 * Find a node in the HTML structure by line number
 * @param htmlStructure - The parsed HTML structure
 * @param lineNumber - The line number to find
 * @returns The node at the given line number, or undefined if not found
 */
export function findNodeByLineNumber(htmlStructure: HtmlNode[], lineNumber: number): HtmlNode | undefined {
  if (!htmlStructure || !Array.isArray(htmlStructure) || htmlStructure.length === 0) {
    return undefined;
  }
  
  // Helper function for recursive search
  function searchNode(node: HtmlNode): HtmlNode | undefined {
    // Check if this node matches the line number
    if (node.lineNumber === lineNumber) {
      return node;
    }
    
    // Check this node's children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const result = searchNode(child);
        if (result) {
          return result;
        }
      }
    }
    
    return undefined;
  }
  
  // Search each root node
  for (const rootNode of htmlStructure) {
    const result = searchNode(rootNode);
    if (result) {
      return result;
    }
  }
  
  return undefined;
}

/**
 * Find a node in the HTML structure by element type and class
 * @param htmlStructure - The parsed HTML structure
 * @param elementType - The element type to find (e.g., 'div', 'span')
 * @param className - The class name to find (optional)
 * @returns The matching node, or undefined if not found
 */
export function findNodeByTypeAndClass(
  htmlStructure: HtmlNode[], 
  elementType: string, 
  className?: string
): HtmlNode | undefined {
  if (!htmlStructure || !Array.isArray(htmlStructure) || htmlStructure.length === 0) {
    return undefined;
  }
  
  // Helper function for recursive search
  function searchNode(node: HtmlNode): HtmlNode | undefined {
    // Check if this node matches
    if (node.elementType === elementType) {
      // If class is specified, check that too
      if (!className || (node.attributes?.class && 
          node.attributes.class.split(' ').includes(className))) {
        return node;
      }
    }
    
    // Check this node's children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const result = searchNode(child);
        if (result) {
          return result;
        }
      }
    }
    
    return undefined;
  }
  
  // Search each root node
  for (const rootNode of htmlStructure) {
    const result = searchNode(rootNode);
    if (result) {
      return result;
    }
  }
  
  return undefined;
}

/**
 * Get a flattened array of all nodes in the HTML structure
 * @param htmlStructure - The parsed HTML structure
 * @returns Array of all nodes in the structure
 */
export function flattenHtmlStructure(htmlStructure: HtmlNode[]): HtmlNode[] {
  if (!htmlStructure || !Array.isArray(htmlStructure) || htmlStructure.length === 0) {
    return [];
  }
  
  const result: HtmlNode[] = [];
  
  // Helper function for recursive traversal
  function traverseNode(node: HtmlNode) {
    // Add this node
    result.push(node);
    
    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverseNode(child);
      }
    }
  }
  
  // Traverse each root node
  for (const rootNode of htmlStructure) {
    traverseNode(rootNode);
  }
  
  return result;
}

/**
 * Get path to a node in the HTML structure
 * @param htmlStructure - The parsed HTML structure
 * @param targetNode - The node to find the path to
 * @returns Array of nodes forming the path from root to target, or empty array if not found
 */
export function getPathToNode(htmlStructure: HtmlNode[], targetNode: HtmlNode): HtmlNode[] {
  if (!htmlStructure || !Array.isArray(htmlStructure) || htmlStructure.length === 0 || !targetNode) {
    return [];
  }
  
  const path: HtmlNode[] = [];
  
  // Helper function for recursive search
  function findPath(node: HtmlNode): boolean {
    // Check if this is the target node
    if (node === targetNode) {
      path.push(node);
      return true;
    }
    
    // Check children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (findPath(child)) {
          // If child path found, add this node to path and return true
          path.unshift(node);
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Try to find path from each root node
  for (const rootNode of htmlStructure) {
    if (findPath(rootNode)) {
      return path;
    }
  }
  
  return [];
}

/**
 * Get the parent node of a given node
 * @param htmlStructure - The parsed HTML structure
 * @param targetNode - The node to find the parent of
 * @returns The parent node, or undefined if not found or if target is a root node
 */
export function getParentNode(htmlStructure: HtmlNode[], targetNode: HtmlNode): HtmlNode | undefined {
  if (!htmlStructure || !Array.isArray(htmlStructure) || htmlStructure.length === 0 || !targetNode) {
    return undefined;
  }
  
  // Helper function for recursive search
  function findParent(node: HtmlNode, target: HtmlNode): HtmlNode | undefined {
    // Check if any of the children is the target
    if (node.children && Array.isArray(node.children)) {
      if (node.children.includes(target)) {
        return node;
      }
      
      // Check each child recursively
      for (const child of node.children) {
        const parent = findParent(child, target);
        if (parent) {
          return parent;
        }
      }
    }
    
    return undefined;
  }
  
  // Try to find parent from each root node
  for (const rootNode of htmlStructure) {
    const parent = findParent(rootNode, targetNode);
    if (parent) {
      return parent;
    }
  }
  
  return undefined;
} 