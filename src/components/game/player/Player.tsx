'use client';
import { useEffect, useRef } from 'react';
import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { updatePlayerPosition, setIsPlayerMoving } from '@/store/slices/gameSlice';

export default function Player() {
  const dispatch = useAppDispatch();
  const { playerPosition, movementSpeed } = useAppSelector((state) => state.game);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      dispatch(setIsPlayerMoving(false));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch]);

  useFrame(() => {
    const keys = keysPressed.current;
    let moving = false;

    if (keys['w'] || keys['arrowup']) {
      dispatch(updatePlayerPosition({ z: playerPosition.z - movementSpeed }));
      moving = true;
    }
    if (keys['s'] || keys['arrowdown']) {
      dispatch(updatePlayerPosition({ z: playerPosition.z + movementSpeed }));
      moving = true;
    }
    if (keys['a'] || keys['arrowleft']) {
      dispatch(updatePlayerPosition({ x: playerPosition.x - movementSpeed }));
      moving = true;
    }
    if (keys['d'] || keys['arrowright']) {
      dispatch(updatePlayerPosition({ x: playerPosition.x + movementSpeed }));
      moving = true;
    }

    if (moving) {
      dispatch(setIsPlayerMoving(true));
    }
  });

  return (
    <Box 
      position={[playerPosition.x, playerPosition.y, playerPosition.z]} 
      args={[0.5, 1, 0.5]} // A bit taller than wide to look like a character
    >
      <meshStandardMaterial color="skyblue" />
    </Box>
  );
} 