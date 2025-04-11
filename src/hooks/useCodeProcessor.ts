import { useState } from 'react';
import { codeProcessor } from '@/game/systems/CodeToGamePipeline';
import { useAppDispatch } from '@/store/hooks';
import { setEditorErrors } from '@/store/slices/editorSlice';
import { GameStructureNode } from '@/utils/htmlParser';
import { BuildingLayout } from '@/game/systems/CodeToGamePipeline';

interface CodeProcessingResult {
  success: boolean;
  htmlStructure: GameStructureNode[];
  cssRules: Record<string, unknown>;
  buildings: BuildingLayout[];
  behaviors: Record<string, unknown>;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: string;
    source: string;
  }>;
  warnings: Array<{
    line: number;
    column: number;
    message: string;
    severity: string;
    source: string;
  }>;
}

export function useCodeProcessor() {
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<CodeProcessingResult | null>(null);

  /**
   * Process code and update game state
   */
  const processCode = async (html: string, css: string, js?: string) => {
    setIsProcessing(true);
    
    try {
      const result = codeProcessor.processCode(html, css, js);
      
      // Update editor errors
      const allErrors = [...result.errors, ...result.warnings];
      dispatch(setEditorErrors(allErrors));
      
      // Store result
      setLastResult(result);
      
      return result;
    } catch (error) {
      console.error('Error processing code:', error);
      
      // Create error object
      const errorResult: CodeProcessingResult = {
        success: false,
        htmlStructure: [],
        cssRules: {},
        buildings: [],
        behaviors: {},
        errors: [{
          line: 1,
          column: 1,
          message: `Code processing error: ${error.message}`,
          severity: 'error',
          source: 'processing'
        }],
        warnings: []
      };
      
      // Update editor errors
      dispatch(setEditorErrors(errorResult.errors));
      
      // Store result
      setLastResult(errorResult);
      
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCode,
    isProcessing,
    lastResult
  };
} 