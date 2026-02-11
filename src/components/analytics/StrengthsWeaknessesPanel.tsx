/**
 * Strengths & Weaknesses Panel
 * Shows what concepts the user excels at and struggles with
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface StrengthsWeaknessesPanelProps {
  analytics: LearningAnalytics;
  expanded?: boolean;
}

export function StrengthsWeaknessesPanel({
  analytics,
  expanded = false,
}: StrengthsWeaknessesPanelProps) {
  const displayLimit = expanded ? 10 : 5;
  const strongConcepts = analytics.strongConcepts.slice(0, displayLimit);
  const weakConcepts = analytics.weakConcepts.slice(0, displayLimit);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths */}
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">
            💪
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Your Strengths</h3>
            <p className="text-green-400 text-sm">Concepts you&apos;ve mastered</p>
          </div>
        </div>

        {strongConcepts.length > 0 ? (
          <div className="space-y-3">
            {strongConcepts.map((concept) => {
              const successRate = analytics.successRatePerConcept.get(concept) || 0;
              return (
                <div
                  key={concept}
                  className="bg-gray-800/50 border border-green-500/20 rounded-lg p-4 hover:border-green-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{concept}</span>
                    <span className="text-green-400 font-bold">{Math.round(successRate)}%</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Math.round(successRate / 20)
                            ? 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              Keep learning! Strengths will appear as you master concepts.
            </p>
          </div>
        )}

        {!expanded && analytics.strongConcepts.length > displayLimit && (
          <p className="text-center text-green-400 text-sm mt-4">
            +{analytics.strongConcepts.length - displayLimit} more strengths
          </p>
        )}
      </div>

      {/* Weaknesses */}
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center text-2xl">
            📚
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Areas to Improve</h3>
            <p className="text-red-400 text-sm">Concepts that need practice</p>
          </div>
        </div>

        {weakConcepts.length > 0 ? (
          <div className="space-y-3">
            {weakConcepts.map((concept) => {
              const successRate = analytics.successRatePerConcept.get(concept) || 0;
              const errors = analytics.errorsPerConcept.get(concept) || 0;

              return (
                <div
                  key={concept}
                  className="bg-gray-800/50 border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{concept}</span>
                    <span className="text-red-400 font-bold">{Math.round(successRate)}%</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Math.round(successRate / 20)
                            ? 'bg-orange-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {errors} error{errors !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm">
              Great job! No weak areas identified yet.
            </p>
          </div>
        )}

        {!expanded && analytics.weakConcepts.length > displayLimit && (
          <p className="text-center text-red-400 text-sm mt-4">
            +{analytics.weakConcepts.length - displayLimit} more areas
          </p>
        )}
      </div>
    </div>
  );
}
