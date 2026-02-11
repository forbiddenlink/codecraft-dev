/**
 * Achievement Progress Tracker
 * Shows progress towards unlocking achievements
 */

import React from 'react';

export interface AchievementProgressProps {
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    progress: number; // 0-100
    isUnlocked: boolean;
    requirement: string;
  }[];
  onAchievementClick?: (id: string) => void;
}

const rarityColors = {
  common: {
    bg: 'from-gray-600/20 to-gray-700/20',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
  },
  rare: {
    bg: 'from-blue-600/20 to-blue-700/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  epic: {
    bg: 'from-purple-600/20 to-purple-700/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  legendary: {
    bg: 'from-yellow-600/20 to-orange-600/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
  },
};

export function AchievementProgress({
  achievements,
  onAchievementClick,
}: AchievementProgressProps) {
  const categories = {
    unlocked: achievements.filter((a) => a.isUnlocked),
    inProgress: achievements.filter((a) => !a.isUnlocked && a.progress > 0),
    locked: achievements.filter((a) => !a.isUnlocked && a.progress === 0),
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🏆 Achievements</h2>
          <p className="text-gray-400 text-sm">
            {categories.unlocked.length} / {achievements.length} Unlocked
          </p>
        </div>
        {/* Progress Ring */}
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${
                2 * Math.PI * 36 * (1 - categories.unlocked.length / achievements.length)
              }`}
              className="text-yellow-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {Math.round((categories.unlocked.length / achievements.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {categories.unlocked.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>✅</span>
            Unlocked ({categories.unlocked.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.unlocked.map((achievement) => {
              const colors = rarityColors[achievement.rarity];
              return (
                <div
                  key={achievement.id}
                  className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => onAchievementClick?.(achievement.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{achievement.title}</p>
                      <p className={`text-xs uppercase ${colors.text}`}>
                        {achievement.rarity}
                      </p>
                    </div>
                    <span className="text-green-400">✓</span>
                  </div>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {categories.inProgress.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>⏳</span>
            In Progress ({categories.inProgress.length})
          </h3>
          <div className="space-y-3">
            {categories.inProgress.map((achievement) => {
              const colors = rarityColors[achievement.rarity];
              return (
                <div
                  key={achievement.id}
                  className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg p-4`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl opacity-60">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{achievement.title}</p>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{achievement.requirement}</span>
                      <span className="text-white font-bold">{achievement.progress}%</span>
                    </div>
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${
                          colors.text.replace('text-', 'from-')
                        } to-white transition-all duration-500`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {categories.locked.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <span>🔒</span>
            Locked ({categories.locked.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.locked.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center opacity-50"
              >
                <div className="text-3xl mb-2 grayscale">{achievement.icon}</div>
                <p className="text-gray-500 font-medium text-sm">{achievement.title}</p>
                <p className="text-gray-600 text-xs mt-1">???</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
