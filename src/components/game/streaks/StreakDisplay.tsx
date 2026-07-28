'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Snowflake, ChevronDown, Gift } from 'lucide-react';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { Icon } from '@/components/ui/Icon';
import { HudPanel } from '@/components/ui/HudPanel';

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

  useEffect(() => {
    if (!isStreakUpdatedToday) {
      recordActivity();
    }
  }, [isStreakUpdatedToday, recordActivity]);

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

  const progressPercent = nextMilestone
    ? ((currentStreak % nextMilestone.day) / nextMilestone.day) * 100
    : 100;

  return (
    <HudPanel className={className} padding="sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={currentStreak > 0 ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] ${
              currentStreak > 0
                ? 'bg-[rgb(var(--energy)/0.18)] text-[rgb(var(--energy))]'
                : 'bg-white/[0.06] text-[rgb(var(--text-muted))]'
            }`}
          >
            <Icon icon={currentStreak > 0 ? Flame : Snowflake} size={16} />
          </motion.span>
          <div className="text-left">
            <span className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              {currentStreak}
            </span>
            <span className="ml-1 text-xs text-[rgb(var(--text-muted))]">day streak</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {availableMilestones.length > 0 && (
            <span className="animate-pulse rounded-full bg-[rgb(var(--energy))] px-2 py-0.5 text-[10px] font-semibold text-black">
              Reward
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

      {nextMilestone && (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs text-[rgb(var(--text-muted))]">
            <span>Next: Day {nextMilestone.day}</span>
            <span>{daysUntilNextMilestone} days left</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full bg-[rgb(var(--energy))]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-white/[0.08] pt-3">
              <div className="mb-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[var(--radius-sm)] bg-white/[0.06] p-2">
                  <div className="text-lg font-semibold text-[rgb(var(--energy))]">
                    {longestStreak}
                  </div>
                  <div className="text-xs text-[rgb(var(--text-muted))]">Best streak</div>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-white/[0.06] p-2">
                  <div className="text-lg font-semibold text-[rgb(var(--accent-subtle))]">
                    {nextMilestone?.day || '—'}
                  </div>
                  <div className="text-xs text-[rgb(var(--text-muted))]">Next goal</div>
                </div>
              </div>

              <div className="mb-2 flex justify-between">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  const today = new Date().getDay();
                  const isToday = i === today;
                  const isPast = i < today;
                  const isInStreak = isPast && currentStreak >= today - i;

                  return (
                    <div
                      key={`${day}-${i}`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                        isToday
                          ? 'bg-[rgb(var(--energy))] text-black'
                          : isInStreak
                            ? 'bg-[rgb(var(--energy)/0.35)] text-[rgb(var(--energy))]'
                            : 'bg-white/[0.06] text-[rgb(var(--text-muted))]'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {nextMilestone && (
                <div className="text-center text-xs text-[rgb(var(--text-muted))]">
                  Day {nextMilestone.day}: {nextMilestone.reward.label}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMilestonePopup && availableMilestones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 rounded-[var(--radius-md)] border border-[rgb(var(--energy)/0.35)] bg-[rgb(var(--energy)/0.12)] p-3"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[rgb(var(--energy))]">
              <Icon icon={Gift} size={14} />
              Milestone reached
            </div>
            {availableMilestones.map((milestone) => (
              <div
                key={milestone.day}
                className="mb-1 flex items-center justify-between rounded-[var(--radius-sm)] bg-black/25 p-2 last:mb-0"
              >
                <div>
                  <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                    Day {milestone.day}
                  </div>
                  <div className="text-xs text-[rgb(var(--text-secondary))]">
                    {milestone.reward.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaimMilestone(milestone.day, milestone.reward.label)}
                  className="rounded-[var(--radius-sm)] bg-[rgb(var(--energy))] px-3 py-1 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Claim
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </HudPanel>
  );
}
