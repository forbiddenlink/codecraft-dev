/**
 * Multiplayer Infrastructure for CodeCraft
 * Provides Liveblocks integration for collaborative coding and game sessions
 *
 * Dependencies (install when ready to enable):
 * npm install @liveblocks/client @liveblocks/react yjs y-monaco
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Player {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isActive: boolean;
}

export interface RoomState {
  code: string;
  language: 'html' | 'css' | 'javascript';
  challengeId: string | null;
  players: Player[];
  hostId: string;
  gamePhase: 'lobby' | 'coding' | 'review' | 'completed';
}

export interface RoomConfig {
  roomId: string;
  userId: string;
  userName: string;
  userColor?: string;
  isHost?: boolean;
}

// =============================================================================
// ROOM MANAGEMENT
// =============================================================================

// Check if multiplayer is enabled
export const isMultiplayerEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER === 'true' &&
         !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;
};

// Generate a random room code (6 characters, alphanumeric)
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a player color
export const generatePlayerColor = (): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Purple
    '#85C1E9', // Sky
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// =============================================================================
// LIVEBLOCKS INTEGRATION (Lazy loaded)
// =============================================================================

interface LiveblocksClient {
  enterRoom: (roomId: string, options: Record<string, unknown>) => {
    room: {
      subscribe: (callback: (state: unknown) => void) => () => void;
      getPresence: () => unknown;
      updatePresence: (presence: unknown) => void;
      broadcastEvent: (event: unknown) => void;
    };
    leave: () => void;
  };
}

let liveblocksClient: LiveblocksClient | null = null;

const getLiveblocksClient = async (): Promise<LiveblocksClient | null> => {
  if (!isMultiplayerEnabled()) return null;

  if (!liveblocksClient) {
    try {
      const { createClient } = (await import(/* webpackIgnore: true */ '@liveblocks/client' as string)) as {
        createClient: (options: { publicApiKey: string }) => LiveblocksClient;
      };
      liveblocksClient = createClient({
        publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
      });
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Liveblocks not available. Install with: npm install @liveblocks/client @liveblocks/react');
      }
      return null;
    }
  }

  return liveblocksClient;
};

// =============================================================================
// ROOM OPERATIONS
// =============================================================================

/**
 * Join or create a multiplayer room
 */
export const joinRoom = async (config: RoomConfig): Promise<{
  room: unknown;
  leave: () => void;
} | null> => {
  const client = await getLiveblocksClient();
  if (!client) return null;

  const { room, leave } = client.enterRoom(config.roomId, {
    initialPresence: {
      id: config.userId,
      name: config.userName,
      color: config.userColor || generatePlayerColor(),
      cursor: null,
      selection: null,
      isActive: true,
    },
  });

  return { room, leave };
};

/**
 * Create a new room with a generated code
 */
export const createRoom = async (
  userId: string,
  userName: string
): Promise<{ roomCode: string; room: unknown; leave: () => void } | null> => {
  const roomCode = generateRoomCode();
  const result = await joinRoom({
    roomId: `codecraft-${roomCode}`,
    userId,
    userName,
    isHost: true,
  });

  if (!result) return null;

  return {
    roomCode,
    ...result,
  };
};

// =============================================================================
// COLLABORATIVE MONACO EDITOR SETUP
// =============================================================================

/**
 * Set up collaborative editing with Yjs and Monaco
 * Call this after joining a room to enable real-time code collaboration
 */
export const setupCollaborativeEditor = async (
  _room: unknown,
  _editorInstance: unknown
): Promise<{ cleanup: () => void } | null> => {
  if (!isMultiplayerEnabled()) return null;

  try {
    // These would be dynamically imported when multiplayer is enabled
    // const Y = await import('yjs');
    // const { MonacoBinding } = await import('y-monaco');
    // const { LiveblocksYjsProvider } = await import('@liveblocks/yjs');

    // Implementation would set up:
    // 1. Yjs document for CRDT-based text synchronization
    // 2. Liveblocks provider for WebSocket transport
    // 3. Monaco binding for editor integration

    console.log('Collaborative editor setup - dependencies not installed');
    return {
      cleanup: () => {
        // Cleanup bindings
      },
    };
  } catch {
    console.warn('Failed to setup collaborative editor');
    return null;
  }
};

// =============================================================================
// TEACHER DASHBOARD SUPPORT
// =============================================================================

export interface StudentProgress {
  id: string;
  name: string;
  challengeId: string | null;
  currentCode: string;
  score: number;
  attempts: number;
  isComplete: boolean;
}

/**
 * Get all student progress in a room (for teachers)
 */
export const getStudentProgress = async (_roomId: string): Promise<StudentProgress[]> => {
  // Would query room state and aggregate student progress
  // Implementation depends on room storage structure
  return [];
};

/**
 * Broadcast a message to all students
 */
export const broadcastToStudents = async (
  _roomId: string,
  _message: { type: string; payload: unknown }
): Promise<void> => {
  // Would use room.broadcastEvent to send to all participants
};
