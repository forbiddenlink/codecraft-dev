'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GameManager, getGameManager } from '@/game/GameManager';
import { useAppDispatch } from '@/store/hooks';
import { gamePersistence } from '@/utils/gamePersistence';

interface GameContextValue {
  gameManager: GameManager;
  isInitialized: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameManager] = useState(() => getGameManager());
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize game manager and load saved state
    const initializeGame = async () => {
      try {
        // Try to load saved game state
        const savedState = gamePersistence.loadFromLocalStorage();

        if (savedState) {
          // TODO: Implement loadState method on GameManager
          // gameManager.loadState(savedState);
          console.log('Game state loaded successfully');
        } else {
          console.log('No saved state found, starting fresh');
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setIsInitialized(true); // Continue anyway with fresh state
      }
    };

    initializeGame();

    // Set up auto-save every 60 seconds
    const autoSaveInterval = setInterval(() => {
      try {
        // TODO: Implement getState method on GameManager
        // const state = gameManager.getState();
        // gamePersistence.saveToLocalStorage(state);
        console.log('Game auto-save (not implemented yet)');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 60000); // 60 seconds

    // Save on page unload
    const handleBeforeUnload = () => {
      // TODO: Implement getState method on GameManager
      // const state = gameManager.getState();
      // gamePersistence.saveToLocalStorage(state);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameManager]);

  return (
    <GameContext.Provider value={{ gameManager, isInitialized }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameManager(): GameManager {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameManager must be used within GameProvider');
  }
  if (!context.isInitialized) {
    throw new Error('GameManager is not yet initialized');
  }
  return context.gameManager;
}

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}
