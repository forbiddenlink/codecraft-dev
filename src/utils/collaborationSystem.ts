/**
 * Real-Time Collaboration System
 * Enables pair programming, code sharing, and multiplayer features
 */

export interface User {
  id: string;
  username: string;
  avatar?: string;
  color: string; // For cursor/highlight color
  level: number;
  xp: number;
}

export interface CollaborationSession {
  id: string;
  hostId: string;
  participants: User[];
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  challengeId?: string;
  createdAt: Date;
  isActive: boolean;
  settings: {
    maxParticipants: number;
    allowEditing: 'host-only' | 'all' | 'turn-based';
    voiceChat: boolean;
    allowSpectators: boolean;
  };
}

export interface CursorPosition {
  userId: string;
  language: 'html' | 'css' | 'javascript';
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

export interface CodeChange {
  userId: string;
  timestamp: number;
  language: 'html' | 'css' | 'javascript';
  changes: {
    range: {
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    };
    text: string;
  }[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'code-snippet';
  codeSnippet?: {
    language: string;
    code: string;
  };
}

class CollaborationSystem {
  private sessions: Map<string, CollaborationSession> = new Map();
  private cursors: Map<string, Map<string, CursorPosition>> = new Map(); // sessionId -> userId -> position
  private chatHistory: Map<string, ChatMessage[]> = new Map(); // sessionId -> messages

  // Simulated WebSocket connection (in production, connect to real WebSocket server)
  private wsConnections: Map<string, any> = new Map();
  private eventListeners: Map<string, Set<(event: any) => void>> = new Map();

  /**
   * Create a new collaboration session
   */
  createSession(
    hostId: string,
    host: User,
    challengeId?: string,
    settings?: Partial<CollaborationSession['settings']>
  ): CollaborationSession {
    const sessionId = this.generateSessionId();

    const session: CollaborationSession = {
      id: sessionId,
      hostId,
      participants: [host],
      code: {
        html: '',
        css: '',
        javascript: '',
      },
      challengeId,
      createdAt: new Date(),
      isActive: true,
      settings: {
        maxParticipants: settings?.maxParticipants || 4,
        allowEditing: settings?.allowEditing || 'all',
        voiceChat: settings?.voiceChat || false,
        allowSpectators: settings?.allowSpectators || true,
      },
    };

    this.sessions.set(sessionId, session);
    this.cursors.set(sessionId, new Map());
    this.chatHistory.set(sessionId, []);

    // Add system message
    this.addSystemMessage(sessionId, `${host.username} created the session`);

    return session;
  }

  /**
   * Join an existing session
   */
  joinSession(sessionId: string, user: User): { success: boolean; session?: CollaborationSession; error?: string } {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (!session.isActive) {
      return { success: false, error: 'Session is no longer active' };
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      return { success: false, error: 'Session is full' };
    }

    // Check if user already in session
    if (session.participants.some((p) => p.id === user.id)) {
      return { success: true, session };
    }

    session.participants.push(user);
    this.addSystemMessage(sessionId, `${user.username} joined the session`);
    this.broadcastEvent(sessionId, 'user-joined', { user });

    return { success: true, session };
  }

  /**
   * Leave a session
   */
  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const user = session.participants.find((p) => p.id === userId);
    if (!user) return;

    session.participants = session.participants.filter((p) => p.id !== userId);
    this.addSystemMessage(sessionId, `${user.username} left the session`);
    this.broadcastEvent(sessionId, 'user-left', { userId });

    // Remove cursor
    this.cursors.get(sessionId)?.delete(userId);

    // If host leaves and there are still participants, transfer host
    if (userId === session.hostId && session.participants.length > 0) {
      session.hostId = session.participants[0].id;
      this.addSystemMessage(sessionId, `${session.participants[0].username} is now the host`);
    }

    // If no participants left, deactivate session
    if (session.participants.length === 0) {
      session.isActive = false;
    }
  }

  /**
   * Update code in session
   */
  updateCode(sessionId: string, userId: string, language: 'html' | 'css' | 'javascript', code: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Check permissions
    if (session.settings.allowEditing === 'host-only' && userId !== session.hostId) {
      return;
    }

    session.code[language] = code;

    // Broadcast change to other participants
    this.broadcastEvent(sessionId, 'code-updated', {
      userId,
      language,
      code,
      timestamp: Date.now(),
    });
  }

  /**
   * Update cursor position
   */
  updateCursor(sessionId: string, userId: string, position: Omit<CursorPosition, 'userId'>): void {
    const sessionCursors = this.cursors.get(sessionId);
    if (!sessionCursors) return;

    sessionCursors.set(userId, { userId, ...position });

    // Broadcast cursor position
    this.broadcastEvent(sessionId, 'cursor-moved', {
      userId,
      position,
    });
  }

