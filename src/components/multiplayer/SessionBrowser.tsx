/**
 * Session Browser
 * Browse and join active collaboration sessions
 */

import React, { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { getCollaborationSystem } from '@/utils/collaborationSystem';
import type { CollaborationSession, User } from '@/utils/collaborationSystem';

export interface SessionBrowserProps {
  currentUser: User;
  onJoinSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onClose?: () => void;
}

export function SessionBrowser({
  currentUser,
  onJoinSession,
  onCreateSession,
  onClose,
}: SessionBrowserProps) {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'friends'>('all');
  const [sessionsListRef] = useAutoAnimate<HTMLDivElement>();

  const collabSystem = getCollaborationSystem();

  useEffect(() => {
    loadSessions();

    // Refresh every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = () => {
    const activeSessions = collabSystem.getActiveSessions();
    setSessions(activeSessions);
  };

  const filteredSessions = sessions.filter((session) => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      session.participants.some((p) =>
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Mode filter
    const isFull = session.participants.length >= session.settings.maxParticipants;
    const matchesMode =
      filterMode === 'all' ||
      (filterMode === 'open' && !isFull);

    return matchesSearch && matchesMode;
  });

  const handleJoin = (sessionId: string) => {
    const result = collabSystem.joinSession(sessionId, currentUser);
    if (result.success) {
      onJoinSession(sessionId);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-accent px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-[var(--radius-sm)] flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <h2 className="text-h2 text-white">Collaboration Sessions</h2>
              <p className="text-white/80 text-body">Join or create a coding session</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-[var(--radius-sm)] flex items-center justify-center text-white transition-colors focus-ring"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-elevated/50 border-b border-[rgb(var(--border-subtle))] px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-elevated text-text-secondary rounded-[var(--radius-sm)] px-4 py-2.5 text-body border border-[rgb(var(--border-subtle))] focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 placeholder:text-text-muted"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(['all', 'open'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-4 py-2.5 rounded-[var(--radius-sm)] text-body font-medium transition-colors focus-ring ${
                    filterMode === mode
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Create Session */}
            <button
              onClick={onCreateSession}
              className="btn-primary focus-ring"
            >
              + Create Session
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 bg-surface">
          {filteredSessions.length > 0 ? (
            <div ref={sessionsListRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => {
                const isFull = session.participants.length >= session.settings.maxParticipants;
                const isInSession = session.participants.some((p) => p.id === currentUser.id);

                return (
                  <div
                    key={session.id}
                    className="card card-interactive"
                  >
                    {/* Host Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white"
                        style={{
                          backgroundColor: session.participants.find((p) => p.id === session.hostId)?.color || '#8b5cf6',
                        }}
                      >
                        {session.participants
                          .find((p) => p.id === session.hostId)
                          ?.username.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-h4">
                          {session.participants.find((p) => p.id === session.hostId)?.username}'s Session
                        </p>
                        <p className="text-small">
                          Created {new Date(session.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {session.participants.slice(0, 4).map((participant) => (
                          <div
                            key={participant.id}
                            className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center font-semibold text-white text-xs"
                            style={{ backgroundColor: participant.color }}
                            title={participant.username}
                          >
                            {participant.username.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <p className="text-small">
                        {session.participants.length}/{session.settings.maxParticipants} participants
                      </p>
                    </div>

                    {/* Settings */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-[var(--radius-sm)] border border-accent/20">
                        {session.settings.allowEditing === 'all' ? '✏️ All can edit' : '👁️ View only'}
                      </span>
                      {session.challengeId && (
                        <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-[var(--radius-sm)] border border-info/20">
                          🎯 Challenge mode
                        </span>
                      )}
                      {isFull && (
                        <span className="px-2 py-1 bg-error/10 text-error text-xs rounded-[var(--radius-sm)] border border-error/20">
                          🔒 Full
                        </span>
                      )}
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoin(session.id)}
                      disabled={isFull && !isInSession}
                      className={`w-full py-2.5 rounded-[var(--radius-sm)] font-medium text-body transition-colors focus-ring ${
                        isInSession
                          ? 'bg-success hover:bg-success/90 text-white'
                          : isFull
                          ? 'bg-elevated cursor-not-allowed text-text-muted'
                          : 'bg-accent hover:bg-accent-hover text-white'
                      }`}
                    >
                      {isInSession ? '✓ Joined' : isFull ? 'Session Full' : 'Join Session'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 opacity-80">🔍</div>
              <h3 className="text-h3 mb-2">No Sessions Found</h3>
              <p className="text-body mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a collaboration session!'}
              </p>
              <button
                onClick={onCreateSession}
                className="btn-primary focus-ring"
              >
                + Create Session
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-elevated/50 border-t border-[rgb(var(--border-subtle))] px-6 py-3 flex items-center justify-between">
          <p className="text-small">
            {filteredSessions.length} active session{filteredSessions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={loadSessions}
            className="text-accent hover:text-accent-hover text-body font-medium transition-colors focus-ring"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
