'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text, RoundedBox } from '@react-three/drei';
import { Color, Group, MeshStandardMaterial } from 'three';
import { animated, useSpring } from '@react-spring/three';

// Building model types based on HTML elements
export type BuildingModelType = 
  | 'div' 
  | 'section' 
  | 'article' 
  | 'nav' 
  | 'header' 
  | 'footer' 
  | 'aside' 
  | 'main'
  | 'habitat'
  | 'laboratory'
  | 'greenhouse'
  | 'generator'
  | 'dock'
  | 'command'
  | 'storage';

interface BuildingModelProps {
  elementType: BuildingModelType;
  styles: {
    backgroundColor?: string;
    color?: string;
    borderRadius?: string | number;
    width?: string | number;
    height?: string | number;
    depth?: string | number;
    opacity?: number;
    transform?: string;
    animation?: string;
    '--energy-level'?: string;
  };
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  isHovered?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
  textContent?: string;
  isError?: boolean;
  onClick?: () => void;
}

export default function BuildingModel({ 
  elementType, 
  styles, 
  position, 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1],
  isHovered = false, 
  isSelected = false,
  isActive = true,
  textContent,
  isError = false,
  onClick
}: BuildingModelProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  
  // Convert style values to usable properties
  const properties = useMemo(() => {
    // Default values based on element type
    const defaults = getBuildingDefaults(elementType);
    
    // Extract and process CSS values
    const width = parseSize(styles.width) || defaults.width;
    const height = parseSize(styles.height) || defaults.height;
    const depth = parseSize(styles.depth) || defaults.depth;
    const borderRadius = parseSize(styles.borderRadius) || defaults.borderRadius;
    const color = new Color(styles.backgroundColor || defaults.backgroundColor);
    const textColor = new Color(styles.color || defaults.textColor);
    
    // Energy level custom property (for generators, etc.)
    const energyLevel = parseInt(styles['--energy-level'] || '50') / 100;
    
    return {
      width,
      height,
      depth,
      borderRadius,
      color,
      textColor,
      energyLevel
    };
  }, [elementType, styles]);
  
  // Animation spring for hover/selection
  const { hoverScale, emissiveIntensity } = useSpring({
    hoverScale: isHovered || isSelected ? 1.05 : 1,
    emissiveIntensity: isHovered || isSelected ? 0.5 : isActive ? 0.2 : 0,
    config: { tension: 170, friction: 26 }
  });
  
  // Error animation spring
  const { errorPulse } = useSpring({
    errorPulse: isError ? 1 : 0,
    loop: isError,
    config: { duration: 1000 }
  });
  
  // Handle animations
  useFrame((state) => {
    if (!groupRef.current || !materialRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Apply CSS animations if present
    if (styles.animation) {
      applyAnimation(groupRef.current, styles.animation, time);
    }
    
    // Animate energy systems for active buildings
    if (isActive && elementType === 'generator') {
      materialRef.current.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1 * properties.energyLevel;
    }
  });
  
  // Render the appropriate building model based on element type
  const BuildingShape = useMemo(() => {
    switch (elementType) {
      case 'section':
      case 'main':
      case 'habitat':
      case 'command':
        // Larger structure with rounded corners
        return (
          <RoundedBox 
            args={[properties.width, properties.height, properties.depth]}
            radius={properties.borderRadius}
            smoothness={4}
          >
            <animated.meshStandardMaterial 
              ref={materialRef}
              color={properties.color}
              emissive={properties.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.3}
              roughness={0.7}
            />
          </RoundedBox>
        );
      
      case 'article':
      case 'laboratory':
        // Scientific looking module
        return (
          <group>
            <Box 
              args={[properties.width, properties.height * 0.8, properties.depth]}
              position={[0, 0, 0]}
            >
              <animated.meshStandardMaterial 
                ref={materialRef}
                color={properties.color}
                emissive={properties.color}
                emissiveIntensity={emissiveIntensity}
                metalness={0.6}
                roughness={0.4}
              />
            </Box>
            <Sphere
              args={[properties.width * 0.3, 16, 16]}
              position={[0, properties.height * 0.5, 0]}
            >
              <animated.meshStandardMaterial
                color={new Color().copy(properties.color).multiplyScalar(1.2)}
                emissive={properties.color}
                emissiveIntensity={emissiveIntensity}
                metalness={0.7}
                roughness={0.3}
              />
            </Sphere>
          </group>
        );
      
      case 'nav':
      case 'dock':
        // Corridor-like structure
        return (
          <Box 
            args={[properties.width, properties.height * 0.5, properties.depth * 2]}
          >
            <animated.meshStandardMaterial 
              ref={materialRef}
              color={properties.color}
              emissive={properties.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.4}
              roughness={0.6}
            />
          </Box>
        );
      
      case 'header':
        // Top-heavy structure
        return (
          <Box 
            args={[properties.width, properties.height * 0.7, properties.depth]}
            position={[0, properties.height * 0.15, 0]}
          >
            <animated.meshStandardMaterial 
              ref={materialRef}
              color={properties.color}
              emissive={properties.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.5}
              roughness={0.5}
            />
          </Box>
        );
      
      case 'footer':
        // Base/foundation structure
        return (
          <Box 
            args={[properties.width * 1.2, properties.height * 0.4, properties.depth * 1.2]}
            position={[0, -properties.height * 0.3, 0]}
          >
            <animated.meshStandardMaterial 
              ref={materialRef}
              color={properties.color}
              emissive={properties.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.6}
              roughness={0.7}
            />
          </Box>
        );
      
      case 'generator':
        // Energy producing structure
        return (
          <group>
            <Cylinder
              args={[properties.width * 0.4, properties.width * 0.6, properties.height, 16]}
            >
              <animated.meshStandardMaterial 
                ref={materialRef}
                color={properties.color}
                emissive={new Color(0xfbbf24)} // Energy Yellow
                emissiveIntensity={emissiveIntensity}
                metalness={0.7}
                roughness={0.3}
              />
            </Cylinder>
            <Box
              args={[properties.width * 0.8, properties.height * 0.2, properties.width * 0.8]}
              position={[0, -properties.height * 0.4, 0]}
            >
              <meshStandardMaterial
                color={new Color().copy(properties.color).multiplyScalar(0.8)}
                metalness={0.5}
                roughness={0.7}
              />
            </Box>
          </group>
        );
      
      case 'greenhouse':
        // Plant growing structure with dome
        return (
          <group>
            <Sphere
              args={[properties.width * 0.5, 16, 16, 0, Math.PI]}
              position={[0, properties.height * 0.2, 0]}
            >
              <animated.meshStandardMaterial 
                ref={materialRef}
                color={new Color(0xc1d9e8)} // Light blue glass
                emissive={properties.color}
                emissiveIntensity={emissiveIntensity.to(v => v * 0.3)}
                metalness={0.1}
                roughness={0.3}
                transparent
                opacity={0.7}
              />
            </Sphere>
            <Cylinder
              args={[properties.width * 0.5, properties.width * 0.5, properties.height * 0.4, 16]}
              position={[0, -properties.height * 0.2, 0]}
            >
              <meshStandardMaterial
                color={properties.color}
                metalness={0.4}
                roughness={0.6}
              />
            </Cylinder>
          </group>
        );
      
      case 'storage':
        // Container-like structure
        return (
          <group>
            <Box 
              args={[properties.width, properties.height, properties.depth]}
            >
              <animated.meshStandardMaterial 
                ref={materialRef}
                color={properties.color}
                emissive={properties.color}
                emissiveIntensity={emissiveIntensity}
                metalness={0.5}
                roughness={0.5}
              />
            </Box>
            <Box
              args={[properties.width * 0.9, properties.height * 0.1, properties.depth * 0.05]}
              position={[0, 0, properties.depth * 0.5]}
            >
              <meshStandardMaterial
                color={new Color().copy(properties.color).multiplyScalar(1.2)}
                metalness={0.7}
                roughness={0.3}
              />
            </Box>
          </group>
        );
      
      // Default case - basic div building
      default:
        return (
          <Box 
            args={[properties.width, properties.height, properties.depth]}
          >
            <animated.meshStandardMaterial 
              ref={materialRef}
              color={properties.color}
              emissive={properties.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.4}
              roughness={0.6}
            />
          </Box>
        );
    }
  }, [elementType, properties, emissiveIntensity]);

  return (
    <animated.group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={hoverScale.to(s => [s * scale[0], s * scale[1], s * scale[2]])}
      onClick={onClick}
    >
      {/* Error effect */}
      <animated.group scale={errorPulse.to(p => 1 + p * 0.05)}>
        {BuildingShape}
      </animated.group>
      
      {/* Text content if provided */}
      {textContent && (
        <Text
          position={[0, properties.height * 0.6, properties.depth * 0.6]}
          fontSize={0.3}
          color={properties.textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={properties.width * 1.5}
        >
          {textContent}
        </Text>
      )}
    </animated.group>
  );
}

// Helper function to get default properties based on element type
function getBuildingDefaults(elementType: BuildingModelType) {
  switch (elementType) {
    case 'section':
    case 'main':
      return {
        width: 3,
        height: 2,
        depth: 3,
        borderRadius: 0.2,
        backgroundColor: '#7bb5d4', // Light blue
        textColor: '#ffffff',
      };
    
    case 'article':
    case 'laboratory':
      return {
        width: 2,
        height: 2,
        depth: 2,
        borderRadius: 0.1,
        backgroundColor: '#a8c6d9', // Medium blue
        textColor: '#ffffff',
      };
    
    case 'nav':
    case 'dock':
      return {
        width: 3,
        height: 1,
        depth: 1.5,
        borderRadius: 0.2,
        backgroundColor: '#5d8ca8', // Darker blue
        textColor: '#ffffff',
      };
    
    case 'header':
      return {
        width: 3,
        height: 1,
        depth: 3,
        borderRadius: 0.2,
        backgroundColor: '#5d8ca8', // Darker blue
        textColor: '#ffffff',
      };
    
    case 'footer':
      return {
        width: 3,
        height: 0.7,
        depth: 3,
        borderRadius: 0.2,
        backgroundColor: '#5d8ca8', // Darker blue
        textColor: '#ffffff',
      };
    
    case 'habitat':
      return {
        width: 2.5,
        height: 2,
        depth: 2.5,
        borderRadius: 0.3,
        backgroundColor: '#7bb5d4', // Light blue
        textColor: '#ffffff',
      };
    
    case 'generator':
      return {
        width: 1.5,
        height: 2,
        depth: 1.5,
        borderRadius: 0.1,
        backgroundColor: '#4a5568', // Dark gray
        textColor: '#ffffff',
      };
    
    case 'greenhouse':
      return {
        width: 2,
        height: 2,
        depth: 2,
        borderRadius: 0.3,
        backgroundColor: '#10b981', // Green
        textColor: '#ffffff',
      };
    
    case 'storage':
      return {
        width: 2,
        height: 1.5,
        depth: 2,
        borderRadius: 0.1,
        backgroundColor: '#6b7280', // Gray
        textColor: '#ffffff',
      };
    
    // Default case for div and others
    default:
      return {
        width: 2,
        height: 1.5,
        depth: 2,
        borderRadius: 0.1,
        backgroundColor: '#4a5568', // Dark gray
        textColor: '#ffffff',
      };
  }
}

// Helper to parse CSS size values
function parseSize(size: string | number | undefined): number | undefined {
  if (size === undefined) return undefined;
  
  if (typeof size === 'number') return size;
  
  // Parse CSS units like px, em, rem, %
  const sizeRegex = /(\d+\.?\d*)([a-z%]*)/i;
  const matches = size.match(sizeRegex);
  
  if (!matches) return undefined;
  
  const value = parseFloat(matches[1]);
  const unit = matches[2];
  
  // Convert to appropriate scale for 3D world
  switch (unit) {
    case 'px':
      return value * 0.01; // 100px = 1 unit
    case 'em':
    case 'rem':
      return value; // 1em = 1 unit
    case '%':
      return value * 0.02; // 100% = 2 units
    default:
      return value;
  }
}

// Apply CSS animations to 3D objects
function applyAnimation(group: Group, animation: string, time: number) {
  // Parse animation properties
  const animationName = animation.split(' ')[0];
  
  // Apply different animations based on name
  switch (animationName) {
    case 'pulse':
      const scale = 1 + Math.sin(time * 3) * 0.05;
      group.scale.set(scale, scale, scale);
      break;
    
    case 'rotate':
      group.rotation.y = time % (Math.PI * 2);
      break;
    
    case 'fadeIn':
      // Handled by material opacity
      break;
    
    case 'hover':
      group.position.y += Math.sin(time * 2) * 0.01;
      break;
    
    default:
      // No animation applied
      break;
  }
} 