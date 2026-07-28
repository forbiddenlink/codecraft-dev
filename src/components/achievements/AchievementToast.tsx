/**
 * Achievement Toast Notification
 * Compact notification for achievement unlocks
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { getAchievementIcon } from '@/components/ui/achievementIcons';

export interface AchievementToastProps {
  achievement: {
    id: string;
    title: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  onClose: () => void;
  duration?: number;
}

const rarityGradients = {
  common: 'from-zinc-600 to-zinc-700',
  rare: 'from-[rgb(var(--accent))] to-[rgb(30_58_138)]',
  epic: 'from-[rgb(var(--energy))] to-[rgb(217_119_6)]',
  legendary: 'from-[rgb(var(--success))] to-[rgb(5_150_105)]',
};

export function AchievementToast({
  achievement,
  onClose,
  duration = 4000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in
    setTimeout(() => setIsVisible(true), 100);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`bg-gradient-to-r ${rarityGradients[achievement.rarity]} rounded-[var(--radius-md)] shadow-lg overflow-hidden border border-white/20 min-w-80`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
            <Icon icon={getAchievementIcon(achievement.id, achievement.icon)} size={22} />
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">
              Achievement unlocked
            </p>
            <p className="text-base font-semibold text-white">{achievement.title}</p>
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-white/20 text-white transition-colors hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            aria-label="Dismiss"
          >
            <Icon icon={X} size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/60 origin-left"
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
