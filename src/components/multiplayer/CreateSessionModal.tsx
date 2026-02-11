/**
 * Create Session Modal
 * UI for creating a new collaboration session
 */

import React, { useState } from 'react';
import { getCollaborationSystem } from '@/utils/collaborationSystem';
import type { User, CollaborationSession } from '@/utils/collaborationSystem';

export interface CreateSessionModalProps {
  currentUser: User;
  challengeId?: string;
  onSessionCreated: (session: CollaborationSession) => void;
  onClose: () => void;
}

export function CreateSessionModal({
  currentUser,
  challengeId,
  onSessionCreated,
  onClose,
}: CreateSessionModalProps) {
  const [settings, setSettings] = useState({
    maxParticipants: 4,
    allowEditing: 'all' as 'host-only' | 'all' | 'turn-based',
    voiceChat: false,
    allowSpectators: true,
  });

  const collabSystem = getCollaborationSystem();

  const handleCreate = () => {
    const session = collabSystem.createSession(
      currentUser.id,
      currentUser,
      challengeId,
      settings
    );

    onSessionCreated(session);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
              ✨
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Session</h2>
              <p className="text-purple-100 text-sm">Set up your collaboration space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Max Participants */}
          <div>
            <label className="block text-white font-medium mb-2">
              Maximum Participants
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setSettings({ ...settings, maxParticipants: num })}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                    settings.maxParticipants === num
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Editing Mode */}
          <div>
            <label className="block text-white font-medium mb-2">
              Editing Permissions
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSettings({ ...settings, allowEditing: 'all' })}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  settings.allowEditing === 'all'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium mb-1">✏️ All can edit</div>
                <div className="text-sm opacity-80">
                  Everyone can write code simultaneously
                </div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, allowEditing: 'host-only' })}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  settings.allowEditing === 'host-only'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium mb-1">👁️ Host only</div>
                <div className="text-sm opacity-80">
                  Only you can edit, others can watch
                </div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, allowEditing: 'turn-based' })}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  settings.allowEditing === 'turn-based'
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium mb-1">🔄 Turn-based</div>
                <div className="text-sm opacity-80">
                  Pass control between participants
                </div>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-white font-medium">🎤 Voice Chat</div>
                <div className="text-gray-400 text-sm">Enable voice communication</div>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceChat}
                onChange={(e) => setSettings({ ...settings, voiceChat: e.target.checked })}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
              <div>
                <div className="text-white font-medium">👥 Allow Spectators</div>
                <div className="text-gray-400 text-sm">Let others watch when full</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSpectators}
                onChange={(e) =>
                  setSettings({ ...settings, allowSpectators: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>

          {/* Challenge Info */}
          {challengeId && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 font-medium mb-1">
                🎯 Challenge Mode
              </div>
              <p className="text-gray-300 text-sm">
                This session is linked to a specific coding challenge
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg"
          >
            Create Session
          </button>
        </div>
      </div>
    </div>
  );
}
