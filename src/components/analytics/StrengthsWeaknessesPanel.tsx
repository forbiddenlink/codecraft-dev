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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="card border-success/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success/10 rounded-[var(--radius-sm)] flex items-center justify-center text-xl">
            💪
          </div>
          <div>
            <h3 className="text-h3">Your Strengths</h3>
            <p className="text-success text-body">Concepts you&apos;ve mastered</p>
          </div>
        </div>

        {strongConcepts.length > 0 ? (
          <div className="space-y-2">
            {strongConcepts.map((concept) => {
              const successRate = analytics.successRatePerConcept.get(concept) || 0;
              return (
                <div
                  key={concept}
                  className="bg-elevated rounded-[var(--radius-md)] p-4 border border-[rgb(var(--border-subtle))] hover:border-success/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-h4">{concept}</span>
                    <span className="text-success font-semibold">{Math.round(successRate)}%</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Math.round(successRate / 20)
                            ? 'bg-success'
                            : 'bg-surface'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-elevated rounded-[var(--radius-md)] p-6 text-center">
            <p className="text-body">
              Keep learning! Strengths will appear as you master concepts.
            </p>
          </div>
        )}

        {!expanded && analytics.strongConcepts.length > displayLimit && (
          <p className="text-center text-success text-small mt-4">
            +{analytics.strongConcepts.length - displayLimit} more strengths
          </p>
        )}
      </div>

      {/* Weaknesses */}
      <div className="card border-error/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-error/10 rounded-[var(--radius-sm)] flex items-center justify-center text-xl">
            📚
          </div>
          <div>
            <h3 className="text-h3">Areas to Improve</h3>
            <p className="text-error text-body">Concepts that need practice</p>
          </div>
        </div>

        {weakConcepts.length > 0 ? (
          <div className="space-y-2">
            {weakConcepts.map((concept) => {
              const successRate = analytics.successRatePerConcept.get(concept) || 0;
              const errors = analytics.errorsPerConcept.get(concept) || 0;

              return (
                <div
                  key={concept}
                  className="bg-elevated rounded-[var(--radius-md)] p-4 border border-[rgb(var(--border-subtle))] hover:border-error/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-h4">{concept}</span>
                    <span className="text-error font-semibold">{Math.round(successRate)}%</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < Math.round(successRate / 20)
                            ? 'bg-warning'
                            : 'bg-surface'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-small">
                    {errors} error{errors !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-elevated rounded-[var(--radius-md)] p-6 text-center">
            <p className="text-body">
              Great job! No weak areas identified yet.
            </p>
          </div>
        )}

        {!expanded && analytics.weakConcepts.length > displayLimit && (
          <p className="text-center text-error text-small mt-4">
            +{analytics.weakConcepts.length - displayLimit} more areas
          </p>
        )}
      </div>
    </div>
  );
}
