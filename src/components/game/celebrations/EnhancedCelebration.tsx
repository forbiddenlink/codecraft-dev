'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { soundSystem } from '@/utils/soundSystem';

interface EnhancedCelebrationProps {
  isVisible: boolean;
  type: 'challenge' | 'levelUp' | 'achievement' | 'perfectScore' | 'streak';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onComplete?: () => void;
  duration?: number;
}

export function EnhancedCelebration({
  isVisible,
  type,
  title,
  description,
  icon,
  onComplete,
  duration = 4000,
}: EnhancedCelebrationProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    // Trigger celebration effects based on type
    switch (type) {
      case 'challenge':
        challengeCelebration();
        soundSystem.playSFX('challenge_complete');
        break;
      case 'levelUp':
        levelUpCelebration();
        soundSystem.playSFX('level_up');
        break;
      case 'achievement':
        achievementCelebration();
        soundSystem.playSFX('achievement_unlock');
        break;
      case 'perfectScore':
        perfectScoreCelebration();
        soundSystem.playSFX('achievement_unlock');
        break;
      case 'streak':
        streakCelebration();
        soundSystem.playSFX('notification');
        break;
    }

    // Auto-close after duration
    timeoutRef.current = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, type, duration, onComplete]);

  const challengeCelebration = () => {
    // Standard confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B'],
    });
  };

  const levelUpCelebration = () => {
    // Fireworks effect
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });
    }, 250);
  };

  const achievementCelebration = () => {
    // Star burst
    confetti({
      particleCount: 150,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
    });
    confetti({
      particleCount: 150,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
    });
  };

  const perfectScoreCelebration = () => {
    // Continuous confetti rain
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00FF00', '#32CD32', '#228B22'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00FF00', '#32CD32', '#228B22'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const streakCelebration = () => {
    // Upward burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 1.0 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    });
  };

  const getCelebrationColor = () => {
    switch (type) {
      case 'challenge':
        return 'from-blue-500 to-purple-600';
      case 'levelUp':
        return 'from-yellow-400 to-orange-500';
      case 'achievement':
        return 'from-purple-500 to-pink-600';
      case 'perfectScore':
        return 'from-green-400 to-emerald-600';
      case 'streak':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getCelebrationColor()} blur-3xl opacity-50 rounded-3xl`} />

            {/* Card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className={`absolute -inset-full bg-gradient-to-r ${getCelebrationColor()} opacity-10`}
                />
              </div>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon */}
                {icon && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex justify-center mb-6"
                  >
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getCelebrationColor()} flex items-center justify-center text-white text-5xl shadow-lg`}>
                      {icon}
                    </div>
                  </motion.div>
                )}

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  {title}
                </motion.h2>

                {/* Description */}
                {description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-600 dark:text-gray-300 mb-6"
                  >
                    {description}
                  </motion.p>
                )}

                {/* Sparkles */}
                <div className="absolute top-4 left-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>
                </div>
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      rotate: [360, 180, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>
                </div>

                {/* Click to continue */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="text-sm text-gray-400 mt-4"
                >
                  Click anywhere to continue
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
