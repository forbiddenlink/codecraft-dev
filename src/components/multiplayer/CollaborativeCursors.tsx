/**
 * Collaborative Cursors
 * Display cursors and selections from other users in real-time
 */

import React, { useEffect, useRef } from 'react';
import type { CursorPosition, User } from '@/utils/collaborationSystem';

export interface CollaborativeCursorsProps {
  cursors: CursorPosition[];
  users: User[];
  editorRef: React.RefObject<HTMLDivElement>;
  currentLanguage: 'html' | 'css' | 'javascript';
}

export function CollaborativeCursors({
  cursors,
  users,
  editorRef,
  currentLanguage,
}: CollaborativeCursorsProps) {
  const cursorRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter cursors for current language tab
  const visibleCursors = cursors.filter((cursor) => cursor.language === currentLanguage);

  useEffect(() => {
    // Position cursors based on editor coordinates
    visibleCursors.forEach((cursor) => {
      const cursorElement = cursorRefs.current.get(cursor.userId);
      if (!cursorElement || !editorRef.current) return;

      const user = users.find((u) => u.id === cursor.userId);
      if (!user) return;

      // In a real implementation, you'd calculate pixel position from line/column
      // For now, we'll show a simplified version
      const top = cursor.line * 20; // Approximate line height
      const left = cursor.column * 8; // Approximate character width

      cursorElement.style.top = `${top}px`;
      cursorElement.style.left = `${left}px`;
    });
  }, [visibleCursors, editorRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {visibleCursors.map((cursor) => {
        const user = users.find((u) => u.id === cursor.userId);
        if (!user) return null;

        return (
          <div key={cursor.userId}>
            {/* Cursor */}
            <div
              ref={(el) => {
                if (el) cursorRefs.current.set(cursor.userId, el);
              }}
              className="absolute w-0.5 h-5 transition-all duration-100 ease-linear"
              style={{
                backgroundColor: user.color,
                boxShadow: `0 0 8px ${user.color}`,
              }}
            >
              {/* User Label */}
              <div
                className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.username}
              </div>
            </div>

            {/* Selection */}
            {cursor.selection && (
              <div
                className="absolute transition-all duration-100 ease-linear rounded"
                style={{
                  backgroundColor: `${user.color}33`, // 20% opacity
                  border: `1px solid ${user.color}`,
                  top: `${cursor.selection.startLine * 20}px`,
                  left: `${cursor.selection.startColumn * 8}px`,
                  width: `${
                    (cursor.selection.endColumn - cursor.selection.startColumn) * 8
                  }px`,
                  height: `${
                    (cursor.selection.endLine - cursor.selection.startLine + 1) * 20
                  }px`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
