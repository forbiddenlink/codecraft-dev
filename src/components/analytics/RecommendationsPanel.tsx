/**
 * Recommendations Panel
 * AI-powered personalized learning recommendations
 */

import React from 'react';
import type { LearningAnalytics } from '@/utils/analyticsSystem';

export interface RecommendationsPanelProps {
  analytics: LearningAnalytics;
  playerId: string;
}

interface Recommendation {
  id: string;
  type: 'practice' | 'review' | 'advance' | 'break' | 'streak';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action?: string;
}

export function RecommendationsPanel({ analytics }: Omit<RecommendationsPanelProps, 'playerId'>) {
  const recommendations: Recommendation[] = [];

  // Generate personalized recommendations based on analytics

  // 1. Weak concept practice
  if (analytics.weakConcepts.length > 0) {
    analytics.weakConcepts.slice(0, 3).forEach((concept) => {
      const successRate = analytics.successRatePerConcept.get(concept) || 0;
      recommendations.push({
        id: `practice-${concept}`,
        type: 'practice',
        title: `Practice ${concept}`,
        description: `Your success rate is ${Math.round(successRate)}%. Focus on challenges that strengthen this concept.`,
        priority: successRate < 40 ? 'high' : 'medium',
        icon: '📚',
        action: `Find ${concept} challenges`,
      });
    });
  }

  // 2. Spaced repetition review
  const oldChallenges = Array.from(analytics.attemptsPerChallenge.entries()).filter(
    ([, attempts]) => {
      // Use attempts as a proxy since we don't have completion dates
      return attempts >= 1;
    }
  );

  if (oldChallenges.length > 0) {
    recommendations.push({
      id: 'review-old',
      type: 'review',
      title: 'Review Past Challenges',
      description: `${oldChallenges.length} challenges completed over a week ago. Review them to reinforce learning.`,
      priority: 'medium',
      icon: '🔄',
      action: 'Start review session',
    });
  }

  // 3. Advance to next level
  const strongConceptsCount = analytics.strongConcepts.length;
  if (strongConceptsCount >= 3) {
    recommendations.push({
      id: 'advance',
      type: 'advance',
      title: 'Ready for Advanced Challenges',
      description: `You've mastered ${strongConceptsCount} concepts! Try more challenging problems.`,
      priority: 'high',
      icon: '🚀',
      action: 'View advanced challenges',
    });
  }

  // 4. Take a break
  if (analytics.totalPlayTime > 7200000) {
    // 2+ hours
    const hours = Math.round(analytics.totalPlayTime / 3600000);
    recommendations.push({
      id: 'break',
      type: 'break',
      title: 'Take a Break',
      description: `You've been learning for ${hours} hours today. Rest helps consolidate learning.`,
      priority: 'medium',
      icon: '☕',
      action: 'Set reminder for later',
    });
  }

  // 5. Streak maintenance
  if (analytics.streakDays >= 7) {
    recommendations.push({
      id: 'streak',
      type: 'streak',
      title: 'Maintain Your Streak',
      description: `${analytics.streakDays} day streak! Complete one challenge today to keep it going.`,
      priority: 'high',
      icon: '🔥',
      action: 'Quick challenge',
    });
  }

  // 6. Learning velocity
  if (analytics.learningVelocity < 1) {
    recommendations.push({
      id: 'velocity',
      type: 'practice',
      title: 'Boost Learning Pace',
      description: 'Try setting a timer for challenges to build speed and confidence.',
      priority: 'low',
      icon: '⚡',
      action: 'Try timed mode',
    });
  }

  // 7. Perfect scores
  if (analytics.perfectScores === 0 && analytics.challengesCompleted >= 5) {
    recommendations.push({
      id: 'perfect',
      type: 'practice',
      title: 'Aim for Perfect Scores',
      description: 'You haven\'t achieved a perfect score yet. Focus on understanding challenge requirements fully.',
      priority: 'medium',
      icon: '⭐',
      action: 'Review grading criteria',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'medium':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'low':
        return 'from-blue-500/20 to-purple-500/20 border-blue-500/30';
    }
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          💡 Personalized Recommendations
        </h3>
        <p className="text-gray-400">
          AI-powered suggestions based on your learning patterns and progress
        </p>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-gradient-to-br ${getPriorityColor(rec.priority)} border rounded-xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{rec.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-white">{rec.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(
                        rec.priority
                      )}`}
                    >
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{rec.description}</p>
                  {rec.action && (
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/20">
                      {rec.action} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-white mb-2">You&apos;re Doing Great!</h3>
          <p className="text-gray-400">
            Keep learning and recommendations will appear based on your progress.
          </p>
        </div>
      )}

      {/* Learning Path */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          🗺️ Suggested Learning Path
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Foundation Skills</p>
              <p className="text-gray-400 text-sm">HTML basics, CSS fundamentals</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-purple-500/30">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              →
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Current Focus</p>
              <p className="text-gray-400 text-sm">
                {analytics.weakConcepts[0] || 'Advanced layouts & styling'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 opacity-50">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              ○
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Next Steps</p>
              <p className="text-gray-400 text-sm">JavaScript fundamentals, interactivity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
