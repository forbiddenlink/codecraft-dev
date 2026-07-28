/**
 * Concept Mastery Chart
 * Visualizes mastery level for each programming concept
 */

import { Target, Dumbbell, BookOpen } from 'lucide-react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';
import { Icon } from '@/components/ui/Icon';

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
    }),
  );

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
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="mb-1 text-h3">Concept Mastery</h3>
          <p className="text-body">Your proficiency across different topics</p>
        </div>
        <Icon icon={Target} size={22} className="text-[rgb(var(--accent-subtle))] opacity-80" />
      </div>

      <div className="space-y-4">
        {displayConcepts.map((concept) => (
          <div key={concept.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-h4">{concept.name}</span>
                {concept.isStrong && (
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <Icon icon={Dumbbell} size={11} />
                    Strong
                  </span>
                )}
                {concept.isWeak && (
                  <span className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-error/20 bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                    <Icon icon={BookOpen} size={11} />
                    Practice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-small">{getMasteryLabel(concept.successRate)}</span>
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
