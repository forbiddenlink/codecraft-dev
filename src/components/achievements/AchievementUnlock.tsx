/**
 * Achievement Unlock Animation
 * Beautiful reveal animation for unlocking achievements
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: Date;
}

export interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseDelay?: number;
}

const rarityConfig = {
  common: {
    gradient: 'from-gray-600 to-gray-800',
    border: 'border-gray-500',
    glow: 'shadow-gray-500/50',
    particles: '#9CA3AF',
    label: 'Common',
    emoji: '⚪',
  },
  rare: {
    gradient: 'from-blue-600 to-blue-800',
    border: 'border-blue-500',
    glow: 'shadow-blue-500/50',
    particles: '#3B82F6',
    label: 'Rare',
    emoji: '🔵',
  },
  epic: {
    gradient: 'from-purple-600 to-purple-800',
    border: 'border-purple-500',
    glow: 'shadow-purple-500/50',
    particles: '#A855F7',
    label: 'Epic',
    emoji: '🟣',
  },
  legendary: {
    gradient: 'from-yellow-600 to-orange-600',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/50',
    particles: '#EAB308',
    label: 'Legendary',
    emoji: '🟡',
  },
};

export function AchievementUnlock({
  achievement,
  onClose,
  autoCloseDelay = 5000,
}: AchievementUnlockProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const config = rarityConfig[achievement.rarity];

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setIsAnimating(true), 200);

    // Trigger confetti
    triggerConfetti();

    // Auto-close
    if (autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, []);

  const triggerConfetti = () => {
    const colors = [config.particles, '#FFFFFF'];
    const particleCount = achievement.rarity === 'legendary' ? 150 : 100;

    // Center burst
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.5 },
      colors,
    });

    // Side bursts for legendary
    if (achievement.rarity === 'legendary') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 400);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={handleClose}
    >
      <div
        className={`max-w-md w-full transition-all duration-500 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br ${config.gradient}`}
        />

        {/* Main Card */}
        <div
          className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 ${config.border} ${config.glow} shadow-2xl overflow-hidden`}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${config.gradient} animate-pulse`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>

          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                Achievement Unlocked!
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>{config.emoji}</span>
                <span className={`text-sm font-bold ${config.border} px-3 py-1 rounded-full`}>
                  {config.label}
                </span>
                <span>{config.emoji}</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className={`relative w-32 h-32 bg-gradient-to-br ${config.gradient} rounded-full flex items-center justify-center text-6xl animate-bounce border-4 ${config.border} ${config.glow}`}
              >
                {achievement.icon}
                {/* Rotating ring */}
                <div
                  className={`absolute inset-0 border-4 ${config.border} rounded-full animate-spin`}
                  style={{ animationDuration: '3s' }}
                />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-3">{achievement.title}</h2>
              <p className="text-gray-300 text-lg">{achievement.description}</p>
            </div>

            {/* Reward */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-bold">+{achievement.xpReward}</p>
                  <p className="text-gray-400 text-sm">XP</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className={`w-full py-3 bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white rounded-lg font-bold text-lg transition-opacity`}
            >
              Awesome!
            </button>

            {/* Auto-close indicator */}
            {autoCloseDelay > 0 && (
              <p className="text-center text-gray-500 text-xs mt-3">
                Auto-closing in {Math.ceil(autoCloseDelay / 1000)}s...
              </p>
            )}
          </div>

          {/* Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
