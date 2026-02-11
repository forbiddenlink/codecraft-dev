/**
 * Learning Velocity Chart
 * Shows learning speed trends over time
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface LearningVelocityChartProps {
  analytics: LearningAnalytics;
}

export function LearningVelocityChart({ analytics }: LearningVelocityChartProps) {
  const velocity = analytics.learningVelocity;
  const avgTime = analytics.averageChallengeTime / 60000; // Convert to minutes

  const getVelocityRating = (vel: number) => {
    if (vel >= 3) return { label: 'Exceptional', color: 'text-green-400', emoji: '🚀' };
    if (vel >= 2) return { label: 'Great', color: 'text-blue-400', emoji: '⚡' };
    if (vel >= 1) return { label: 'Good', color: 'text-yellow-400', emoji: '✨' };
    if (vel >= 0.5) return { label: 'Steady', color: 'text-orange-400', emoji: '🐢' };
    return { label: 'Take Your Time', color: 'text-gray-400', emoji: '🌱' };
  };

  const rating = getVelocityRating(velocity);

  // Create visual bars for velocity representation
  const maxBars = 10;
  const filledBars = Math.min(Math.ceil((velocity / 3) * maxBars), maxBars);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Learning Velocity</h3>
          <p className="text-gray-400 text-sm">Your learning pace and efficiency</p>
        </div>
        <div className="text-3xl">{rating.emoji}</div>
      </div>

      {/* Velocity Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-white">{velocity.toFixed(1)}</span>
          <span className="text-gray-400 text-lg">challenges/hour</span>
        </div>
        <p className={`${rating.color} font-medium`}>{rating.label} pace!</p>
      </div>

      {/* Visual Velocity Bars */}
      <div className="mb-6">
        <div className="flex gap-1 h-12">
          {Array.from({ length: maxBars }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded transition-all duration-300 ${
                i < filledBars
                  ? 'bg-gradient-to-t from-purple-600 to-blue-500 shadow-lg shadow-purple-500/50'
                  : 'bg-gray-700'
              }`}
              style={{
                height: `${((i + 1) / maxBars) * 100}%`,
                alignSelf: 'flex-end',
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Avg. Time</p>
          <p className="text-white font-bold text-xl">{avgTime.toFixed(1)}m</p>
          <p className="text-gray-500 text-xs">per challenge</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Time</p>
          <p className="text-white font-bold text-xl">
            {Math.round(analytics.totalPlayTime / 60000)}m
          </p>
          <p className="text-gray-500 text-xs">learning time</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 {velocity >= 2
            ? "You're learning at an excellent pace! Keep up the momentum."
            : velocity >= 1
            ? "Steady progress! Consider setting aside dedicated learning time to boost velocity."
            : "Remember, quality matters more than speed. Focus on understanding concepts deeply."
          }
        </p>
      </div>
    </div>
  );
}
