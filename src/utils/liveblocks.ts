/**
 * Liveblocks Client Setup
 * Singleton client for real-time collaboration
 */

import { createClient, Client, Room } from '@liveblocks/client';

let client: Client | null = null;

// Presence type for collaboration
export interface UserPresence {
  id: string;
  username: string;
  color: string;
  cursor?: {
    language: 'html' | 'css' | 'javascript';
    line: number;
    column: number;
    selection?: {
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    };
  };
  isActive: boolean;
}

/**
 * Check if Liveblocks is enabled via environment variables
 */
export function isLiveblocksEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER === 'true' &&
    !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
  );
}

/**
 * Get the Liveblocks client singleton
 * Returns null if Liveblocks is not enabled
 */
export function getLiveblocksClient(): Client | null {
  if (!isLiveblocksEnabled()) return null;

  if (!client) {
    client = createClient({
      publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
    });
  }

  return client;
}

/**
 * Generate a random room code (6 characters, alphanumeric)
 * Excludes confusing characters: O, 0, I, 1, L
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Enter a collaboration room
 * Returns room instance and leave function, or null if not enabled
 */
export function enterCollaborationRoom(
  roomCode: string,
  user: { id: string; username: string; color: string }
): { room: Room; leave: () => void } | null {
  const liveblocksClient = getLiveblocksClient();
  if (!liveblocksClient) return null;

  const roomId = `codecraft-${roomCode}`;

  const { room, leave } = liveblocksClient.enterRoom(roomId, {
    initialPresence: {
      id: user.id,
      username: user.username,
      color: user.color,
      cursor: undefined,
      isActive: true,
    },
  });

  return { room, leave };
}
