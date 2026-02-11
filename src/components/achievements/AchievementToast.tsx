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

const rarityColors = {
  common: 'from-gray-600 to-gray-700',
  rare: 'from-blue-600 to-blue-700',
  epic: 'from-purple-600 to-purple-700',
  legendary: 'from-yellow-600 to-orange-600',
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
        className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} rounded-lg shadow-2xl overflow-hidden border-2 border-white/20 min-w-80`}
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      >
        <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
          {/* Icon */}
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl animate-bounce">
            {achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
              Achievement Unlocked
            </p>
            <p className="text-white font-bold text-lg">{achievement.title}</p>
          </div>

          {/* Close */}
          <button
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
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
            className="h-full bg-white/60 animate-shrink origin-left"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
