/**
 * Recommendations Panel
 * Personalized learning recommendations
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Coffee,
  Flame,
  Lightbulb,
  Map,
  PartyPopper,
  RefreshCw,
  Rocket,
  Star,
  Zap,
} from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import type { LearningAnalytics } from '@/utils/analyticsSystem'

export interface RecommendationsPanelProps {
  analytics: LearningAnalytics
  playerId: string
}

interface Recommendation {
  id: string
  type: 'practice' | 'review' | 'advance' | 'break' | 'streak'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  icon: LucideIcon
  action?: string
}

export function RecommendationsPanel({ analytics }: Omit<RecommendationsPanelProps, 'playerId'>) {
  const recommendations: Recommendation[] = []

  if (analytics.weakConcepts.length > 0) {
    analytics.weakConcepts.slice(0, 3).forEach((concept) => {
      const successRate = analytics.successRatePerConcept.get(concept) || 0
      recommendations.push({
        id: `practice-${concept}`,
        type: 'practice',
        title: `Practice ${concept}`,
        description: `Your success rate is ${Math.round(successRate)}%. Focus on challenges that strengthen this concept.`,
        priority: successRate < 40 ? 'high' : 'medium',
        icon: BookOpen,
        action: `Find ${concept} challenges`,
      })
    })
  }

  const oldChallenges = Array.from(analytics.attemptsPerChallenge.entries()).filter(
    ([, attempts]) => attempts >= 1
  )

  if (oldChallenges.length > 0) {
    recommendations.push({
      id: 'review-old',
      type: 'review',
      title: 'Review past challenges',
      description: `${oldChallenges.length} challenges ready for review to reinforce learning.`,
      priority: 'medium',
      icon: RefreshCw,
      action: 'Start review session',
    })
  }

  const strongConceptsCount = analytics.strongConcepts.length
  if (strongConceptsCount >= 3) {
    recommendations.push({
      id: 'advance',
      type: 'advance',
      title: 'Ready for advanced challenges',
      description: `You've mastered ${strongConceptsCount} concepts. Try harder problems next.`,
      priority: 'high',
      icon: Rocket,
      action: 'View advanced challenges',
    })
  }

  if (analytics.totalPlayTime > 7200000) {
    const hours = Math.round(analytics.totalPlayTime / 3600000)
    recommendations.push({
      id: 'break',
      type: 'break',
      title: 'Take a break',
      description: `You've been learning for ${hours} hours today. Rest helps consolidate learning.`,
      priority: 'medium',
      icon: Coffee,
      action: 'Set reminder for later',
    })
  }

  if (analytics.streakDays >= 7) {
    recommendations.push({
      id: 'streak',
      type: 'streak',
      title: 'Maintain your streak',
      description: `${analytics.streakDays} day streak. Complete one challenge today to keep it going.`,
      priority: 'high',
      icon: Flame,
      action: 'Quick challenge',
    })
  }

  if (analytics.learningVelocity < 1) {
    recommendations.push({
      id: 'velocity',
      type: 'practice',
      title: 'Boost learning pace',
      description: 'Try setting a timer for challenges to build speed and confidence.',
      priority: 'low',
      icon: Zap,
      action: 'Try timed mode',
    })
  }

  if (analytics.perfectScores === 0 && analytics.challengesCompleted >= 5) {
    recommendations.push({
      id: 'perfect',
      type: 'practice',
      title: 'Aim for perfect scores',
      description:
        "You haven't achieved a perfect score yet. Focus on understanding challenge requirements fully.",
      priority: 'medium',
      icon: Star,
      action: 'Review grading criteria',
    })
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-[rgb(var(--error)/0.35)] bg-[rgb(var(--error)/0.08)]'
      case 'medium':
        return 'border-[rgb(var(--energy)/0.35)] bg-[rgb(var(--energy)/0.08)]'
      case 'low':
        return 'border-[rgb(var(--accent-subtle)/0.35)] bg-[rgb(var(--accent)/0.08)]'
    }
  }

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-[rgb(var(--error)/0.2)] text-[rgb(var(--error))]'
      case 'medium':
        return 'bg-[rgb(var(--energy)/0.2)] text-[rgb(var(--energy))]'
      case 'low':
        return 'bg-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent-subtle))]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-md)] border border-[rgb(var(--accent-subtle)/0.3)] bg-[rgb(var(--accent)/0.1)] p-6">
        <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-[rgb(var(--text-primary))]">
          <Icon icon={Lightbulb} size={20} className="text-[rgb(var(--energy))]" />
          Personalized recommendations
        </h3>
        <p className="text-[rgb(var(--text-secondary))]">
          Suggestions based on your learning patterns and progress
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-[var(--radius-md)] border p-6 transition-transform hover:scale-[1.01] ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.06] text-[rgb(var(--accent-subtle))]">
                  <Icon icon={rec.icon} size={22} />
                </span>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                      {rec.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${getPriorityBadge(
                        rec.priority
                      )}`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-[rgb(var(--text-secondary))]">
                    {rec.description}
                  </p>
                  {rec.action && (
                    <button
                      type="button"
                      className="rounded-[var(--radius-sm)] border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-[rgb(var(--text-primary))] transition-colors hover:bg-white/15"
                    >
                      {rec.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <div className="mb-4 flex justify-center text-[rgb(var(--success))]">
            <Icon icon={PartyPopper} size={36} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-[rgb(var(--text-primary))]">
            You&apos;re doing great
          </h3>
          <p className="text-[rgb(var(--text-secondary))]">
            Keep learning and recommendations will appear based on your progress.
          </p>
        </div>
      )}

      <div className="rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.03] p-6">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[rgb(var(--text-primary))]">
          <Icon icon={Map} size={18} className="text-[rgb(var(--accent-subtle))]" />
          Suggested learning path
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-white/[0.06] bg-white/[0.04] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--success))] text-sm font-bold text-white">
              1
            </div>
            <span className="text-[rgb(var(--text-secondary))]">Master HTML fundamentals</span>
          </div>
          <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-white/[0.06] bg-white/[0.04] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-sm font-bold text-white">
              2
            </div>
            <span className="text-[rgb(var(--text-secondary))]">Build CSS layout fluency</span>
          </div>
          <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-white/[0.06] bg-white/[0.04] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-[rgb(var(--text-muted))]">
              3
            </div>
            <span className="text-[rgb(var(--text-muted))]">Add JavaScript interactivity</span>
          </div>
        </div>
      </div>
    </div>
  )
}
