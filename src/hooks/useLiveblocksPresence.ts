/**
 * Hook for subscribing to Liveblocks presence data
 * Provides real-time cursor positions and user info from collaborators
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { getCollabRoom } from '@/utils/collaborationSystem';
import type { CursorPosition, User } from '@/utils/collaborationSystem';
import type { UserPresence } from '@/utils/liveblocks';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface LiveblocksPresenceData {
  cursors: CursorPosition[];
  users: User[];
  connectionStatus: ConnectionStatus;
  updateCursor: (cursor: Omit<CursorPosition, 'userId'>) => void;
  reconnect: () => void;
}

/**
 * Subscribe to Liveblocks presence for real-time cursor tracking
 * Returns cursors and users from other participants, plus a function to update own cursor
 */
export function useLiveblocksPresence(): LiveblocksPresenceData {
  const { isInSession, sessionId } = useAppSelector((state) => state.multiplayer);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Manually trigger reconnection
  const reconnect = useCallback(() => {
    if (!isInSession || !sessionId) return;

    const room = getCollabRoom(sessionId);
    if (!room) return;

    room.reconnect();
  }, [isInSession, sessionId]);

  // Update own cursor position in Liveblocks
  const updateCursor = useCallback(
    (cursor: Omit<CursorPosition, 'userId'>) => {
      if (!isInSession || !sessionId) return;

      const room = getCollabRoom(sessionId);
      if (!room) return;

      // Update presence with new cursor data
      room.updatePresence({
        cursor: {
          language: cursor.language,
          line: cursor.line,
          column: cursor.column,
          selection: cursor.selection,
        },
      });
    },
    [isInSession, sessionId]
  );

  useEffect(() => {
    if (!isInSession || !sessionId) {
      setCursors([]);
      setUsers([]);
      setConnectionStatus('disconnected');
      return;
    }

    const room = getCollabRoom(sessionId);
    if (!room) return;

    // Subscribe to connection status changes
    const unsubscribeStatus = room.subscribe('status', (status) => {
      setConnectionStatus(status as ConnectionStatus);
    });

    // Get initial status
    setConnectionStatus(room.getStatus() as ConnectionStatus);

    // Subscribe to presence changes from other users
    const unsubscribe = room.subscribe('others', (others) => {
      const newCursors: CursorPosition[] = [];
      const newUsers: User[] = [];

      others.forEach((other) => {
        const presence = other.presence as unknown as UserPresence | null;
        if (!presence) return;

        // Add user info
        newUsers.push({
          id: presence.id,
          username: presence.username,
          color: presence.color,
          level: 1, // Default level for collaborators
          xp: 0,
        });

        // Add cursor if present
        if (presence.cursor) {
          newCursors.push({
            userId: presence.id,
            language: presence.cursor.language,
            line: presence.cursor.line,
            column: presence.cursor.column,
            selection: presence.cursor.selection,
          });
        }
      });

      setCursors(newCursors);
      setUsers(newUsers);
    });

    // Initial fetch of others
    const others = room.getOthers();
    const initialCursors: CursorPosition[] = [];
    const initialUsers: User[] = [];

    others.forEach((other) => {
      const presence = other.presence as unknown as UserPresence | null;
      if (!presence) return;

      initialUsers.push({
        id: presence.id,
        username: presence.username,
        color: presence.color,
        level: 1,
        xp: 0,
      });

      if (presence.cursor) {
        initialCursors.push({
          userId: presence.id,
          language: presence.cursor.language,
          line: presence.cursor.line,
          column: presence.cursor.column,
          selection: presence.cursor.selection,
        });
      }
    });

    setCursors(initialCursors);
    setUsers(initialUsers);

    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [isInSession, sessionId]);

  return { cursors, users, connectionStatus, updateCursor, reconnect };
}
