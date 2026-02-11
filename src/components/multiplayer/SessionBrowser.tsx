/**
 * Session Browser
 * Browse and join active collaboration sessions
 */

import React, { useState, useEffect } from 'react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Collaboration Sessions</h2>
              <p className="text-purple-100 text-sm">Join or create a coding session</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('open')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === 'open'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Open
              </button>
            </div>

            {/* Create Session */}
            <button
              onClick={onCreateSession}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg"
            >
              + Create Session
            </button>
          </div>
        </div>

        {/* Session List */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {filteredSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => {
                const isFull = session.participants.length >= session.settings.maxParticipants;
                const isInSession = session.participants.some((p) => p.id === currentUser.id);

                return (
                  <div
                    key={session.id}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition-all"
                  >
                    {/* Host Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
                        style={{
                          backgroundColor: session.participants.find((p) => p.id === session.hostId)?.color || '#6366f1',
                        }}
                      >
                        {session.participants
                          .find((p) => p.id === session.hostId)
                          ?.username.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {session.participants.find((p) => p.id === session.hostId)?.username}'s Session
                        </p>
                        <p className="text-gray-400 text-xs">
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
                            className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-white text-xs"
                            style={{ backgroundColor: participant.color }}
                            title={participant.username}
                          >
                            {participant.username.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {session.participants.length}/{session.settings.maxParticipants} participants
                      </p>
                    </div>

                    {/* Settings */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                        {session.settings.allowEditing === 'all' ? '✏️ All can edit' : '👁️ View only'}
                      </span>
                      {session.challengeId && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          🎯 Challenge mode
                        </span>
                      )}
                      {isFull && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                          🔒 Full
                        </span>
                      )}
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={() => handleJoin(session.id)}
                      disabled={isFull && !isInSession}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                        isInSession
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : isFull
                          ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
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
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No Sessions Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a collaboration session!'}
              </p>
              <button
                onClick={onCreateSession}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg"
              >
                + Create Session
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-3 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            {filteredSessions.length} active session{filteredSessions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={loadSessions}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
