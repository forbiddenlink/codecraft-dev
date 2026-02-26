/**
 * Analytics Dashboard
 * Comprehensive visualization of player progress and learning metrics
 */

import React, { useState, useEffect } from 'react';
import { getAnalytics } from '@/utils/analyticsSystem';
import { StatsCard } from './StatsCard';
import { ConceptMasteryChart } from './ConceptMasteryChart';
import { LearningVelocityChart } from './LearningVelocityChart';
import { TimeDistributionChart } from './TimeDistributionChart';
import { StrengthsWeaknessesPanel } from './StrengthsWeaknessesPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { CodeMetricsPanel } from './CodeMetricsPanel';

export interface AnalyticsDashboardProps {
  playerId: string;
  onClose?: () => void;
}

type TabType = 'overview' | 'concepts' | 'time' | 'code' | 'recommendations';

export function AnalyticsDashboard({ playerId, onClose }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analytics, setAnalytics] = useState(getAnalytics());

  useEffect(() => {
    // Refresh analytics every 30 seconds
    const interval = setInterval(() => {
      setAnalytics(getAnalytics());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalChallenges: analytics.challengesCompleted,
    totalTime: Math.round(analytics.totalPlayTime / 60000), // minutes
    averageTime: Math.round(analytics.averageChallengeTime / 60000), // minutes
    learningVelocity: analytics.learningVelocity.toFixed(1),
    streak: analytics.streakDays,
    perfectScores: analytics.perfectScores,
    strongConcepts: analytics.strongConcepts.length,
    weakConcepts: analytics.weakConcepts.length,
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'concepts', label: 'Concept Mastery', icon: '🎯' },
    { id: 'time', label: 'Time Management', icon: '⏱️' },
    { id: 'code', label: 'Code Metrics', icon: '💻' },
    { id: 'recommendations', label: 'Recommendations', icon: '💡' },
  ];

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
      <div className="modal-content max-w-7xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-accent px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-[var(--radius-sm)] flex items-center justify-center text-2xl">
              📈
            </div>
            <div>
              <h2 className="text-h2 text-white">Learning Analytics</h2>
              <p className="text-white/80 text-body">Track your progress and insights</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-[var(--radius-sm)] flex items-center justify-center text-white transition-colors focus-ring"
              aria-label="Close dashboard"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-elevated/50 border-b border-[rgb(var(--border-subtle))] px-6">
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-body font-medium transition-all focus-ring rounded-t-[var(--radius-sm)] ${
                  activeTab === tab.id
                    ? 'text-accent border-b-2 border-accent bg-surface'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6 bg-surface">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Challenges Completed"
                  value={stats.totalChallenges}
                  icon="🎯"
                  color="purple"
                  subtitle="Total completed"
                />
                <StatsCard
                  title="Total Learning Time"
                  value={`${stats.totalTime}m`}
                  icon="⏱️"
                  color="blue"
                  subtitle="Time invested"
                />
                <StatsCard
                  title="Learning Velocity"
                  value={`${stats.learningVelocity}/hr`}
                  icon="🚀"
                  color="green"
                  trend={Number(stats.learningVelocity) > 2 ? 'up' : 'stable'}
                  subtitle="Challenges per hour"
                />
                <StatsCard
                  title="Current Streak"
                  value={`${stats.streak} days`}
                  icon="🔥"
                  color="orange"
                  trend={stats.streak >= 7 ? 'up' : 'stable'}
                  subtitle="Keep it going!"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Perfect Scores"
                  value={stats.perfectScores}
                  icon="⭐"
                  color="yellow"
                  subtitle="100% completions"
                />
                <StatsCard
                  title="Strong Concepts"
                  value={stats.strongConcepts}
                  icon="💪"
                  color="green"
                  subtitle="Mastered topics"
                />
                <StatsCard
                  title="Areas to Improve"
                  value={stats.weakConcepts}
                  icon="📚"
                  color="red"
                  subtitle="Practice recommended"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LearningVelocityChart analytics={analytics} />
                <ConceptMasteryChart analytics={analytics} />
              </div>

              {/* Strengths & Weaknesses */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                  title="Average Challenge Time"
                  value={`${stats.averageTime}m`}
                  icon="⏰"
                  color="blue"
                  subtitle="Per challenge"
                />
                <StatsCard
                  title="Total Sessions"
                  value={analytics.challengesCompleted}
                  icon="📅"
                  color="purple"
                  subtitle="Learning sessions"
                />
              </div>
              <TimeDistributionChart analytics={analytics} />
            </div>
          )}

          {activeTab === 'code' && (
            <CodeMetricsPanel analytics={analytics} />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsPanel analytics={analytics} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-elevated/50 border-t border-[rgb(var(--border-subtle))] px-6 py-4 flex items-center justify-between">
          <p className="text-small">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          <button
            onClick={() => setAnalytics(getAnalytics())}
            className="btn-primary focus-ring"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
