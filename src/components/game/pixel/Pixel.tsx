'use client';
import { useRef, useState, useEffect } from 'react';
import { Sphere, Billboard, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePixelPosition, setIsPixelMoving, setPixelMood } from '@/store/slices/gameSlice';
import { Vector3, Mesh, Object3D } from 'three';
import PixelEmissiveParticles from './PixelEmissiveParticles';
import React from 'react';

type PixelMood = 'happy' | 'curious' | 'excited' | 'concerned' | 'neutral' | 'thinking';
type ContextType = 'error' | 'tutorial' | 'lowResources' | 'default';

const FOLLOW_DISTANCE = 2; // How far Pixel stays from player
const MOVE_THRESHOLD = 4; // Distance at which Pixel starts following
const MOOD_UPDATE_INTERVAL = 3000; // How often Pixel's mood can change
const HOVER_HEIGHT = 1.5; // Height above ground
const HOVER_AMPLITUDE = 0.1; // How much to bob up and down
const HOVER_FREQUENCY = 1.5; // Speed of bobbing

// Helper to get color based on mood
function getMoodColor(mood: PixelMood): string {
  switch(mood) {
    case 'happy':
      return '#10B981'; // Success Green
    case 'curious':
      return '#3B82F6'; // Interface Blue
    case 'excited':
      return '#FBBF24'; // Energy Yellow
    case 'concerned':
      return '#EF4444'; // Alert Red
    case 'thinking':
      return '#8B5CF6'; // Lighter purple for thinking state
    default:
      return '#7C3AED'; // Nebula Purple for neutral
  }
}

// Animation parameters based on mood
const MOOD_ANIMATION_PARAMS: Record<PixelMood, {
  hoverFrequency: number;
  hoverAmplitude: number;
  particleCount: number;
  emissiveIntensity: number;
  pulseSpeed: number;
}> = {
  happy: {
    hoverFrequency: 2.0,
    hoverAmplitude: 0.15,
    particleCount: 25,
    emissiveIntensity: 1.0,
    pulseSpeed: 1.5
  },
  curious: {
    hoverFrequency: 1.8,
    hoverAmplitude: 0.12,
    particleCount: 20,
    emissiveIntensity: 0.8,
    pulseSpeed: 1.2
  },
  excited: {
    hoverFrequency: 2.5,
    hoverAmplitude: 0.18,
    particleCount: 30,
    emissiveIntensity: 1.2,
    pulseSpeed: 2.0
  },
  concerned: {
    hoverFrequency: 1.2,
    hoverAmplitude: 0.08,
    particleCount: 15,
    emissiveIntensity: 0.6,
    pulseSpeed: 0.8
  },
  thinking: {
    hoverFrequency: 1.0,
    hoverAmplitude: 0.1,
    particleCount: 18,
    emissiveIntensity: 0.7,
    pulseSpeed: 1.0
  },
  neutral: {
    hoverFrequency: 1.5,
    hoverAmplitude: 0.1,
    particleCount: 20,
    emissiveIntensity: 0.8,
    pulseSpeed: 1.0
  }
};

// Helper to get dialogue based on context and mood
function getContextualDialogue(contextType: ContextType, mood: PixelMood): string {
  // This would connect to a more sophisticated dialogue system in production
  if (contextType === 'error') {
    return "I see there's an issue with your code. Let me help you fix it!";
  } else if (contextType === 'tutorial') {
    return "I'll guide you through this step by step. Let's learn together!";
  } else if (contextType === 'lowResources') {
    return "Your colony's resources are running low. We should build some collectors!";
  } else if (mood === 'happy') {
    return "Your colony is looking great! Keep up the good work!";
  } else if (mood === 'curious') {
    return "Have you explored all the building options in the menu?";
  }
  
  return "I'm Pixel, your AI companion. Let me know if you need anything!";
}

export interface PixelProps {
  mood: PixelMood;
  contextualTip: string;
}

