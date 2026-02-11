'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles, Text } from '@react-three/drei';
import { useAppSelector } from '@/store/hooks';
import { findNodeByLineNumber } from '@/utils/htmlStructureUtils';
import * as THREE from 'three';

interface ErrorVisualizationProps {
  position?: [number, number, number];
}

export default function ErrorVisualization({ position = [0, 5, 0] }: ErrorVisualizationProps) {
  const errors = useAppSelector(state => state.editor.errors);
  const htmlStructure = useAppSelector(state => state.game.htmlStructure);
  const visualizationRef = useRef<THREE.Group>(null);
  
  // Animate error visualization
  useFrame((state) => {
    if (!visualizationRef.current) return;
    
    const time = state.clock.getElapsedTime();
    visualizationRef.current.rotation.y = time * 0.5;
  });
  
  // If no errors, don't render anything
  if (!errors || errors.length === 0) return null;
  
  // Find distinct error messages by severity
  const errorCount = errors.filter((e: any) => e.severity === 'error').length;
  const warningCount = errors.filter((e: any) => e.severity === 'warning').length;
  
  return (
    <group position={position} ref={visualizationRef}>
      {/* Main error indicator */}
      <group visible={errors.length > 0}>
        {/* Error particles */}
        <Sparkles
          count={errors.length * 10}
          scale={[3, 3, 3]}
          size={1.5}
          speed={0.3}
          color="red"
        />
        
        <pointLight
          color="red"
          intensity={1.5}
          distance={10}
        />
        
        {/* Error info */}
        <Html position={[0, 0, 0]} center>
          <div className="bg-red-900 bg-opacity-80 p-3 rounded-lg text-white text-center">
            <div className="text-2xl font-bold">⚠️ Code Issues</div>
            <div className="mt-2">
              {errorCount > 0 && (
                <div className="text-red-300">{errorCount} error{errorCount !== 1 ? 's' : ''}</div>
              )}
              {warningCount > 0 && (
                <div className="text-yellow-300">{warningCount} warning{warningCount !== 1 ? 's' : ''}</div>
              )}
            </div>
            <div className="mt-2 text-sm">
              Check the editor for details
            </div>
          </div>
        </Html>
      </group>
      
      {/* Error visualization on affected buildings */}
      {/* TODO: Re-enable when GameStructureNode has lineNumber property */}
      {/* {errors.map((error, index) => {
        const affectedNode = findNodeByLineNumber(htmlStructure, error.line);
        
        if (!affectedNode || !affectedNode.position) return null;
        
        const errorColor = error.severity === 'error' ? 'red' : 
                          error.severity === 'warning' ? 'orange' : 
                          'blue';
        
        return (
          <group key={`error-${index}`} position={affectedNode.position}>
            <Sparkles
              count={15}
              scale={[1, 1, 1]}
              size={1}
              speed={0.4}
              color={errorColor}
            />
            
            <pointLight
              color={errorColor}
              intensity={1}
              distance={5}
            />
            
            <group position={[0, 1.5, 0]}>
              <Text
                color={errorColor}
                fontSize={0.3}
                maxWidth={4}
                textAlign="center"}
                anchorY="bottom"
              >
                {error.message}
              </Text>
            </group>
          </group>
        );
      })} */}
    </group>
  );
} 