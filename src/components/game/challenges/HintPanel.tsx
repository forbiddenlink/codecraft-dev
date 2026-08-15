'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Lightbulb } from 'lucide-react'
import { HudPanel } from '@/components/ui/HudPanel'
import { Icon } from '@/components/ui/Icon'
import { formatTimeUntilHint, useProgressiveHints } from '@/hooks/useProgressiveHints'
import type { Challenge } from '@/types/challenges'

interface HintPanelProps {
  challenge: Challenge | null | undefined
  className?: string
}

export default function HintPanel({ challenge, className = '' }: HintPanelProps) {
  const {
    visibleHints,
    hintsRevealed,
    totalHints,
    timeUntilNextHint,
    progressToNextHint,
    allHintsRevealed,
    revealNextHint,
  } = useProgressiveHints(challenge)

  if (!challenge || totalHints === 0) {
    return null
  }

  return (
    <HudPanel className={className} padding="sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]">
          <Icon icon={Lightbulb} size={15} className="text-[rgb(var(--energy))]" />
          Hints
          <span className="text-[rgb(var(--text-muted))]">
            ({hintsRevealed}/{totalHints})
          </span>
        </h4>

        {!allHintsRevealed && (
          <button
            type="button"
            onClick={revealNextHint}
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-white/[0.06] px-2 py-1 text-xs text-[rgb(var(--text-secondary))] transition-colors hover:bg-white/[0.1]"
            title="Reveal next hint early"
          >
            Show next
            <Icon icon={ChevronRight} size={12} />
          </button>
        )}
      </div>

      {!allHintsRevealed && timeUntilNextHint !== null && (
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-[11px] text-[rgb(var(--text-muted))]">
            <span>Next hint</span>
            <span>{formatTimeUntilHint(timeUntilNextHint)}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="h-full bg-[rgb(var(--accent-subtle))]"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextHint}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {visibleHints.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm italic text-[rgb(var(--text-muted))]"
          >
            Hints appear as you work on this challenge.
          </motion.p>
        ) : (
          <ul className="space-y-2">
            {visibleHints.map((hint, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--energy)/0.15)] text-[10px] font-semibold text-[rgb(var(--energy))]">
                  {index + 1}
                </span>
                <span className="text-[rgb(var(--text-secondary))]">{hint}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>
    </HudPanel>
  )
}