export default function Pixel({ mood: initialMood, contextualTip }: PixelProps) {
  const pixelRef = useRef<Object3D>();
  const coreRef = useRef<Mesh>();
  const dispatch = useAppDispatch();
  const { camera } = useThree();
  
  const { 
    pixelPosition, 
    playerPosition, 
    movementSpeed,
    isPlayerMoving,
    playerInteractionRadius,
    pixelMood,
    colonyResources,
    editorErrors,
    tutorialActive
  } = useAppSelector((state) => state.game);
  
  const [currentMood, setCurrentMood] = useState<PixelMood>(initialMood);
  const [hovering, setHovering] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueText, setDialogueText] = useState('');
  const lastMoodUpdate = useRef(Date.now());
  const lastDialogueUpdate = useRef(Date.now());

  // Update mood when prop changes
  useEffect(() => {
    setCurrentMood(initialMood);
  }, [initialMood]);

  // Use contextual tip for dialogue
  useEffect(() => {
    if (contextualTip) {
      setDialogueText(contextualTip);
    }
  }, [contextualTip]);

  // Determine contextual dialogue
  useEffect(() => {
    let contextType = 'default';
    
    // Prioritize contexts
    if (editorErrors && editorErrors.length > 0) {
      contextType = 'error';
    } else if (tutorialActive) {
      contextType = 'tutorial';
    } else if (colonyResources && colonyResources.energy < 20) {
      contextType = 'lowResources';
    }
    
    // Update dialogue
    if (Date.now() - lastDialogueUpdate.current > 5000) {
      setDialogueText(getContextualDialogue(contextType, currentMood));
      lastDialogueUpdate.current = Date.now();
    }
  }, [currentMood, editorErrors, tutorialActive, colonyResources]);

  // Handle animation and movement logic
  useFrame((state) => {
    if (!pixelRef.current) return;
    
    const animParams = MOOD_ANIMATION_PARAMS[currentMood];
    const time = state.clock.getElapsedTime();
    
    // Hover animation with mood-based parameters
    const hoverY = HOVER_HEIGHT + 
      Math.sin(time * animParams.hoverFrequency) * 
      animParams.hoverAmplitude;
    
    // Update position with hover
    if (pixelRef.current) {
      pixelRef.current.position.y = hoverY;
      pixelRef.current.lookAt(camera.position);
    }
    
    // Update core rotation and pulse
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.01;
      const pulseScale = 1 + Math.sin(time * animParams.pulseSpeed) * 0.05;
      coreRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    // Create fresh Vector3 objects to avoid mutation issues
    const pixelVec = new Vector3(pixelPosition.x, pixelPosition.y, pixelPosition.z);
    const playerVec = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    const distanceToPlayer = pixelVec.distanceTo(playerVec);

    // Update Pixel's mood based on context
    if (Date.now() - lastMoodUpdate.current > MOOD_UPDATE_INTERVAL) {
      if (editorErrors && editorErrors.length > 0) {
        dispatch(setPixelMood('concerned'));
      } else if (distanceToPlayer > MOVE_THRESHOLD) {
        dispatch(setPixelMood('curious'));
      } else if (isPlayerMoving) {
        dispatch(setPixelMood('excited'));
      } else if (distanceToPlayer < playerInteractionRadius) {
        dispatch(setPixelMood('happy'));
      } else {
        dispatch(setPixelMood('neutral'));
      }
      lastMoodUpdate.current = Date.now();
    }

    // Move Pixel if too far from player
    if (distanceToPlayer > MOVE_THRESHOLD) {
      // Calculate direction to player (copy vectors to avoid mutation)
      const direction = new Vector3().subVectors(playerVec, pixelVec).normalize();
      
      // Calculate target position
      const targetPos = new Vector3().copy(playerVec).sub(
        direction.clone().multiplyScalar(FOLLOW_DISTANCE)
      );
      
      // Keep Pixel's hover height
      targetPos.y = HOVER_HEIGHT;
      
      // Smoothly move towards target
      const newX = pixelPosition.x + (targetPos.x - pixelPosition.x) * movementSpeed * 0.03;
      const newZ = pixelPosition.z + (targetPos.z - pixelPosition.z) * movementSpeed * 0.03;

      dispatch(updatePixelPosition({ 
        x: newX, 
        y: pixelPosition.y, // Keep current Y (will be modified by hover below)
        z: newZ 
      }));
      dispatch(setIsPixelMoving(true));
    } else {
      dispatch(setIsPixelMoving(false));
    }
  });

  // Handle interaction with Pixel
  const handlePixelClick = () => {
    setShowDialogue(!showDialogue);
    
    // Use contextual dialogue when clicked
    setDialogueText(getContextualDialogue(
      editorErrors && editorErrors.length > 0 ? 'error' : 
      tutorialActive ? 'tutorial' : 'default',
      currentMood
    ));
  };

  return (
    <group 
      ref={pixelRef} 
      position={[pixelPosition.x, pixelPosition.y, pixelPosition.z]} 
      onClick={handlePixelClick}
      onPointerOver={() => setHovering(true)}
      onPointerOut={() => setHovering(false)}
    >
      {/* Pixel's core sphere */}
      <Sphere 
        ref={coreRef} 
        args={[0.3, 32, 32]}
      >
        <meshStandardMaterial 
          color={getMoodColor(currentMood)} 
          emissive={getMoodColor(currentMood)} 
          emissiveIntensity={MOOD_ANIMATION_PARAMS[currentMood].emissiveIntensity} 
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Inner glow */}
      <pointLight
        color={getMoodColor(currentMood)}
        intensity={MOOD_ANIMATION_PARAMS[currentMood].emissiveIntensity * 1.5}
        distance={3}
      />
      
      {/* Particle effects */}
      <PixelEmissiveParticles 
        count={MOOD_ANIMATION_PARAMS[currentMood].particleCount}
        color={getMoodColor(currentMood)}
        mood={currentMood}
        isMoving={isPlayerMoving}
      />
      
      {/* Dialogue bubble */}
      {showDialogue && (
        <Billboard
          position={[0, 1.2, 0]}
          follow={true}
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <group>
            {/* Background panel */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[dialogueText.length * 0.05 + 1, 0.8]} />
              <meshBasicMaterial color="#1F2937" transparent opacity={0.8} />
            </mesh>
            
            {/* Text */}
            <Text
              position={[0, 0, 0]}
              fontSize={0.15}
              maxWidth={4}
              lineHeight={1.2}
              letterSpacing={0.02}
              textAlign="center"
              color="#F8FAFC" // Stellar White
              anchorX="center"
              anchorY="middle"
            >
              {dialogueText}
            </Text>
          </group>
        </Billboard>
      )}
      
      {/* Interactive indicator */}
      {hovering && !showDialogue && (
        <Billboard
          position={[0, 0.6, 0]}
          follow={true}
        >
          <Text
            fontSize={0.1}
            color="#F8FAFC" // Stellar White
          >
            Click to interact
          </Text>
        </Billboard>
      )}
    </group>
  );
}
