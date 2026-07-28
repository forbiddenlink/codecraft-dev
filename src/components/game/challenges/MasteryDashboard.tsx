'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronDown, RefreshCw, FileCode2, Palette, Zap } from 'lucide-react';
import {
  getMasteryByCategory,
  getConceptsNeedingReview,
  getConceptDisplayName,
  type ReviewCard,
} from '@/utils/spacedRepetition';
import { Icon } from '@/components/ui/Icon';
import { HudPanel } from '@/components/ui/HudPanel';

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
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-[rgb(var(--success))]';
    if (percentage >= 50) return 'bg-[rgb(var(--energy))]';
    if (percentage >= 25) return 'bg-[rgb(var(--accent-subtle))]';
    return 'bg-[rgb(var(--error))]';
  };

  const getMasteryLabel = (percentage: number) => {
    if (percentage >= 80) return 'Expert';
    if (percentage >= 50) return 'Proficient';
    if (percentage >= 25) return 'Developing';
    return 'Beginner';
  };

  const totalDueForReview =
    needsReview.html.length + needsReview.css.length + needsReview.javascript.length;

  const categories = [
    {
      key: 'html' as const,
      label: 'HTML',
      icon: FileCode2,
      color: 'text-[rgb(var(--accent-subtle))]',
    },
    {
      key: 'css' as const,
      label: 'CSS',
      icon: Palette,
      color: 'text-[rgb(var(--energy))]',
    },
    {
      key: 'javascript' as const,
      label: 'JavaScript',
      icon: Zap,
      color: 'text-[rgb(var(--success))]',
    },
  ];

  return (
    <HudPanel className={className} padding="sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 flex w-full items-center justify-between"
      >
        <h4 className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]">
          <Icon icon={BarChart3} size={15} className="text-[rgb(var(--accent-subtle))]" />
          Learning Progress
        </h4>
        <div className="flex items-center gap-2">
          {totalDueForReview > 0 && (
            <span className="rounded-full bg-[rgb(var(--accent))] px-2 py-0.5 text-[10px] font-medium text-white">
              {totalDueForReview} due
            </span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-[rgb(var(--text-muted))]"
          >
            <Icon icon={ChevronDown} size={14} />
          </motion.span>
        </div>
      </button>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-[rgb(var(--text-muted))]">
          <span>Overall mastery</span>
          <span>{Math.round(mastery.overall)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className={`h-full ${getMasteryColor(mastery.overall)}`}
            initial={{ width: 0 }}
            animate={{ width: `${mastery.overall}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-[rgb(var(--text-muted))]">
          {getMasteryLabel(mastery.overall)}
        </p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-4 space-y-3">
              {categories.map(({ key, label, icon, color }) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={`${color} flex items-center gap-1.5`}>
                      <Icon icon={icon} size={12} />
                      <span>{label}</span>
                    </span>
                    <span className="text-[rgb(var(--text-muted))]">{Math.round(mastery[key])}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
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

            {totalDueForReview > 0 && (
              <div className="border-t border-white/[0.08] pt-3">
                <h5 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--text-muted))]">
                  <Icon icon={RefreshCw} size={12} />
                  Ready for review
                </h5>
                <div className="max-h-32 space-y-1 overflow-y-auto">
                  {categories.map(({ key, color }) =>
                    needsReview[key].map((card) => (
                      <motion.button
                        key={card.concept}
                        type="button"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onReviewConcept?.(card.concept)}
                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs transition-colors hover:bg-white/[0.06] ${color}`}
                        disabled={!onReviewConcept}
                      >
                        <span>{getConceptDisplayName(card.concept)}</span>
                        <span className="text-[10px] text-[rgb(var(--text-muted))]">
                          {card.repetitions} reviews
                        </span>
                      </motion.button>
                    )),
                  )}
                </div>
              </div>
            )}

            {mastery.overall === 0 && (
              <p className="text-center text-xs italic text-[rgb(var(--text-muted))]">
                Complete challenges to track your progress.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </HudPanel>
  );
}
