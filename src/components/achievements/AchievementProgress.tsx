'use client'

/**
 * Achievement Progress Tracker
 * Shows progress towards unlocking achievements
 */

import { Check, Trophy } from 'lucide-react'
import { ACHIEVEMENT_SECTION_ICONS, getAchievementIcon } from '@/components/ui/achievementIcons'
import { Icon } from '@/components/ui/Icon'

export interface AchievementProgressProps {
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    progress: number
    isUnlocked: boolean
    requirement: string
  }[]
  onAchievementClick?: (id: string) => void
}

const rarityColors = {
  common: { text: 'text-[rgb(var(--text-muted))]', bar: 'bg-[rgb(var(--text-muted))]' },
  rare: { text: 'text-[rgb(var(--accent-subtle))]', bar: 'bg-[rgb(var(--accent-subtle))]' },
  epic: { text: 'text-[rgb(var(--energy))]', bar: 'bg-[rgb(var(--energy))]' },
  legendary: {
    text: 'text-[rgb(var(--success))]',
    bar: 'bg-gradient-to-r from-[rgb(var(--energy))] to-[rgb(var(--success))]',
  },
}

export function AchievementProgress({
  achievements,
  onAchievementClick,
}: AchievementProgressProps) {
  const categories = {
    unlocked: achievements.filter((a) => a.isUnlocked),
    inProgress: achievements.filter((a) => !a.isUnlocked && a.progress > 0),
    locked: achievements.filter((a) => !a.isUnlocked && a.progress === 0),
  }

  const unlockedPct =
    achievements.length > 0
      ? Math.round((categories.unlocked.length / achievements.length) * 100)
      : 0

  return (
    <div className="card border border-white/[0.08] bg-[rgb(var(--bg-surface)/0.96)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-h2 text-[rgb(var(--text-primary))]">
            <Icon icon={Trophy} size={22} className="text-[rgb(var(--energy))]" />
            Achievements
          </h2>
          <p className="text-body text-[rgb(var(--text-secondary))]">
            {categories.unlocked.length} / {achievements.length} unlocked
          </p>
        </div>
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" aria-hidden>
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - unlockedPct / 100)}`}
              className="text-[rgb(var(--energy))]"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-body font-semibold text-[rgb(var(--text-primary))]">
              {unlockedPct}%
            </span>
          </div>
        </div>
      </div>

      {categories.unlocked.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-h4 text-[rgb(var(--text-primary))]">
            <Icon
              icon={ACHIEVEMENT_SECTION_ICONS.unlocked}
              size={16}
              className="text-[rgb(var(--success))]"
            />
            Unlocked ({categories.unlocked.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categories.unlocked.map((achievement) => {
              const colors = rarityColors[achievement.rarity]
              return (
                <button
                  key={achievement.id}
                  type="button"
                  className="rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-transform hover:scale-[1.02]"
                  onClick={() => onAchievementClick?.(achievement.id)}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--energy)/0.15)] text-[rgb(var(--energy))]">
                      <Icon icon={getAchievementIcon(achievement.id, achievement.icon)} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-h4 text-[rgb(var(--text-primary))]">
                        {achievement.title}
                      </p>
                      <p className={`text-xs font-medium uppercase ${colors.text}`}>
                        {achievement.rarity}
                      </p>
                    </div>
                    <Icon icon={Check} size={16} className="text-[rgb(var(--success))]" />
                  </div>
                  <p className="text-small text-[rgb(var(--text-secondary))]">
                    {achievement.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {categories.inProgress.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-h4 text-[rgb(var(--text-primary))]">
            <Icon
              icon={ACHIEVEMENT_SECTION_ICONS.inProgress}
              size={16}
              className="text-[rgb(var(--accent-subtle))]"
            />
            In progress ({categories.inProgress.length})
          </h3>
          <div className="space-y-3">
            {categories.inProgress.map((achievement) => {
              const colors = rarityColors[achievement.rarity]
              return (
                <div
                  key={achievement.id}
                  className="rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.04] p-4"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.06] text-[rgb(var(--text-secondary))] opacity-80">
                      <Icon icon={getAchievementIcon(achievement.id, achievement.icon)} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-h4 text-[rgb(var(--text-primary))]">{achievement.title}</p>
                      <p className="text-small text-[rgb(var(--text-secondary))]">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-small text-[rgb(var(--text-muted))]">
                        {achievement.requirement}
                      </span>
                      <span className="text-body font-semibold text-[rgb(var(--text-primary))]">
                        {achievement.progress}%
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${colors.bar}`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {categories.locked.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-h4 text-[rgb(var(--text-primary))]">
            <Icon
              icon={ACHIEVEMENT_SECTION_ICONS.locked}
              size={16}
              className="text-[rgb(var(--text-muted))]"
            />
            Locked ({categories.locked.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.locked.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.03] p-3 text-center opacity-55"
              >
                <div className="mb-2 flex justify-center text-[rgb(var(--text-muted))]">
                  <Icon icon={getAchievementIcon(achievement.id, achievement.icon)} size={22} />
                </div>
                <p className="text-small font-medium text-[rgb(var(--text-muted))]">
                  {achievement.title}
                </p>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">Hidden</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
