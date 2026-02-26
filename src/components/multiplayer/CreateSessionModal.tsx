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

  const editingOptions = [
    { value: 'all', icon: '✏️', label: 'All can edit', description: 'Everyone can write code simultaneously' },
    { value: 'host-only', icon: '👁️', label: 'Host only', description: 'Only you can edit, others can watch' },
    { value: 'turn-based', icon: '🔄', label: 'Turn-based', description: 'Pass control between participants' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="modal-content max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="bg-accent px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-[var(--radius-sm)] flex items-center justify-center text-2xl">
              ✨
            </div>
            <div>
              <h2 className="text-h3 text-white">Create Session</h2>
              <p className="text-white/80 text-body">Set up your collaboration space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-[var(--radius-sm)] flex items-center justify-center text-white transition-colors focus-ring"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-surface">
          {/* Max Participants */}
          <div>
            <label className="block text-h4 mb-3">
              Maximum Participants
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setSettings({ ...settings, maxParticipants: num })}
                  className={`flex-1 py-2.5 rounded-[var(--radius-sm)] font-medium text-body transition-all focus-ring ${
                    settings.maxParticipants === num
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Editing Mode */}
          <div>
            <label className="block text-h4 mb-3">
              Editing Permissions
            </label>
            <div className="space-y-2">
              {editingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, allowEditing: option.value })}
                  className={`w-full p-4 rounded-[var(--radius-md)] text-left transition-all focus-ring ${
                    settings.allowEditing === option.value
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-text-secondary hover:bg-elevated/80'
                  }`}
                >
                  <div className="font-medium mb-1">{option.icon} {option.label}</div>
                  <div className={`text-body ${settings.allowEditing === option.value ? 'text-white/80' : 'text-text-muted'}`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center justify-between bg-elevated p-4 rounded-[var(--radius-md)] cursor-pointer hover:bg-elevated/80 transition-colors">
              <div>
                <div className="text-h4">🎤 Voice Chat</div>
                <div className="text-small">Enable voice communication</div>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceChat}
                onChange={(e) => setSettings({ ...settings, voiceChat: e.target.checked })}
                className="w-5 h-5 rounded bg-surface border-[rgb(var(--border-subtle))] text-accent focus:ring-accent/50"
              />
            </label>

            <label className="flex items-center justify-between bg-elevated p-4 rounded-[var(--radius-md)] cursor-pointer hover:bg-elevated/80 transition-colors">
              <div>
                <div className="text-h4">👥 Allow Spectators</div>
                <div className="text-small">Let others watch when full</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSpectators}
                onChange={(e) =>
                  setSettings({ ...settings, allowSpectators: e.target.checked })
                }
                className="w-5 h-5 rounded bg-surface border-[rgb(var(--border-subtle))] text-accent focus:ring-accent/50"
              />
            </label>
          </div>

          {/* Challenge Info */}
          {challengeId && (
            <div className="bg-info/10 border border-info/20 rounded-[var(--radius-md)] p-4">
              <div className="flex items-center gap-2 text-info font-medium mb-1">
                🎯 Challenge Mode
              </div>
              <p className="text-body">
                This session is linked to a specific coding challenge
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-elevated/50 border-t border-[rgb(var(--border-subtle))] px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="btn-primary flex-1 focus-ring"
          >
            Create Session
          </button>
        </div>
      </div>
    </div>
  );
}
