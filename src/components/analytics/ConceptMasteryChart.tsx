/**
 * Concept Mastery Chart
 * Visualizes mastery level for each programming concept
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface ConceptMasteryChartProps {
  analytics: LearningAnalytics;
  detailed?: boolean;
}

export function ConceptMasteryChart({ analytics, detailed = false }: ConceptMasteryChartProps) {
  const concepts = Array.from(analytics.successRatePerConcept.entries()).map(
    ([concept, successRate]) => ({
      name: concept,
      successRate: Math.round(successRate),
      attempts: analytics.errorsPerConcept.get(concept) || 0,
      isStrong: analytics.strongConcepts.includes(concept),
      isWeak: analytics.weakConcepts.includes(concept),
    })
  );

  // Sort by success rate descending
  concepts.sort((a, b) => b.successRate - a.successRate);

  const displayLimit = detailed ? concepts.length : 8;
  const displayConcepts = concepts.slice(0, displayLimit);

  const getMasteryColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 75) return 'bg-blue-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (rate: number) => {
    if (rate >= 90) return 'Mastered';
    if (rate >= 75) return 'Proficient';
    if (rate >= 60) return 'Intermediate';
    if (rate >= 40) return 'Learning';
    return 'Needs Practice';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Concept Mastery</h3>
          <p className="text-gray-400 text-sm">Your proficiency across different topics</p>
        </div>
        <div className="text-3xl">🎯</div>
      </div>

      <div className="space-y-4">
        {displayConcepts.map((concept) => (
          <div key={concept.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{concept.name}</span>
                {concept.isStrong && (
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    💪 Strong
                  </span>
                )}
                {concept.isWeak && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                    📚 Practice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  {getMasteryLabel(concept.successRate)}
                </span>
                <span className="text-white font-bold text-sm">{concept.successRate}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getMasteryColor(
                  concept.successRate
                )} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${concept.successRate}%` }}
              />
              {/* Glow effect */}
              <div
                className={`absolute left-0 top-0 h-full ${getMasteryColor(
                  concept.successRate
                )} opacity-50 blur-sm transition-all duration-500`}
                style={{ width: `${concept.successRate}%` }}
              />
            </div>

            {detailed && (
              <p className="text-gray-500 text-xs">
                {concept.attempts} attempt{concept.attempts !== 1 ? 's' : ''} recorded
              </p>
            )}
          </div>
        ))}
      </div>

      {!detailed && concepts.length > displayLimit && (
        <p className="text-center text-gray-500 text-sm mt-4">
          +{concepts.length - displayLimit} more concepts
        </p>
      )}
    </div>
  );
}
