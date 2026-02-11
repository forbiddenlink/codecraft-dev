// File: /src/components/game/challenges/MasteryDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getMasteryByCategory,
  getConceptsNeedingReview,
  getConceptDisplayName,
  type ReviewCard,
} from '@/utils/spacedRepetition';

interface MasteryDashboardProps {
  className?: string;
  onReviewConcept?: (concept: string) => void;
}

interface CategoryMastery {
  html: number;
  css: number;
  javascript: number;
  overall: number;
}

interface ConceptsNeedingReview {
  html: ReviewCard[];
  css: ReviewCard[];
  javascript: ReviewCard[];
}

/**
 * Mastery Dashboard
 *
 * Shows learning progress by category and concepts due for review.
 * Uses spaced repetition data to track mastery over time.
 */
export default function MasteryDashboard({
  className = '',
  onReviewConcept,
}: MasteryDashboardProps) {
  const [mastery, setMastery] = useState<CategoryMastery>({
    html: 0,
    css: 0,
    javascript: 0,
    overall: 0,
  });
  const [needsReview, setNeedsReview] = useState<ConceptsNeedingReview>({
    html: [],
    css: [],
    javascript: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const refreshData = useCallback(() => {
    setMastery(getMasteryByCategory());
    setNeedsReview(getConceptsNeedingReview());
  }, []);

  useEffect(() => {
    refreshData();
    // Refresh every 30 seconds to catch updates
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const totalDueForReview =
    needsReview.html.length +
    needsReview.css.length +
    needsReview.javascript.length;

  const getMasteryColor = (percent: number): string => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 20) return 'bg-orange-500';
    return 'bg-gray-600';
  };

  const getMasteryLabel = (percent: number): string => {
    if (percent >= 80) return 'Mastered';
    if (percent >= 50) return 'Proficient';
    if (percent >= 20) return 'Learning';
    if (percent > 0) return 'Beginner';
    return 'Not started';
  };

  const categories = [
    { key: 'html' as const, label: 'HTML', icon: '📄', color: 'text-orange-400' },
    { key: 'css' as const, label: 'CSS', icon: '🎨', color: 'text-blue-400' },
    { key: 'javascript' as const, label: 'JavaScript', icon: '⚡', color: 'text-yellow-400' },
  ];

  return (
    <div className={`bg-gray-800 bg-opacity-90 rounded-lg p-3 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-2"
      >
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
          <span>📊</span>
          <span>Learning Progress</span>
        </h4>
        <div className="flex items-center gap-2">
          {totalDueForReview > 0 && (
            <span className="text-xs px-2 py-0.5 bg-purple-600 rounded-full text-white">
              {totalDueForReview} due
            </span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Overall Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Overall Mastery</span>
          <span>{Math.round(mastery.overall)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getMasteryColor(mastery.overall)}`}
            initial={{ width: 0 }}
            animate={{ width: `${mastery.overall}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          {getMasteryLabel(mastery.overall)}
        </p>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Category Breakdown */}
            <div className="space-y-3 mb-4">
              {categories.map(({ key, label, icon, color }) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`${color} flex items-center gap-1`}>
                      <span>{icon}</span>
                      <span>{label}</span>
                    </span>
                    <span className="text-gray-400">
                      {Math.round(mastery[key])}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={getMasteryColor(mastery[key])}
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery[key]}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{ height: '100%' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Concepts Due for Review */}
            {totalDueForReview > 0 && (
              <div className="border-t border-gray-700 pt-3">
                <h5 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1">
                  <span>🔄</span>
                  <span>Ready for Review</span>
                </h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {categories.map(({ key, color }) =>
                    needsReview[key].map((card) => (
                      <motion.button
                        key={card.concept}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onReviewConcept?.(card.concept)}
                        className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center justify-between ${color}`}
                        disabled={!onReviewConcept}
                      >
                        <span>{getConceptDisplayName(card.concept)}</span>
                        <span className="text-gray-500 text-[10px]">
                          {card.repetitions} reviews
                        </span>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {mastery.overall === 0 && (
              <p className="text-xs text-gray-500 text-center italic">
                Complete challenges to track your progress!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
