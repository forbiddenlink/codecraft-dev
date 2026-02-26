/**
 * Tests for Liveblocks-backed Collaboration System
 */

// Mock Liveblocks
const mockRoom = {
  getPresence: jest.fn(() => ({})),
  updatePresence: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
  broadcastEvent: jest.fn(),
  getStorage: jest.fn(() => ({
    root: {
      get: jest.fn(),
      set: jest.fn(),
    },
  })),
  batch: jest.fn((fn: () => void) => fn()),
};

const mockLeave = jest.fn();

jest.mock('../liveblocks', () => ({
  isLiveblocksEnabled: jest.fn(() => true),
  getLiveblocksClient: jest.fn(() => ({})),
  enterCollaborationRoom: jest.fn(() => ({
    room: mockRoom,
    leave: mockLeave,
  })),
  generateRoomCode: jest.fn(() => 'TEST12'),
}));

import {
  getCollaborationSystem,
  createCollabSession,
  joinCollabSession,
  leaveCollabSession,
} from '../collaborationSystem';
import type { User } from '../collaborationSystem';

describe('CollaborationSystem with Liveblocks', () => {
  const testUser: User = {
    id: 'user1',
    username: 'TestUser',
    color: '#FF0000',
    level: 1,
    xp: 0,
  };

  const testUser2: User = {
    id: 'user2',
    username: 'TestUser2',
    color: '#00FF00',
    level: 2,
    xp: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('creates a session with valid ID and host', () => {
      const session = createCollabSession(testUser.id, testUser);

      expect(session).toBeDefined();
      expect(session.id).toBeTruthy();
      expect(session.hostId).toBe(testUser.id);
      expect(session.participants).toContainEqual(testUser);
      expect(session.isActive).toBe(true);
    });

    it('creates session with challenge ID when provided', () => {
      const session = createCollabSession(testUser.id, testUser, 'challenge-123');

      expect(session.challengeId).toBe('challenge-123');
    });

    it('applies custom settings', () => {
      const session = createCollabSession(testUser.id, testUser, undefined, {
        maxParticipants: 6,
        allowEditing: 'host-only',
      });

      expect(session.settings.maxParticipants).toBe(6);
      expect(session.settings.allowEditing).toBe('host-only');
    });
  });

  describe('joinSession', () => {
    it('adds user to existing session', () => {
      const session = createCollabSession(testUser.id, testUser);
      const result = joinCollabSession(session.id, testUser2);

      expect(result.success).toBe(true);
      expect(result.session?.participants).toHaveLength(2);
    });

    it('fails when session is full', () => {
      const session = createCollabSession(testUser.id, testUser, undefined, {
        maxParticipants: 1,
      });

      const result = joinCollabSession(session.id, testUser2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('full');
    });

    it('fails for non-existent session', () => {
      const result = joinCollabSession('nonexistent', testUser);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('leaveSession', () => {
    it('removes user from session', () => {
      const session = createCollabSession(testUser.id, testUser);
      joinCollabSession(session.id, testUser2);

      leaveCollabSession(session.id, testUser2.id);

      const updatedSession = getCollaborationSystem().getSession(session.id);
      expect(updatedSession?.participants).toHaveLength(1);
      expect(updatedSession?.participants[0].id).toBe(testUser.id);
    });

    it('transfers host when host leaves', () => {
      const session = createCollabSession(testUser.id, testUser);
      joinCollabSession(session.id, testUser2);

      leaveCollabSession(session.id, testUser.id);

      const updatedSession = getCollaborationSystem().getSession(session.id);
      expect(updatedSession?.hostId).toBe(testUser2.id);
    });

    it('deactivates session when last user leaves', () => {
      const session = createCollabSession(testUser.id, testUser);

      leaveCollabSession(session.id, testUser.id);

      const updatedSession = getCollaborationSystem().getSession(session.id);
      expect(updatedSession?.isActive).toBe(false);
    });
  });
});
