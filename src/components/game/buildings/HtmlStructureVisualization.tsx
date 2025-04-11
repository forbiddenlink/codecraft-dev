'use client';
import { useMemo } from 'react';
import BuildingModel, { BuildingModelType } from './BuildingModel';
import { Html, Line } from '@react-three/drei';
import { useAppSelector } from '@/hooks/reduxHooks';

interface HtmlNode {
  elementType: string;
  attributes: Record<string, string>;
  children: HtmlNode[];
  styles: Record<string, string | number>;
  textContent?: string;
  position?: [number, number, number];
  level: number;
  index: number;
  lineNumber?: number;
}

interface HtmlStructureVisualizationProps {
  htmlStructure: HtmlNode[];
  onBuildingSelect?: (node: HtmlNode) => void;
  selectedNodeId?: string | null;
}

const NODE_VERTICAL_SPACING = 3;
const NODE_HORIZONTAL_SPACING = 4;
const BASE_HEIGHT = 0;

export default function HtmlStructureVisualization({ 
  htmlStructure, 
  onBuildingSelect,
  selectedNodeId 
}: HtmlStructureVisualizationProps) {
  const editorErrors = useAppSelector(state => state.editor.validationErrors);
  
  // Process HTML structure and layout buildings in 3D space
  const processedStructure = useMemo(() => {
    if (!htmlStructure || htmlStructure.length === 0) {
      return [];
    }
    
    const processedNodes: HtmlNode[] = [];
    
    // Calculate horizontal positions based on tree structure
    function processNode(
      node: HtmlNode, 
      level: number, 
      parentPosition: [number, number, number] | null = null,
      index: number = 0,
      siblingCount: number = 1
    ): HtmlNode {
      // Create a copy of the node
      const processedNode = { ...node, level, index };
      
      // Calculate node position
      let nodePosition: [number, number, number];
      
      if (parentPosition) {
        // Position relative to parent
        const xOffset = (index - (siblingCount - 1) / 2) * NODE_HORIZONTAL_SPACING;
        nodePosition = [
          parentPosition[0] + xOffset,
          BASE_HEIGHT - (level * NODE_VERTICAL_SPACING),
          parentPosition[2] + NODE_HORIZONTAL_SPACING/2
        ];
      } else {
        // Root node positioning
        nodePosition = [
          (index - (siblingCount - 1) / 2) * NODE_HORIZONTAL_SPACING,
          BASE_HEIGHT,
          0
        ];
      }
      
      // Store position in the node
      processedNode.position = nodePosition;
      
      // Process children recursively
      if (node.children && node.children.length > 0) {
        processedNode.children = node.children.map((child, childIndex) => 
          processNode(
            child, 
            level + 1, 
            nodePosition, 
            childIndex, 
            node.children.length
          )
        );
      } else {
        processedNode.children = [];
      }
      
      // Add to flattened list for rendering
      processedNodes.push(processedNode);
      
      return processedNode;
    }
    
    // Start processing from root nodes
    const rootNodes = htmlStructure.map((node, index) => 
      processNode(node, 0, null, index, htmlStructure.length)
    );
    
    return { roots: rootNodes, all: processedNodes };
  }, [htmlStructure]);
  
  // Connect nodes with lines to show hierarchy
  const connectionLines = useMemo(() => {
    const lines: Array<{ from: [number, number, number], to: [number, number, number] }> = [];
    
    function addConnectionLines(node: HtmlNode) {
      if (!node.position || !node.children) return;
      
      // Connect parent to each child
      node.children.forEach(child => {
        if (child.position) {
          lines.push({
            from: node.position as [number, number, number],
            to: child.position as [number, number, number]
          });
          
          // Process child's connections recursively
          addConnectionLines(child);
        }
      });
    }
    
    // Process all root nodes
    if (processedStructure.roots) {
      processedStructure.roots.forEach(root => addConnectionLines(root));
    }
    
    return lines;
  }, [processedStructure]);
  
  // Check if a node has errors
  const nodeHasError = (node: HtmlNode) => {
    if (!editorErrors || editorErrors.length === 0 || !node.lineNumber) return false;
    
    return editorErrors.some(error => 
      error.lineNumber === node.lineNumber || 
      (node.children && node.children.some(child => 
        child.lineNumber && error.lineNumber === child.lineNumber
      ))
    );
  };
  
  // Find error message for a node if it exists
  const getNodeErrorMessage = (node: HtmlNode) => {
    if (!editorErrors || editorErrors.length === 0 || !node.lineNumber) return null;
    
    const error = editorErrors.find(error => error.lineNumber === node.lineNumber);
    return error ? error.message : null;
  };
  
  // Return null if no structure
  if (!processedStructure.all || processedStructure.all.length === 0) {
    return null;
  }
  
  return (
    <group>
      {/* Connection lines between nodes */}
      {connectionLines.map((line, index) => (
        <Line
          key={`line-${index}`}
          points={[line.from, line.to]}
          color="#4a5568"
          lineWidth={1}
          dashed={false}
        />
      ))}
      
      {/* Building models for each node */}
      {processedStructure.all.map((node) => {
        if (!node.position) return null;
        
        // Map HTML element type to building model type
        const buildingType = mapElementToBuilding(node.elementType);
        const hasError = nodeHasError(node);
        const isSelected = selectedNodeId === `${node.elementType}-${node.index}-${node.level}`;
        
        return (
          <group key={`${node.elementType}-${node.index}-${node.level}`}>
            <BuildingModel
              elementType={buildingType}
              styles={{
                ...node.styles,
                width: node.styles.width || getDefaultWidth(node),
                height: node.styles.height || getDefaultHeight(node),
              }}
              position={node.position}
              isHovered={false}
              isSelected={isSelected}
              isError={hasError}
              textContent={node.textContent}
              onClick={() => onBuildingSelect && onBuildingSelect(node)}
            />
            
            {/* Error message tooltip */}
            {hasError && (
              <Html
                position={[node.position[0], node.position[1] + 2, node.position[2]]}
                center
                distanceFactor={15}
              >
                <div className="bg-red-800 text-white p-2 rounded-md text-sm max-w-xs">
                  <div className="font-bold">Error on line {node.lineNumber}</div>
                  <div>{getNodeErrorMessage(node)}</div>
                </div>
              </Html>
            )}
            
            {/* Element type label */}
            <Html
              position={[node.position[0], node.position[1] - 1.5, node.position[2]]}
              center
              distanceFactor={15}
            >
              <div className="bg-gray-800 bg-opacity-80 text-white px-2 py-1 rounded-md text-xs">
                &lt;{node.elementType}&gt;
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Map HTML elements to building types
function mapElementToBuilding(elementType: string): BuildingModelType {
  switch (elementType.toLowerCase()) {
    case 'div': return 'div';
    case 'section': return 'section';
    case 'article': return 'article';
    case 'nav': return 'nav';
    case 'header': return 'header';
    case 'footer': return 'footer';
    case 'aside': return 'aside';
    case 'main': return 'main';
    case 'habitat': return 'habitat';
    case 'laboratory': return 'laboratory';
    case 'greenhouse': return 'greenhouse';
    case 'generator': return 'generator';
    case 'dock': return 'dock';
    case 'command': return 'command';
    case 'storage': return 'storage';
    default: return 'div';
  }
}

// Get default width based on node type and children
function getDefaultWidth(node: HtmlNode): number {
  if (node.children && node.children.length > 3) {
    return 3 + (node.children.length - 3) * 0.5; // Wider for more children
  }
  
  switch (node.elementType.toLowerCase()) {
    case 'section':
    case 'main':
      return 3;
    case 'article':
    case 'laboratory':
      return 2;
    case 'nav':
    case 'dock':
      return 3;
    case 'header':
    case 'footer':
      return 3;
    default:
      return 2;
  }
}

// Get default height based on node type
function getDefaultHeight(node: HtmlNode): number {
  switch (node.elementType.toLowerCase()) {
    case 'section':
    case 'main':
      return 2;
    case 'article':
    case 'laboratory':
      return 2;
    case 'nav':
    case 'dock':
      return 1;
    case 'header':
      return 1;
    case 'footer':
      return 0.7;
    default:
      return 1.5;
  }
} 