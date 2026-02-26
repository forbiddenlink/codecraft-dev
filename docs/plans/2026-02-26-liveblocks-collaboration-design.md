# Liveblocks Collaboration System Design

**Date:** 2026-02-26
**Status:** Approved

## Goal

Replace the in-memory `collaborationSystem.ts` with a Liveblocks-backed implementation to enable real cross-device multiplayer.

## Architecture

### Current State
- `collaborationSystem.ts` uses in-memory Maps
- Works only within one browser tab
- UI components already built (SessionBrowser, CreateSessionModal, CollaborativeCursors)

### Target State
- Same API surface preserved
- Liveblocks handles real-time sync
- Yjs for code collaboration (already in `multiplayer.ts`)

## Implementation

### Room Structure

**Room ID format:** `codecraft-{6-char-code}` (e.g., `codecraft-ABC123`)

**Presence (per user):**
```typescript
{
  id: string;
  username: string;
  color: string;
  cursor?: { language, line, column, selection };
  isActive: boolean;
}
```

**Storage (shared):**
```typescript
{
  hostId: string;
  challengeId?: string;
  settings: SessionSettings;
  chatMessages: ChatMessage[];
}
```

**Code sync:** Yjs text types per language (html, css, javascript)

## Phases

### Phase 1: Core Liveblocks Integration
1. Create `src/utils/liveblocks.ts` - Client setup with types
2. Rewrite `collaborationSystem.ts` to use Liveblocks
3. Preserve existing exports

### Phase 2: Wire Up UI
4. Connect MonacoEditor to collaborative editing
5. Update CollaborativeCursors for Liveblocks presence
6. Test create/join/leave flow

### Phase 3: Polish
7. Connection status indicator
8. Disconnection handling
9. Tests

## Files

**Modify:**
- `src/utils/collaborationSystem.ts` - Rewrite internals
- `src/components/editor/MonacoEditor.tsx` - Wire up collab

**Create:**
- `src/utils/liveblocks.ts` - Client setup

**Unchanged:**
- `src/components/multiplayer/*` - UI stays same
- `src/utils/multiplayer.ts` - Primitives already exist
