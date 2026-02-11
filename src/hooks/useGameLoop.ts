import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { processTick } from '@/store/slices/resourceSlice';

/**
 * Game Loop Hook
 * Manages the main game loop that drives resource generation and other time-based systems
 */
export function useGameLoop(tickInterval: number = 1000) {
  const dispatch = useAppDispatch();
  const frameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      // Calculate time since last tick
      const timeSinceLastTick = timestamp - lastTickRef.current;

      // Process game tick at specified interval
      if (timeSinceLastTick >= tickInterval) {
        // Dispatch resource tick with delta time in seconds
        const deltaTimeSeconds = timeSinceLastTick / 1000;
        dispatch(processTick(deltaTimeSeconds));

        // Update last tick time
        lastTickRef.current = timestamp;
        frameRef.current++;
      }

      // Continue the loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [dispatch, tickInterval]);

  return { currentFrame: frameRef.current };
}
