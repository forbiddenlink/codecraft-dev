/**
 * Achievement Unlock Animation
 * Beautiful reveal animation for unlocking achievements
 */

import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import { getAchievementIcon } from '@/components/ui/achievementIcons'
import { Icon } from '@/components/ui/Icon'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  unlockedAt?: Date
}

export interface AchievementUnlockProps {
  achievement: Achievement
  onClose: () => void
  autoCloseDelay?: number
}

const rarityConfig = {
  common: {
    gradient: 'from-zinc-600 to-zinc-800',
    border: 'border-zinc-500',
    glow: 'shadow-zinc-500/40',
    particles: '#A1A1AA',
    label: 'Common',
  },
  rare: {
    gradient: 'from-[rgb(var(--accent))] to-[rgb(30_58_138)]',
    border: 'border-[rgb(var(--accent-subtle))]',
    glow: 'shadow-blue-500/40',
    particles: '#3B82F6',
    label: 'Rare',
  },
  epic: {
    gradient: 'from-[rgb(var(--energy))] to-[rgb(180_83_9)]',
    border: 'border-[rgb(var(--energy))]',
    glow: 'shadow-amber-500/40',
    particles: '#FBBF24',
    label: 'Epic',
  },
  legendary: {
    gradient: 'from-[rgb(var(--success))] to-[rgb(5_150_105)]',
    border: 'border-[rgb(var(--success))]',
    glow: 'shadow-emerald-500/40',
    particles: '#10B981',
    label: 'Legendary',
  },
}

export function AchievementUnlock({
  achievement,
  onClose,
  autoCloseDelay = 5000,
}: AchievementUnlockProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const config = rarityConfig[achievement.rarity]

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setIsVisible(true), 100)
    setTimeout(() => setIsAnimating(true), 200)

    // Trigger confetti
    triggerConfetti()

    // Auto-close
    if (autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [])

  const triggerConfetti = () => {
    const colors = [config.particles, '#FFFFFF']
    const particleCount = achievement.rarity === 'legendary' ? 150 : 100

    // Center burst
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.5 },
      colors,
    })

    // Side bursts for legendary
    if (achievement.rarity === 'legendary') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        })
      }, 250)

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        })
      }, 400)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

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
            <div className="mb-6 text-center">
              <p className="mb-2 text-sm uppercase tracking-wider text-[rgb(var(--text-muted))]">
                Achievement unlocked
              </p>
              <div className="mb-2 flex items-center justify-center">
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-semibold text-white ${config.border}`}
                >
                  {config.label}
                </span>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <div
                className={`relative flex h-32 w-32 animate-bounce items-center justify-center rounded-full border-4 bg-gradient-to-br text-white ${config.gradient} ${config.border} ${config.glow}`}
              >
                <Icon
                  icon={getAchievementIcon(achievement.id, achievement.icon)}
                  size={48}
                  strokeWidth={1.5}
                />
                <div
                  className={`absolute inset-0 animate-spin rounded-full border-4 ${config.border}`}
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
  )
}
