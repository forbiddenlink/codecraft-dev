/**
 * Game State Persistence System
 * Handles saving and loading game progress with localStorage and IndexedDB
 */

import { RootState } from '@/store/store';

export interface SavedGameState {
  version: string;
  timestamp: number;
  player: {
    xp: number;
    level: number;
    username?: string;
  };
  progress: {
    challengesCompleted: string[];
    tutorialsCompleted: string[];
    achievementsUnlocked: string[];
  };
  colony: {
    resources: Record<string, number>;
    buildings: any[];
    villagers: string[];
  };
  code: {
    savedProjects: Record<string, {
      html: string;
      css: string;
      javascript: string;
      lastModified: number;
    }>;
  };
  settings: {
    soundEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    theme: 'light' | 'dark';
  };
}

const STORAGE_KEY = 'codecraft_save';
const DB_NAME = 'CodeCraftDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameSaves';

export class GamePersistence {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Save game state to localStorage (quick save)
   */
  saveToLocalStorage(state: Partial<RootState>): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const saveData: SavedGameState = {
        version: '1.0.0',
        timestamp: Date.now(),
        player: {
          xp: state.user?.progress.xp || 0,
          level: state.user?.progress.level || 1,
          username: state.user?.username || undefined || undefined
        },
        progress: {
          challengesCompleted: state.challenges?.completed || [],
          tutorialsCompleted: state.tutorial?.completedTutorials || [],
          achievementsUnlocked: state.user?.progress.achievements
            ? (typeof state.user.progress.achievements === 'object' && !Array.isArray(state.user.progress.achievements)
                ? Object.keys(state.user.progress.achievements)
                : state.user.progress.achievements as string[])
            : []
        },
        colony: {
          resources: state.resource?.storage || {},
          buildings: state.building?.placedBuildings || [],
          villagers: state.villagers?.unlockedVillagers || []
        },
        code: {
          savedProjects: {}
        },
        settings: {
          soundEnabled: true,
          musicVolume: 0.7,
          sfxVolume: 0.8,
          theme: 'dark'
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      console.log('✅ Game saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  loadFromLocalStorage(): SavedGameState | null {
    try {
      if (typeof window === 'undefined') return null;

      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved) as SavedGameState;
      console.log('✅ Game loaded from localStorage');
      return data;
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Save game state to IndexedDB (full save with code projects)
   */
  async saveToIndexedDB(state: Partial<RootState>, saveId: string = 'auto'): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initDB();
      }

      if (!this.db) return false;

      const saveData: SavedGameState & { id: string } = {
        id: saveId,
        version: '1.0.0',
        timestamp: Date.now(),
        player: {
          xp: state.user?.progress.xp || 0,
          level: state.user?.progress.level || 1,
          username: state.user?.username || undefined
        },
        progress: {
          challengesCompleted: state.challenges?.completed || [],
          tutorialsCompleted: state.tutorial?.completedTutorials || [],
          achievementsUnlocked: state.user?.progress.achievements
            ? (typeof state.user.progress.achievements === 'object' && !Array.isArray(state.user.progress.achievements)
                ? Object.keys(state.user.progress.achievements)
                : state.user.progress.achievements as string[])
            : []
        },
        colony: {
          resources: state.resource?.storage || {},
          buildings: state.building?.placedBuildings || [],
          villagers: state.villagers?.unlockedVillagers || []
        },
        code: {
          savedProjects: {
            current: {
              html: state.editor?.code.html || '',
              css: state.editor?.code.css || '',
              javascript: state.editor?.code.javascript || '',
              lastModified: Date.now()
            }
          }
        },
        settings: {
          soundEnabled: true,
          musicVolume: 0.7,
          sfxVolume: 0.8,
          theme: 'dark'
        }
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(saveData);

        request.onsuccess = () => {
          console.log('✅ Game saved to IndexedDB');
          resolve(true);
        };
        request.onerror = () => {
          console.error('❌ Failed to save to IndexedDB:', request.error);
          reject(false);
        };
      });
    } catch (error) {
      console.error('❌ IndexedDB save error:', error);
      return false;
    }
  }

  /**
   * Load game state from IndexedDB
   */
  async loadFromIndexedDB(saveId: string = 'auto'): Promise<SavedGameState | null> {
    try {
      if (!this.db) {
        await this.initDB();
      }

      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(saveId);

        request.onsuccess = () => {
          if (request.result) {
            console.log('✅ Game loaded from IndexedDB');
            resolve(request.result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => {
          console.error('❌ Failed to load from IndexedDB:', request.error);
          reject(null);
        };
      });
    } catch (error) {
      console.error('❌ IndexedDB load error:', error);
      return null;
    }
  }

  /**
   * Get all save slots
   */
  async getAllSaves(): Promise<SavedGameState[]> {
    try {
      if (!this.db) {
        await this.initDB();
      }

      if (!this.db) return [];

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject([]);
      });
    } catch (error) {
      console.error('❌ Failed to get all saves:', error);
      return [];
    }
  }

  /**
   * Delete a save slot
   */
  async deleteSave(saveId: string): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initDB();
      }

      if (!this.db) return false;

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(saveId);

        request.onsuccess = () => {
          console.log(`✅ Save ${saveId} deleted`);
          resolve(true);
        };
        request.onerror = () => {
          console.error(`❌ Failed to delete save ${saveId}`);
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ Delete save error:', error);
      return false;
    }
  }

  /**
   * Export save data as JSON file
   */
  exportSave(saveData: SavedGameState): void {
    try {
      const dataStr = JSON.stringify(saveData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `codecraft_save_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ Save exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  /**
   * Import save data from JSON file
   */
  async importSave(file: File): Promise<SavedGameState | null> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as SavedGameState;
      
      // Validate save data
      if (!data.version || !data.player || !data.progress) {
        throw new Error('Invalid save file format');
      }

      console.log('✅ Save imported successfully');
      return data;
    } catch (error) {
      console.error('❌ Import failed:', error);
      return null;
    }
  }

  /**
   * Auto-save functionality
   */
  setupAutoSave(getState: () => Partial<RootState>, intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      const state = getState();
      this.saveToLocalStorage(state);
      
      // Also save to IndexedDB every 5 minutes
      if (Date.now() % 300000 < intervalMs) {
        this.saveToIndexedDB(state);
      }
    }, intervalMs);

    console.log(`✅ Auto-save enabled (every ${intervalMs / 1000}s)`);

    // Return cleanup function
    return () => {
      clearInterval(interval);
      console.log('❌ Auto-save disabled');
    };
  }

  /**
   * Clear all save data (use with caution!)
   */
  async clearAllData(): Promise<boolean> {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }

      // Clear IndexedDB
      if (this.db) {
        return new Promise((resolve) => {
          const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();

          request.onsuccess = () => {
            console.log('✅ All save data cleared');
            resolve(true);
          };
          request.onerror = () => {
            console.error('❌ Failed to clear data');
            resolve(false);
          };
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Clear data error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const gamePersistence = new GamePersistence();

// Helper hooks for React components
export function useSaveGame() {
  const save = (state: Partial<RootState>) => {
    gamePersistence.saveToLocalStorage(state);
    gamePersistence.saveToIndexedDB(state);
  };

  const load = async () => {
    // Try IndexedDB first, fall back to localStorage
    const dbData = await gamePersistence.loadFromIndexedDB();
    if (dbData) return dbData;

    return gamePersistence.loadFromLocalStorage();
  };

  return { save, load };
}

