/**
 * Analytics Dashboard
 * Comprehensive visualization of player progress and learning metrics
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Calendar,
  Clock,
  Code2,
  Dumbbell,
  Flame,
  Lightbulb,
  LineChart,
  RefreshCw,
  Rocket,
  Star,
  Target,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { getAnalytics } from '@/utils/analyticsSystem'
import { CodeMetricsPanel } from './CodeMetricsPanel'
import { ConceptMasteryChart } from './ConceptMasteryChart'
import { LearningVelocityChart } from './LearningVelocityChart'
import { RecommendationsPanel } from './RecommendationsPanel'
import { StatsCard } from './StatsCard'
import { StrengthsWeaknessesPanel } from './StrengthsWeaknessesPanel'
import { TimeDistributionChart } from './TimeDistributionChart'

export interface AnalyticsDashboardProps {
  playerId: string
  onClose?: () => void
}

type TabType = 'overview' | 'concepts' | 'time' | 'code' | 'recommendations'

export function AnalyticsDashboard({ playerId, onClose }: AnalyticsDashboardProps) {
  void playerId
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [analytics, setAnalytics] = useState(getAnalytics())

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(getAnalytics())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = {
    totalChallenges: analytics.challengesCompleted,
    totalTime: Math.round(analytics.totalPlayTime / 60000),
    averageTime: Math.round(analytics.averageChallengeTime / 60000),
    learningVelocity: analytics.learningVelocity.toFixed(1),
    streak: analytics.streakDays,
    perfectScores: analytics.perfectScores,
    strongConcepts: analytics.strongConcepts.length,
    weakConcepts: analytics.weakConcepts.length,
  }

  const tabs: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'concepts', label: 'Concept Mastery', icon: Target },
    { id: 'time', label: 'Time Management', icon: Clock },
    { id: 'code', label: 'Code Metrics', icon: Code2 },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="modal-content animate-slide-up max-h-[90vh] w-full max-w-7xl overflow-hidden">
        <div className="flex items-center justify-between bg-[rgb(var(--accent))] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 text-white">
              <Icon icon={LineChart} size={20} />
            </div>
            <div>
              <h2 className="text-h2 text-white">Learning Analytics</h2>
              <p className="text-body text-white/80">Track your progress and insights</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Close dashboard"
            >
              <Icon icon={X} size={18} />
            </button>
          )}
        </div>

        <div className="border-b border-[rgb(var(--border-subtle))] bg-elevated/50 px-6">
          <div className="-mb-px flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring inline-flex items-center gap-2 whitespace-nowrap rounded-t-[var(--radius-sm)] px-4 py-3 text-body font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-accent bg-surface text-accent'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon icon={tab.icon} size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(90vh-160px)] overflow-y-auto bg-surface p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Challenges Completed"
                  value={stats.totalChallenges}
                  icon={Target}
                  color="blue"
                  subtitle="Total completed"
                />
                <StatsCard
                  title="Total Learning Time"
                  value={`${stats.totalTime}m`}
                  icon={Clock}
                  color="blue"
                  subtitle="Time invested"
                />
                <StatsCard
                  title="Learning Velocity"
                  value={`${stats.learningVelocity}/hr`}
                  icon={Rocket}
                  color="green"
                  trend={Number(stats.learningVelocity) > 2 ? 'up' : 'stable'}
                  subtitle="Challenges per hour"
                />
                <StatsCard
                  title="Current Streak"
                  value={`${stats.streak} days`}
                  icon={Flame}
                  color="orange"
                  trend={stats.streak >= 7 ? 'up' : 'stable'}
                  subtitle="Keep it going"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatsCard
                  title="Perfect Scores"
                  value={stats.perfectScores}
                  icon={Star}
                  color="yellow"
                  subtitle="100% completions"
                />
                <StatsCard
                  title="Strong Concepts"
                  value={stats.strongConcepts}
                  icon={Dumbbell}
                  color="green"
                  subtitle="Mastered topics"
                />
                <StatsCard
                  title="Areas to Improve"
                  value={stats.weakConcepts}
                  icon={BookOpen}
                  color="red"
                  subtitle="Practice recommended"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <LearningVelocityChart analytics={analytics} />
                <ConceptMasteryChart analytics={analytics} />
              </div>

              <StrengthsWeaknessesPanel analytics={analytics} />
            </div>
          )}

          {activeTab === 'concepts' && (
            <div className="space-y-6">
              <ConceptMasteryChart analytics={analytics} detailed />
              <StrengthsWeaknessesPanel analytics={analytics} expanded />
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <StatsCard
                  title="Average Challenge Time"
                  value={`${stats.averageTime}m`}
                  icon={Clock}
                  color="blue"
                  subtitle="Per challenge"
                />
                <StatsCard
                  title="Total Sessions"
                  value={analytics.challengesCompleted}
                  icon={Calendar}
                  color="blue"
                  subtitle="Learning sessions"
                />
              </div>
              <TimeDistributionChart analytics={analytics} />
            </div>
          )}

          {activeTab === 'code' && <CodeMetricsPanel analytics={analytics} />}

          {activeTab === 'recommendations' && <RecommendationsPanel analytics={analytics} />}
        </div>

        <div className="flex items-center justify-between border-t border-[rgb(var(--border-subtle))] bg-elevated/50 px-6 py-4">
          <p className="text-small">Last updated: {new Date().toLocaleTimeString()}</p>
          <button
            type="button"
            onClick={() => setAnalytics(getAnalytics())}
            className="btn-primary focus-ring inline-flex items-center gap-2"
          >
            <Icon icon={RefreshCw} size={14} />
            Refresh data
          </button>
        </div>
      </div>
    </div>
  )
}
