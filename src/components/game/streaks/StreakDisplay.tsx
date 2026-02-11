// File: /src/components/game/streaks/StreakDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyStreak } from '@/hooks/useDailyStreak';

interface StreakDisplayProps {
  className?: string;
  onMilestoneClaimed?: (day: number, reward: string) => void;
}

export default function StreakDisplay({
  className = '',
  onMilestoneClaimed,
}: StreakDisplayProps) {
  const {
    currentStreak,
    longestStreak,
    isStreakUpdatedToday,
    recordActivity,
    availableMilestones,
    nextMilestone,
    daysUntilNextMilestone,
    claimMilestone,
  } = useDailyStreak();

  const [showMilestonePopup, setShowMilestonePopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Record activity on mount
  useEffect(() => {
    if (!isStreakUpdatedToday) {
      recordActivity();
    }
  }, [isStreakUpdatedToday, recordActivity]);

  // Show popup if milestones available
  useEffect(() => {
    if (availableMilestones.length > 0) {
      setShowMilestonePopup(true);
    }
  }, [availableMilestones.length]);

  const handleClaimMilestone = (day: number, label: string) => {
    claimMilestone(day);
    onMilestoneClaimed?.(day, label);
    if (availableMilestones.length <= 1) {
      setShowMilestonePopup(false);
    }
  };

  // Progress to next milestone
  const progressPercent = nextMilestone
    ? ((currentStreak % nextMilestone.day) / nextMilestone.day) * 100
    : 100;

  return (
    <div className={`bg-gray-800 bg-opacity-90 rounded-lg p-3 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-xl"
          >
            {currentStreak > 0 ? '\u{1F525}' : '\u{2744}\u{FE0F}'}
          </motion.span>
          <div className="text-left">
            <span className="text-lg font-bold text-white">{currentStreak}</span>
            <span className="text-xs text-gray-400 ml-1">day streak</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {availableMilestones.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-yellow-500 rounded-full text-black font-semibold animate-pulse">
              Reward!
            </span>
          )}
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-400 text-sm"
          >
            {'\u25BC'}
          </motion.span>
        </div>
      </button>

      {/* Progress bar to next milestone */}
      {nextMilestone && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Next: Day {nextMilestone.day}</span>
            <span>{daysUntilNextMilestone} days left</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-700">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center mb-3">
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-lg font-bold text-yellow-400">{longestStreak}</div>
                  <div className="text-xs text-gray-400">Best Streak</div>
                </div>
                <div className="bg-gray-700 rounded p-2">
                  <div className="text-lg font-bold text-blue-400">{nextMilestone?.day || '\u2713'}</div>
                  <div className="text-xs text-gray-400">Next Goal</div>
                </div>
              </div>

              {/* Week view */}
              <div className="flex justify-between mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  const today = new Date().getDay();
                  const isToday = i === today;
                  const isPast = i < today;
                  const isInStreak = isPast && currentStreak >= (today - i);

                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        isToday
                          ? 'bg-orange-500 text-white'
                          : isInStreak
                          ? 'bg-orange-500/50 text-orange-200'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Next reward preview */}
              {nextMilestone && (
                <div className="text-xs text-gray-400 text-center">
                  Day {nextMilestone.day}: {nextMilestone.reward.label}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone claim popup */}
      <AnimatePresence>
        {showMilestonePopup && availableMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg"
          >
            <div className="text-sm font-bold text-white mb-2">
              {'\u{1F389}'} Milestone Reached!
            </div>
            {availableMilestones.map(milestone => (
              <div
                key={milestone.day}
                className="flex items-center justify-between bg-black/20 rounded p-2 mb-1"
              >
                <div>
                  <div className="text-white text-sm font-medium">
                    Day {milestone.day}
                  </div>
                  <div className="text-yellow-200 text-xs">
                    {milestone.reward.label}
                  </div>
                </div>
                <button
                  onClick={() => handleClaimMilestone(milestone.day, milestone.reward.label)}
                  className="px-3 py-1 bg-white text-orange-600 rounded font-semibold text-sm hover:bg-yellow-100 transition-colors"
                >
                  Claim
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
