'use client';
import { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import usePixelFloat from '@/hooks/usePixelFloat';
import { useFrame } from '@react-three/fiber';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { updatePixelPosition, setIsPixelMoving, setPixelMood } from '@/store/slices/gameSlice';
import { Vector3 } from 'three';

const FOLLOW_DISTANCE = 2; // How far Pixel stays from player
const MOVE_THRESHOLD = 4; // Distance at which Pixel starts following
const MOOD_UPDATE_INTERVAL = 3000; // How often Pixel's mood can change

export default function Pixel() {
  const floatRef = usePixelFloat();
  const dispatch = useAppDispatch();
  const { 
    pixelPosition, 
    playerPosition, 
    movementSpeed,
    isPlayerMoving,
    playerInteractionRadius 
  } = useAppSelector((state) => state.game);
  
  const lastMoodUpdate = useRef(Date.now());

  // Calculate distance to player
  useFrame(() => {
    const pixelVec = new Vector3(pixelPosition.x, pixelPosition.y, pixelPosition.z);
    const playerVec = new Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    const distanceToPlayer = pixelVec.distanceTo(playerVec);

    // Update Pixel's mood based on distance and player movement
    if (Date.now() - lastMoodUpdate.current > MOOD_UPDATE_INTERVAL) {
      if (distanceToPlayer > MOVE_THRESHOLD) {
        dispatch(setPixelMood('curious'));
      } else if (isPlayerMoving) {
        dispatch(setPixelMood('excited'));
      } else if (distanceToPlayer < playerInteractionRadius) {
        dispatch(setPixelMood('happy'));
      } else {
        dispatch(setPixelMood('thinking'));
      }
      lastMoodUpdate.current = Date.now();
    }

    // Move Pixel if too far from player
    if (distanceToPlayer > MOVE_THRESHOLD) {
      // Calculate ideal position (slightly behind player)
      const directionToPlayer = playerVec.sub(pixelVec).normalize();
      const targetPos = playerVec.sub(directionToPlayer.multiplyScalar(FOLLOW_DISTANCE));
      
      // Smoothly move towards target
      const newX = pixelPosition.x + (targetPos.x - pixelPosition.x) * movementSpeed;
      const newZ = pixelPosition.z + (targetPos.z - pixelPosition.z) * movementSpeed;

      dispatch(updatePixelPosition({ x: newX, z: newZ }));
      dispatch(setIsPixelMoving(true));
    } else {
      dispatch(setIsPixelMoving(false));
    }
  });

  return (
    <Sphere 
      ref={floatRef} 
      position={[pixelPosition.x, pixelPosition.y, pixelPosition.z]} 
      args={[0.3, 32, 32]}
    >
      <meshStandardMaterial 
        color="hotpink" 
        emissive="deeppink" 
        emissiveIntensity={0.3} 
      />
    </Sphere>
  );
}
