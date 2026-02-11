/**
 * Time Distribution Chart
 * Shows how time is distributed across different challenges
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface TimeDistributionChartProps {
  analytics: LearningAnalytics;
}

export function TimeDistributionChart({ analytics }: TimeDistributionChartProps) {
  // Group challenges by time spent
  const timeRanges = [
    { label: '< 5m', min: 0, max: 300000, count: 0, color: 'bg-green-500' },
    { label: '5-10m', min: 300000, max: 600000, count: 0, color: 'bg-blue-500' },
    { label: '10-20m', min: 600000, max: 1200000, count: 0, color: 'bg-yellow-500' },
    { label: '20-30m', min: 1200000, max: 1800000, count: 0, color: 'bg-orange-500' },
    { label: '> 30m', min: 1800000, max: Infinity, count: 0, color: 'bg-red-500' },
  ];

  analytics.timePerChallenge.forEach((time) => {
    const range = timeRanges.find((r) => time >= r.min && time < r.max);
    if (range) range.count++;
  });

  const totalChallenges = analytics.timePerChallenge.size;
  const maxCount = Math.max(...timeRanges.map((r) => r.count));

  // Calculate insights
  const quickChallenges = timeRanges[0].count + timeRanges[1].count;
  const slowChallenges = timeRanges[3].count + timeRanges[4].count;
  const efficiency = totalChallenges > 0 ? (quickChallenges / totalChallenges) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Time Distribution</h3>
          <p className="text-gray-400 text-sm">How long you spend on challenges</p>
        </div>
        <div className="text-3xl">⏱️</div>
      </div>

      {/* Chart */}
      <div className="space-y-4 mb-6">
        {timeRanges.map((range) => {
          const percentage = totalChallenges > 0 ? (range.count / totalChallenges) * 100 : 0;
          const barWidth = maxCount > 0 ? (range.count / maxCount) * 100 : 0;

          return (
            <div key={range.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium">{range.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">{range.count} challenges</span>
                  <span className="text-white font-bold">{percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${range.color} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                  style={{ width: `${barWidth}%` }}
                >
                  {range.count > 0 && (
                    <span className="text-white text-xs font-bold">{range.count}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Efficiency Score */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 font-medium">Efficiency Score</span>
          <span className="text-2xl font-bold text-purple-400">{efficiency.toFixed(1)}%</span>
        </div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${efficiency}%` }}
          />
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Percentage of challenges completed quickly (&lt; 10 minutes)
        </p>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Quick Wins</p>
          <p className="text-green-400 font-bold text-xl">{quickChallenges}</p>
          <p className="text-gray-500 text-xs">&lt; 10 minutes</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Deep Dives</p>
          <p className="text-orange-400 font-bold text-xl">{slowChallenges}</p>
          <p className="text-gray-500 text-xs">&gt; 20 minutes</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 {efficiency >= 60
            ? "Great efficiency! You're tackling challenges confidently."
            : efficiency >= 40
            ? "Balanced approach. Consider breaking down complex challenges into smaller steps."
            : "Take your time to understand concepts deeply. Speed comes with practice."
          }
        </p>
      </div>
    </div>
  );
}
