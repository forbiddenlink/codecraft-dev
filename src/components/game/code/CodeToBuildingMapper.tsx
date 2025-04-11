'use client';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import HtmlStructureVisualization from './HtmlStructureVisualization';
import ErrorVisualization from './ErrorVisualization';
import { parseHtmlToStructure } from '@/utils/htmlParser';
import { applyStyles } from '@/utils/cssParser';
import { executeJavaScript } from '@/utils/codeExecution';
import { 
  updateHtmlStructure, 
  updateCssRules, 
  updateJsExecution 
} from '@/store/slices/gameSlice';

interface HtmlNode {
  elementType: string;
  index: number;
  level: number;
  position?: [number, number, number];
  children?: HtmlNode[];
}

type EnvironmentValue = string | number | boolean;

/**
 * CodeToBuildingMapper - The core component that handles mapping from code to 3D buildings
 * This component is responsible for:
 * 1. Processing HTML from the editor
 * 2. Applying CSS styles
 * 3. Executing JavaScript
 * 4. Visualizing the resulting structure in the 3D world
 */
export default function CodeToBuildingMapper() {
  const dispatch = useAppDispatch();
  
  // Get current editor state
  const { 
    currentCode, 
    language
  } = useAppSelector(state => state.editor);
  
  // Get current game state
  const { 
    htmlStructure, 
    cssRules, 
    jsExecutionContext 
  } = useAppSelector(state => state.game);
  
  // State for selected building
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Process code changes to update game world
  useEffect(() => {
    // Debounce code processing to avoid performance issues
    const timer = setTimeout(() => {
      if (currentCode) {
        switch(language) {
          case 'html':
            // Parse HTML to structure
            const structure = parseHtmlToStructure(currentCode);
            
            // Apply current CSS styles
            const styledStructure = applyStyles(structure, cssRules);
            
            // Update game state with the processed structure
            dispatch(updateHtmlStructure(styledStructure));
            break;
            
          case 'css':
            // Parse CSS
            const rules = applyStyles([], currentCode, true);
            
            // Update game state with the processed CSS
            dispatch(updateCssRules(rules));
            
            // Re-apply styles to current HTML structure
            if (htmlStructure && htmlStructure.length > 0) {
              const updatedStructure = applyStyles(htmlStructure, rules);
              dispatch(updateHtmlStructure(updatedStructure));
            }
            break;
            
          case 'javascript':
            // Safely execute user JavaScript
            const executionResult = executeJavaScript(currentCode, {
              // Provide game-specific context
              colony: {
                // Methods that affect the game world
                addResource: (type: string, amount: number) => {
                  console.log(`Adding ${amount} of ${type}`);
                  // Would dispatch to the resource system
                },
                setEnvironment: (property: string, value: EnvironmentValue) => {
                  console.log(`Setting ${property} to ${value}`);
                  // Would dispatch to update environment
                },
                // Other colony interaction methods
              }
            });
            
            // Update game state with execution result
            dispatch(updateJsExecution(executionResult));
            break;
        }
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [currentCode, language, cssRules, htmlStructure, dispatch]);
  
  // Handle building selection
  const handleBuildingSelect = (node: HtmlNode) => {
    // Generate a unique ID for the node
    const nodeId = `${node.elementType}-${node.index}-${node.level}`;
    
    // Toggle selection
    setSelectedNodeId(prevId => prevId === nodeId ? null : nodeId);
  };
  
  return (
    <group>
      {/* Visualize HTML structure as buildings */}
      <HtmlStructureVisualization
        htmlStructure={htmlStructure}
        cssRules={cssRules}
        onBuildingSelect={handleBuildingSelect}
        selectedNodeId={selectedNodeId}
      />
      
      {/* Visualize errors if any */}
      <ErrorVisualization />
      
      {/* JavaScript execution visualization would be added here */}
      {jsExecutionContext && Object.keys(jsExecutionContext).length > 0 && (
        // This could be a component that visualizes JavaScript execution
        // Like resource flows, event triggers, etc.
        <group position={[0, 10, 0]}>
          {/* JavaScript execution visualization */}
        </group>
      )}
    </group>
  );
} 