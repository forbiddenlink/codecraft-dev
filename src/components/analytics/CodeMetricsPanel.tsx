/**
 * Code Metrics Panel
 * Shows detailed code quality and usage statistics
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface CodeMetricsPanelProps {
  analytics: LearningAnalytics;
}

export function CodeMetricsPanel({ analytics }: CodeMetricsPanelProps) {
  // Get top HTML tags
  const topHTMLTags = Array.from(analytics.mostUsedHTMLTags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Get top CSS properties
  const topCSSProperties = Array.from(analytics.mostUsedCSSProperties.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalHTMLTags = Array.from(analytics.mostUsedHTMLTags.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalCSSProps = Array.from(analytics.mostUsedCSSProperties.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-gray-400 text-sm mb-1">Total HTML Tags</p>
          <p className="text-3xl font-bold text-blue-400">{totalHTMLTags}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6">
          <div className="text-3xl mb-2">🎨</div>
          <p className="text-gray-400 text-sm mb-1">Total CSS Properties</p>
          <p className="text-3xl font-bold text-purple-400">{totalCSSProps}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
          <div className="text-3xl mb-2">✨</div>
          <p className="text-gray-400 text-sm mb-1">Unique Techniques</p>
          <p className="text-3xl font-bold text-green-400">
            {analytics.mostUsedHTMLTags.size + analytics.mostUsedCSSProperties.size}
          </p>
        </div>
      </div>

      {/* Code Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HTML Tags */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              📝
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Most Used HTML Tags</h3>
              <p className="text-gray-400 text-sm">Your favorite elements</p>
            </div>
          </div>

          {topHTMLTags.length > 0 ? (
            <div className="space-y-3">
              {topHTMLTags.map(([tag, count], index) => {
                const percentage = totalHTMLTags > 0 ? (count / totalHTMLTags) * 100 : 0;
                return (
                  <div key={tag} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                          &lt;{tag}&gt;
                        </span>
                        {index < 3 && (
                          <span className="text-yellow-400 text-xs">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{count}×</span>
                        <span className="text-white font-bold text-sm w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Start coding to see your HTML tag usage!
            </p>
          )}
        </div>

        {/* CSS Properties */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              🎨
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Most Used CSS Properties</h3>
              <p className="text-gray-400 text-sm">Your styling patterns</p>
            </div>
          </div>

          {topCSSProperties.length > 0 ? (
            <div className="space-y-3">
              {topCSSProperties.map(([prop, count], index) => {
                const percentage = totalCSSProps > 0 ? (count / totalCSSProps) * 100 : 0;
                return (
                  <div key={prop} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                          {prop}
                        </span>
                        {index < 3 && (
                          <span className="text-yellow-400 text-xs">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{count}×</span>
                        <span className="text-white font-bold text-sm w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Start styling to see your CSS property usage!
            </p>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          💡 Code Insights
        </h4>
        <div className="space-y-2 text-sm">
          {topHTMLTags.length > 0 && (
            <p className="text-gray-300">
              • Your most-used HTML tag is <span className="text-blue-400 font-mono">&lt;{topHTMLTags[0][0]}&gt;</span>, appearing {topHTMLTags[0][1]} times.
            </p>
          )}
          {topCSSProperties.length > 0 && (
            <p className="text-gray-300">
              • You frequently use <span className="text-purple-400 font-mono">{topCSSProperties[0][0]}</span> for styling.
            </p>
          )}
          {analytics.mostUsedHTMLTags.has('div') && analytics.mostUsedHTMLTags.has('section') && (
            <p className="text-gray-300">
              • Great use of semantic HTML! Keep using meaningful tags like &lt;section&gt;.
            </p>
          )}
          {analytics.mostUsedCSSProperties.has('flex') || analytics.mostUsedCSSProperties.has('display') && (
            <p className="text-gray-300">
              • You&apos;re mastering modern CSS layouts with Flexbox!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
