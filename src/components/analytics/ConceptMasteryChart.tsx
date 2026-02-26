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
    if (rate >= 90) return 'bg-success';
    if (rate >= 75) return 'bg-info';
    if (rate >= 60) return 'bg-warning';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-error';
  };

  const getMasteryLabel = (rate: number) => {
    if (rate >= 90) return 'Mastered';
    if (rate >= 75) return 'Proficient';
    if (rate >= 60) return 'Intermediate';
    if (rate >= 40) return 'Learning';
    return 'Needs Practice';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-h3 mb-1">Concept Mastery</h3>
          <p className="text-body">Your proficiency across different topics</p>
        </div>
        <div className="text-2xl opacity-70">🎯</div>
      </div>

      <div className="space-y-4">
        {displayConcepts.map((concept) => (
          <div key={concept.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-h4">{concept.name}</span>
                {concept.isStrong && (
                  <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-[var(--radius-sm)] border border-success/20 font-medium">
                    💪 Strong
                  </span>
                )}
                {concept.isWeak && (
                  <span className="px-2 py-0.5 bg-error/10 text-error text-xs rounded-[var(--radius-sm)] border border-error/20 font-medium">
                    📚 Practice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-small">
                  {getMasteryLabel(concept.successRate)}
                </span>
                <span className="text-body font-semibold">{concept.successRate}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-elevated rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getMasteryColor(
                  concept.successRate
                )} transition-all duration-500 ease-out rounded-full`}
                style={{ width: `${concept.successRate}%` }}
              />
            </div>

            {detailed && (
              <p className="text-small">
                {concept.attempts} attempt{concept.attempts !== 1 ? 's' : ''} recorded
              </p>
            )}
          </div>
        ))}
      </div>

      {!detailed && concepts.length > displayLimit && (
        <p className="text-center text-small mt-4">
          +{concepts.length - displayLimit} more concepts
        </p>
      )}
    </div>
  );
}
