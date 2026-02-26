/**
 * Tests for Liveblocks client setup
 */

// Mock room object
const mockRoom = {
  getPresence: jest.fn(() => ({})),
  updatePresence: jest.fn(),
  subscribe: jest.fn(() => jest.fn()), // returns unsubscribe
  broadcastEvent: jest.fn(),
};

const mockLeave = jest.fn();
const mockEnterRoom = jest.fn(() => ({
  room: mockRoom,
  leave: mockLeave,
}));

// Mock Liveblocks before imports
jest.mock('@liveblocks/client', () => ({
  createClient: jest.fn(() => ({
    enterRoom: mockEnterRoom,
  })),
}));

import {
  getLiveblocksClient,
  isLiveblocksEnabled,
  enterCollaborationRoom,
  generateRoomCode,
} from '../liveblocks';

describe('Liveblocks Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isLiveblocksEnabled', () => {
    it('returns false when NEXT_PUBLIC_ENABLE_MULTIPLAYER is not set', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER;
      delete process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

      expect(isLiveblocksEnabled()).toBe(false);
    });

    it('returns false when NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not set', () => {
      process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER = 'true';
      delete process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

      expect(isLiveblocksEnabled()).toBe(false);
    });

    it('returns true when both env vars are set', () => {
      process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER = 'true';
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY = 'pk_test_123';

      expect(isLiveblocksEnabled()).toBe(true);
    });
  });

  describe('getLiveblocksClient', () => {
    it('returns null when Liveblocks is not enabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER;

      const client = getLiveblocksClient();

      expect(client).toBeNull();
    });

    it('returns client instance when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER = 'true';
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY = 'pk_test_123';

      const client = getLiveblocksClient();

      expect(client).not.toBeNull();
    });

    it('returns same instance on subsequent calls (singleton)', () => {
      process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER = 'true';
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY = 'pk_test_123';

      const client1 = getLiveblocksClient();
      const client2 = getLiveblocksClient();

      expect(client1).toBe(client2);
    });
  });

  describe('generateRoomCode', () => {
    it('generates a 6-character alphanumeric code', () => {
      const code = generateRoomCode();

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    it('excludes confusing characters (O, 0, I, 1, L)', () => {
      // Generate multiple codes to increase confidence
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode();
        expect(code).not.toMatch(/[OIL01]/);
      }
    });
  });

  describe('enterCollaborationRoom', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER = 'true';
      process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY = 'pk_test_123';
      mockLeave.mockClear();
    });

    it('returns null when Liveblocks is not enabled', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER;

      const result = enterCollaborationRoom('ABC123', {
        id: 'user1',
        username: 'TestUser',
        color: '#FF0000',
      });

      expect(result).toBeNull();
    });

    it('returns room and leave function when enabled', () => {
      const result = enterCollaborationRoom('ABC123', {
        id: 'user1',
        username: 'TestUser',
        color: '#FF0000',
      });

      expect(result).not.toBeNull();
      expect(result?.room).toBe(mockRoom);
      expect(typeof result?.leave).toBe('function');
    });

    it('formats room ID with codecraft prefix', () => {
      mockEnterRoom.mockClear();

      enterCollaborationRoom('ABC123', {
        id: 'user1',
        username: 'TestUser',
        color: '#FF0000',
      });

      expect(mockEnterRoom).toHaveBeenCalledWith(
        'codecraft-ABC123',
        expect.any(Object)
      );
    });

    it('sets initial presence with user info', () => {
      mockEnterRoom.mockClear();

      enterCollaborationRoom('XYZ789', {
        id: 'user1',
        username: 'TestUser',
        color: '#FF0000',
      });

      expect(mockEnterRoom).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          initialPresence: expect.objectContaining({
            id: 'user1',
            username: 'TestUser',
            color: '#FF0000',
            isActive: true,
          }),
        })
      );
    });
  });
});
