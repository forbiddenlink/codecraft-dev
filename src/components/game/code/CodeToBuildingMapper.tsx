'use client';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import HtmlStructureVisualization from '../buildings/HtmlStructureVisualization';
import ErrorVisualization from './ErrorVisualization';
import { parseHtmlToStructure } from '@/utils/htmlParser';
import { parseCSSRules } from '@/utils/cssParser';
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
    code, 
    language
  } = useAppSelector(state => state.editor);
  
  const currentCode = code[language];
  
  // Get current game state
  const {
    htmlStructure,
    cssRules
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
            dispatch(updateHtmlStructure(structure));
            break;

          case 'css':
            // Parse CSS rules
            const rules = parseCSSRules(currentCode);
            dispatch(updateCssRules(rules));
            break;

          case 'javascript':
            // Execute JavaScript safely
            try {
              // Create a sandboxed execution context
              const context = {
                console: {
                  log: (...args: any[]) => console.log('[User Code]', ...args),
                  warn: (...args: any[]) => console.warn('[User Code]', ...args),
                  error: (...args: any[]) => console.error('[User Code]', ...args),
                },
                // Add safe APIs
              };

              // Execute in isolated scope
              const wrappedCode = `
                (function() {
                  const console = context.console;
                  ${currentCode}
                })();
              `;

              // Use Function constructor for safer execution than eval
              const executor = new Function('context', wrappedCode);
              executor(context);

              dispatch(updateJsExecution({
                success: true,
                output: 'Code executed successfully',
              }));
            } catch (error: any) {
              dispatch(updateJsExecution({
                success: false,
                error: error?.message || 'Unknown error',
              }));
              console.error('JavaScript execution error:', error);
            }
            break;
        }
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [currentCode, language, dispatch]);
  
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
        onBuildingSelect={handleBuildingSelect}
        selectedNodeId={selectedNodeId}
      />
      
      {/* Visualize errors if any */}
      <ErrorVisualization />
      
      {/* JavaScript execution visualization would be added here */}
      {/* TODO: Re-enable when jsExecutionContext is available in GameState */}
      {/* {jsExecutionContext && Object.keys(jsExecutionContext).length > 0 && (
        <group position={[0, 10, 0]}>
        </group>
      )} */}
    </group>
  );
} 