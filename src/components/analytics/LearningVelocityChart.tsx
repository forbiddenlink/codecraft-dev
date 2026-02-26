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
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-h3 mb-1">Learning Velocity</h3>
          <p className="text-body">Your learning pace and efficiency</p>
        </div>
        <div className="text-2xl opacity-70">{rating.emoji}</div>
      </div>

      {/* Velocity Display */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-semibold text-text-primary">{velocity.toFixed(1)}</span>
          <span className="text-body">challenges/hour</span>
        </div>
        <p className={`${rating.color} font-medium`}>{rating.label} pace!</p>
      </div>

      {/* Visual Velocity Bars - Keep gradient for visual interest */}
      <div className="mb-5">
        <div className="flex gap-1 h-12">
          {Array.from({ length: maxBars }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[var(--radius-sm)] transition-all duration-300 ${
                i < filledBars
                  ? 'bg-accent'
                  : 'bg-elevated'
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
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-elevated rounded-[var(--radius-md)] p-4 border border-[rgb(var(--border-subtle))]">
          <p className="text-small mb-1">Avg. Time</p>
          <p className="text-xl font-semibold text-text-primary">{avgTime.toFixed(1)}m</p>
          <p className="text-small">per challenge</p>
        </div>
        <div className="bg-elevated rounded-[var(--radius-md)] p-4 border border-[rgb(var(--border-subtle))]">
          <p className="text-small mb-1">Total Time</p>
          <p className="text-xl font-semibold text-text-primary">
            {Math.round(analytics.totalPlayTime / 60000)}m
          </p>
          <p className="text-small">learning time</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-[var(--radius-md)]">
        <p className="text-info text-body">
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
