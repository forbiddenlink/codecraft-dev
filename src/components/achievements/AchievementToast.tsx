/**
 * Achievement Toast Notification
 * Compact notification for achievement unlocks
 */

import React, { useState, useEffect } from 'react';

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

// Keep gradients for toast celebrations - these are special moments
const rarityGradients = {
  common: 'from-zinc-600 to-zinc-700',
  rare: 'from-blue-600 to-blue-700',
  epic: 'from-violet-600 to-violet-700',
  legendary: 'from-amber-500 to-orange-600',
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
          {/* Icon */}
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            {achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
              Achievement Unlocked
            </p>
            <p className="text-white font-semibold text-base">{achievement.title}</p>
          </div>

          {/* Close */}
          <button
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-[var(--radius-sm)] flex items-center justify-center text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            ✕
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
