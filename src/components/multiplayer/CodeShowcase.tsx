/**
 * Code Showcase
 * Share and browse community code solutions
 */

import React, { useState } from 'react';
import type { SharedCode } from '@/utils/socialFeatures';

export interface CodeShowcaseProps {
  challengeId?: string;
  onClose?: () => void;
}

export function CodeShowcase({ challengeId, onClose }: CodeShowcaseProps) {
  const [sharedCodes, setSharedCodes] = useState<SharedCode[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'views'>('likes');
  const [_filterLanguage, _setFilterLanguage] = useState<'all' | 'html' | 'css' | 'javascript'>(
    'all'
  );

  // const leaderboardSystem = getLeaderboardSystem();

  // Load shared codes
  React.useEffect(() => {
    // In real implementation, fetch from backend
    const mockCodes: SharedCode[] = [];
    setSharedCodes(mockCodes);
  }, [challengeId]);

  const filteredCodes = sharedCodes
    .filter((code) => !challengeId || code.challengeId === challengeId)
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        case 'recent':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
              🎨
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Code Showcase</h2>
              <p className="text-purple-100 text-sm">Browse amazing community solutions</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 border-b border-gray-700 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {/* Sort */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('likes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'likes'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                ❤️ Most Liked
              </button>
              <button
                onClick={() => setSortBy('views')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'views'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👁️ Most Viewed
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🕐 Recent
              </button>
            </div>
          </div>
        </div>

        {/* Code Grid */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {filteredCodes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCodes.map((code) => (
                <div
                  key={code.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                >
                  {/* Preview */}
                  <div className="bg-gray-900 p-4 border-b border-gray-700">
                    <div className="bg-white rounded-lg aspect-video overflow-hidden">
                      {/* Render preview here */}
                      <iframe
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head><style>${code.code.css}</style></head>
                            <body>${code.code.html}</body>
                          </html>
                        `}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {code.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{code.username}</p>
                        <p className="text-gray-400 text-xs">
                          {code.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {code.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {code.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                        <span>❤️</span>
                        <span>{code.likes}</span>
                      </button>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>👁️</span>
                        <span>{code.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-2">No Code Shared Yet</h3>
              <p className="text-gray-400">
                Be the first to share your solution with the community!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
