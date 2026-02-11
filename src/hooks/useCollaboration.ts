/**
 * Collaboration Hook
 * React hook for managing collaboration sessions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCollaborationSystem } from '@/utils/collaborationSystem';
import type {
  CollaborationSession,
  User,
  ChatMessage,
  CursorPosition,
} from '@/utils/collaborationSystem';

export interface UseCollaborationOptions {
  sessionId: string;
  currentUser: User;
  onCodeChange?: (language: 'html' | 'css' | 'javascript', code: string) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onSessionEnded?: () => void;
}

export interface UseCollaborationReturn {
  session: CollaborationSession | null;
  messages: ChatMessage[];
  cursors: CursorPosition[];
  isConnected: boolean;
  isHost: boolean;
  canEdit: boolean;
  sendMessage: (message: string, codeSnippet?: ChatMessage['codeSnippet']) => void;
  updateCode: (language: 'html' | 'css' | 'javascript', code: string) => void;
  updateCursor: (position: Omit<CursorPosition, 'userId'>) => void;
  leaveSession: () => void;
  kickUser: (userId: string) => void;
  endSession: () => void;
}

export function useCollaboration(options: UseCollaborationOptions): UseCollaborationReturn {
  const {
    sessionId,
    currentUser,
    onCodeChange,
    onUserJoined,
    onUserLeft,
    onSessionEnded,
  } = options;

  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const collabSystem = getCollaborationSystem();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load initial data
  useEffect(() => {
    const loadedSession = collabSystem.getSession(sessionId);
    setSession(loadedSession);
    setMessages(collabSystem.getChatHistory(sessionId));
    setCursors(collabSystem.getCursors(sessionId));
    setIsConnected(!!loadedSession);

    // Subscribe to events
    unsubscribeRef.current = collabSystem.on(sessionId, handleEvent);

    return () => {
      unsubscribeRef.current?.();
    };
  }, [sessionId]);

  const handleEvent = useCallback(
    (event: any) => {
      switch (event.type) {
        case 'user-joined':
          setSession(collabSystem.getSession(sessionId));
          onUserJoined?.(event.data.user);
          break;

        case 'user-left':
          setSession(collabSystem.getSession(sessionId));
          setCursors(collabSystem.getCursors(sessionId));
          onUserLeft?.(event.data.userId);
          break;

        case 'code-updated':
          if (event.data.userId !== currentUser.id && onCodeChange) {
            onCodeChange(event.data.language, event.data.code);
          }
          break;

        case 'chat-message':
          setMessages((prev) => [...prev, event.data]);
          break;

        case 'cursor-moved':
          setCursors(collabSystem.getCursors(sessionId));
          break;

        case 'session-ended':
          setIsConnected(false);
          onSessionEnded?.();
          break;

        case 'user-kicked':
          if (event.data.userId === currentUser.id) {
            setIsConnected(false);
            onSessionEnded?.();
          }
          break;
      }
    },
    [sessionId, currentUser.id, onCodeChange, onUserJoined, onUserLeft, onSessionEnded]
  );

  const sendMessage = useCallback(
    (message: string, codeSnippet?: ChatMessage['codeSnippet']) => {
      collabSystem.sendMessage(sessionId, currentUser.id, message, codeSnippet);
    },
    [sessionId, currentUser.id]
  );

  const updateCode = useCallback(
    (language: 'html' | 'css' | 'javascript', code: string) => {
      collabSystem.updateCode(sessionId, currentUser.id, language, code);
    },
    [sessionId, currentUser.id]
  );

  const updateCursor = useCallback(
    (position: Omit<CursorPosition, 'userId'>) => {
      collabSystem.updateCursor(sessionId, currentUser.id, position);
    },
    [sessionId, currentUser.id]
  );

  const leaveSession = useCallback(() => {
    collabSystem.leaveSession(sessionId, currentUser.id);
    setIsConnected(false);
  }, [sessionId, currentUser.id]);

  const kickUser = useCallback(
    (userId: string) => {
      if (session?.hostId === currentUser.id) {
        collabSystem.kickUser(sessionId, currentUser.id, userId);
      }
    },
    [sessionId, currentUser.id, session]
  );

  const endSession = useCallback(() => {
    if (session?.hostId === currentUser.id) {
      collabSystem.endSession(sessionId, currentUser.id);
      setIsConnected(false);
    }
  }, [sessionId, currentUser.id, session]);

  const isHost = session?.hostId === currentUser.id;
  const canEdit =
    session?.settings.allowEditing === 'all' ||
    (session?.settings.allowEditing === 'host-only' && isHost);

  return {
    session,
    messages,
    cursors,
    isConnected,
    isHost,
    canEdit,
    sendMessage,
    updateCode,
    updateCursor,
    leaveSession,
    kickUser,
    endSession,
  };
}