  /**
   * Get all cursor positions for a session
   */
  getCursors(sessionId: string): CursorPosition[] {
    const sessionCursors = this.cursors.get(sessionId);
    if (!sessionCursors) return [];
    return Array.from(sessionCursors.values());
  }

  /**
   * Send chat message
   */
  sendMessage(sessionId: string, userId: string, message: string, codeSnippet?: ChatMessage['codeSnippet']): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const user = session.participants.find((p) => p.id === userId);
    if (!user) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      username: user.username,
      message,
      timestamp: new Date(),
      type: codeSnippet ? 'code-snippet' : 'text',
      codeSnippet,
    };

    const history = this.chatHistory.get(sessionId);
    if (history) {
      history.push(chatMessage);

      // Keep only last 100 messages
      if (history.length > 100) {
        history.shift();
      }
    }

    this.broadcastEvent(sessionId, 'chat-message', chatMessage);
  }

  /**
   * Get chat history
   */
  getChatHistory(sessionId: string): ChatMessage[] {
    return this.chatHistory.get(sessionId) || [];
  }

  /**
   * Add system message
   */
  private addSystemMessage(sessionId: string, message: string): void {
    const chatMessage: ChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'system',
      username: 'System',
      message,
      timestamp: new Date(),
      type: 'system',
    };

    const history = this.chatHistory.get(sessionId);
    if (history) {
      history.push(chatMessage);
    }

    this.broadcastEvent(sessionId, 'chat-message', chatMessage);
  }

  /**
   * Toggle user's editing permission
   */
  toggleUserPermission(sessionId: string, hostId: string, targetUserId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.hostId !== hostId) return;

    // In a real implementation, track per-user permissions
    this.broadcastEvent(sessionId, 'permission-changed', { targetUserId });
  }

  /**
   * Kick user from session (host only)
   */
  kickUser(sessionId: string, hostId: string, targetUserId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.hostId !== hostId || targetUserId === hostId) return;

    this.leaveSession(sessionId, targetUserId);
    this.broadcastEvent(sessionId, 'user-kicked', { userId: targetUserId });
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.isActive);
  }

  /**
   * Subscribe to session events
   */
  on(sessionId: string, callback: (event: any) => void): () => void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, new Set());
    }

    this.eventListeners.get(sessionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(sessionId)?.delete(callback);
    };
  }

  /**
   * Broadcast event to all session participants
   */
  private broadcastEvent(sessionId: string, eventType: string, data: any): void {
    const listeners = this.eventListeners.get(sessionId);
    if (!listeners) return;

    const event = {
      type: eventType,
      sessionId,
      data,
      timestamp: Date.now(),
    };

    listeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * End session
   */
  endSession(sessionId: string, hostId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.hostId !== hostId) return;

    session.isActive = false;
    this.addSystemMessage(sessionId, 'Session ended by host');
    this.broadcastEvent(sessionId, 'session-ended', { sessionId });

    // Clean up after 5 minutes
    setTimeout(() => {
      this.sessions.delete(sessionId);
      this.cursors.delete(sessionId);
      this.chatHistory.delete(sessionId);
      this.eventListeners.delete(sessionId);
    }, 300000);
  }
}

// Singleton instance
let collaborationInstance: CollaborationSystem | null = null;

export function getCollaborationSystem(): CollaborationSystem {
  if (!collaborationInstance) {
    collaborationInstance = new CollaborationSystem();
  }
  return collaborationInstance;
}

// Convenience exports
export const createCollabSession = (
  hostId: string,
  host: User,
  challengeId?: string,
  settings?: Partial<CollaborationSession['settings']>
) => getCollaborationSystem().createSession(hostId, host, challengeId, settings);

export const joinCollabSession = (sessionId: string, user: User) =>
  getCollaborationSystem().joinSession(sessionId, user);

export const leaveCollabSession = (sessionId: string, userId: string) =>
  getCollaborationSystem().leaveSession(sessionId, userId);

export const updateCollabCode = (
  sessionId: string,
  userId: string,
  language: 'html' | 'css' | 'javascript',
  code: string
) => getCollaborationSystem().updateCode(sessionId, userId, language, code);

export const sendCollabMessage = (
  sessionId: string,
  userId: string,
  message: string,
  codeSnippet?: ChatMessage['codeSnippet']
) => getCollaborationSystem().sendMessage(sessionId, userId, message, codeSnippet);
