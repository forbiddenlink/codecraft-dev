/**
 * Create Session Modal
 * UI for creating a new collaboration session
 */

'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Pencil,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  Mic,
  Users,
  Target,
} from 'lucide-react';
import { getCollaborationSystem } from '@/utils/collaborationSystem';
import type { User, CollaborationSession } from '@/utils/collaborationSystem';
import { Icon } from '@/components/ui/Icon';

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
      settings,
    );
    onSessionCreated(session);
  };

  const editingOptions: {
    value: 'all' | 'host-only' | 'turn-based';
    icon: LucideIcon;
    label: string;
    description: string;
  }[] = [
    {
      value: 'all',
      icon: Pencil,
      label: 'All can edit',
      description: 'Everyone can write code simultaneously',
    },
    {
      value: 'host-only',
      icon: Eye,
      label: 'Host only',
      description: 'Only you can edit, others can watch',
    },
    {
      value: 'turn-based',
      icon: RefreshCw,
      label: 'Turn-based',
      description: 'Pass control between participants',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="modal-content animate-slide-up w-full max-w-md">
        <div className="flex items-center justify-between bg-[rgb(var(--accent))] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 text-white">
              <Icon icon={Sparkles} size={18} />
            </div>
            <div>
              <h2 className="text-h3 text-white">Create Session</h2>
              <p className="text-body text-white/80">Set up your collaboration space</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <Icon icon={X} size={14} />
          </button>
        </div>

        <div className="space-y-6 bg-surface p-6">
          <div>
            <label className="mb-3 block text-h4">Maximum participants</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSettings({ ...settings, maxParticipants: num })}
                  className={`focus-ring flex-1 rounded-[var(--radius-sm)] py-2.5 text-body font-medium transition-all ${
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

          <div>
            <label className="mb-3 block text-h4">Editing permissions</label>
            <div className="space-y-2">
              {editingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSettings({ ...settings, allowEditing: option.value })}
                  className={`focus-ring w-full rounded-[var(--radius-md)] p-4 text-left transition-all ${
                    settings.allowEditing === option.value
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-text-secondary hover:bg-elevated/80'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <Icon icon={option.icon} size={15} />
                    {option.label}
                  </div>
                  <div
                    className={`text-body ${
                      settings.allowEditing === option.value ? 'text-white/80' : 'text-text-muted'
                    }`}
                  >
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] bg-elevated p-4 transition-colors hover:bg-elevated/80">
              <div className="flex items-start gap-2">
                <Icon icon={Mic} size={16} className="mt-0.5 text-[rgb(var(--accent-subtle))]" />
                <div>
                  <div className="text-h4">Voice chat</div>
                  <div className="text-small">Enable voice communication</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceChat}
                onChange={(e) => setSettings({ ...settings, voiceChat: e.target.checked })}
                className="h-5 w-5 rounded border-[rgb(var(--border-subtle))] bg-surface text-accent focus:ring-accent/50"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] bg-elevated p-4 transition-colors hover:bg-elevated/80">
              <div className="flex items-start gap-2">
                <Icon icon={Users} size={16} className="mt-0.5 text-[rgb(var(--accent-subtle))]" />
                <div>
                  <div className="text-h4">Allow spectators</div>
                  <div className="text-small">Let others watch when full</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSpectators}
                onChange={(e) =>
                  setSettings({ ...settings, allowSpectators: e.target.checked })
                }
                className="h-5 w-5 rounded border-[rgb(var(--border-subtle))] bg-surface text-accent focus:ring-accent/50"
              />
            </label>
          </div>

          {challengeId && (
            <div className="rounded-[var(--radius-md)] border border-info/20 bg-info/10 p-4">
              <div className="mb-1 flex items-center gap-2 font-medium text-info">
                <Icon icon={Target} size={15} />
                Challenge mode
              </div>
              <p className="text-body">This session is linked to a specific coding challenge</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-[rgb(var(--border-subtle))] bg-elevated/50 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary focus-ring flex-1">
            Cancel
          </button>
          <button type="button" onClick={handleCreate} className="btn-primary focus-ring flex-1">
            Create session
          </button>
        </div>
      </div>
    </div>
  );
}
