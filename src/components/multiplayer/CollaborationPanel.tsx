/**
 * Collaboration Panel
 * UI for real-time collaborative coding sessions
 */

import React, { useState, useEffect, useRef } from 'react';
import { getCollaborationSystem } from '@/utils/collaborationSystem';
import type { CollaborationSession, User, ChatMessage, CursorPosition } from '@/utils/collaborationSystem';

export interface CollaborationPanelProps {
  sessionId: string;
  currentUser: User;
  onCodeChange?: (language: 'html' | 'css' | 'javascript', code: string) => void;
  onClose?: () => void;
}

export function CollaborationPanel({
  sessionId,
  currentUser,
  onCodeChange,
  onClose,
}: CollaborationPanelProps) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const collabSystem = getCollaborationSystem();

  useEffect(() => {
    // Load session data
    const loadedSession = collabSystem.getSession(sessionId);
    setSession(loadedSession);
    setMessages(collabSystem.getChatHistory(sessionId));
    setCursors(collabSystem.getCursors(sessionId));

    // Subscribe to session events
    const unsubscribe = collabSystem.on(sessionId, (event) => {
      switch (event.type) {
        case 'user-joined':
          setSession(collabSystem.getSession(sessionId));
          break;
        case 'user-left':
          setSession(collabSystem.getSession(sessionId));
          setCursors(collabSystem.getCursors(sessionId));
          break;
        case 'code-updated':
          if (event.data.userId !== currentUser.id && onCodeChange) {
            onCodeChange(event.data.language, event.data.code);
          }
          break;
        case 'chat-message':
          setMessages((prev) => [...prev, event.data]);
          break;
        case 'cursor-moved':
          setCursors(collabSystem.getCursors(sessionId));
          break;
        case 'session-ended':
          // Handle session end
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId, currentUser.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    collabSystem.sendMessage(sessionId, currentUser.id, newMessage);
    setNewMessage('');
  };

  const handleLeave = () => {
    collabSystem.leaveSession(sessionId, currentUser.id);
    onClose?.();
  };

  const handleKickUser = (userId: string) => {
    if (session?.hostId === currentUser.id) {
      collabSystem.kickUser(sessionId, currentUser.id, userId);
    }
  };

  const isHost = session?.hostId === currentUser.id;
  const canEdit = session?.settings.allowEditing === 'all' ||
                  (session?.settings.allowEditing === 'host-only' && isHost);

  if (!session) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Session not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            👥
          </div>
          <div>
            <h3 className="font-bold text-white">Collaboration Session</h3>
            <p className="text-purple-100 text-xs">
              {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLeave}
          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
        >
          Leave
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 border-b border-gray-700 px-4 flex">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'chat'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'participants'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          👥 Participants ({session.participants.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.type === 'system'
                      ? 'text-center text-gray-500 text-xs py-1'
                      : msg.userId === currentUser.id
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }`}
                >
                  {msg.type === 'system' ? (
                    <span>{msg.message}</span>
                  ) : (
                    <div
                      className={`max-w-[80%] ${
                        msg.userId === currentUser.id
                          ? 'bg-purple-600'
                          : 'bg-gray-700'
                      } rounded-lg px-3 py-2`}
                    >
                      <p className="text-xs text-gray-300 font-medium mb-1">
                        {msg.username}
                      </p>
                      {msg.type === 'code-snippet' && msg.codeSnippet ? (
                        <div className="bg-gray-900 rounded p-2 mb-2 font-mono text-xs overflow-x-auto">
                          <pre className="text-green-400">{msg.codeSnippet.code}</pre>
                        </div>
                      ) : null}
                      <p className="text-white text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="p-4 space-y-3 overflow-y-auto h-full">
            {session.participants.map((participant) => {
              const cursor = cursors.find((c) => c.userId === participant.id);
              return (
                <div
                  key={participant.id}
                  className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: participant.color }}
                    >
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{participant.username}</p>
                        {participant.id === session.hostId && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                            Host
                          </span>
                        )}
                        {participant.id === currentUser.id && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">
                        Level {participant.level} • {participant.xp} XP
                      </p>
                      {cursor && (
                        <p className="text-gray-500 text-xs mt-1">
                          Editing {cursor.language} (Line {cursor.line})
                        </p>
                      )}
                    </div>
                  </div>
                  {isHost && participant.id !== currentUser.id && (
                    <button
                      onClick={() => handleKickUser(participant.id)}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
                    >
                      Kick
                    </button>
                  )}
                </div>
              );
            })}

            {/* Session Info */}
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-3">Session Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Participants:</span>
                  <span className="text-white">{session.settings.maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Editing Mode:</span>
                  <span className="text-white capitalize">
                    {session.settings.allowEditing.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Permission:</span>
                  <span className={canEdit ? 'text-green-400' : 'text-orange-400'}>
                    {canEdit ? 'Can Edit' : 'View Only'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
