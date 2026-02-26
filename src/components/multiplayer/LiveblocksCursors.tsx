/**
 * Liveblocks-Connected Collaborative Cursors
 * Wrapper that subscribes to Liveblocks presence and renders cursors
 */

'use client';

import React, { useRef } from 'react';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useLiveblocksPresence } from '@/hooks/useLiveblocksPresence';
import { CollaborativeCursors } from './CollaborativeCursors';

interface LiveblocksCursorsProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Renders collaborative cursors using Liveblocks presence data
 * Only renders when in an active multiplayer session
 */
export function LiveblocksCursors({ editorRef }: LiveblocksCursorsProps) {
  const { isInSession } = useAppSelector((state) => state.multiplayer);
  const language = useAppSelector((state) => state.editor.language);
  const { cursors, users } = useLiveblocksPresence();

  // Don't render if not in a session
  if (!isInSession) return null;

  return (
    <CollaborativeCursors
      cursors={cursors}
      users={users}
      editorRef={editorRef}
      currentLanguage={language}
    />
  );
}
