// File: /src/components/game/challenges/HintPanel.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useProgressiveHints, formatTimeUntilHint } from '@/hooks/useProgressiveHints';
import type { Challenge } from '@/types/challenges';

interface HintPanelProps {
  challenge: Challenge | null | undefined;
  className?: string;
}

/**
 * Progressive Hint Panel
 *
 * Shows hints that reveal over time to help stuck users
 * without giving away answers immediately.
 */
export default function HintPanel({ challenge, className = '' }: HintPanelProps) {
  const {
    visibleHints,
    hintsRevealed,
    totalHints,
    timeUntilNextHint,
    progressToNextHint,
    allHintsRevealed,
    revealNextHint,
  } = useProgressiveHints(challenge);

  if (!challenge || totalHints === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-800 bg-opacity-90 rounded-lg p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1">
          <span>💡</span>
          <span>Hints</span>
          <span className="text-gray-500">({hintsRevealed}/{totalHints})</span>
        </h4>

        {!allHintsRevealed && (
          <button
            onClick={revealNextHint}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
            title="Reveal next hint early"
          >
            Show Next
          </button>
        )}
      </div>

      {/* Progress to next hint */}
      {!allHintsRevealed && timeUntilNextHint !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Next hint in:</span>
            <span>{formatTimeUntilHint(timeUntilNextHint)}</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextHint}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Visible hints */}
      <AnimatePresence mode="popLayout">
        {visibleHints.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400 italic"
          >
            Hints will appear as you work on this challenge...
          </motion.p>
        ) : (
          <ul className="space-y-2">
            {visibleHints.map((hint, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-yellow-400 mt-0.5">
                  {index + 1}.
                </span>
                <span className="text-gray-200">{hint}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>

      {/* All hints revealed message */}
      {allHintsRevealed && visibleHints.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-gray-500 text-center"
        >
          All hints revealed
        </motion.p>
      )}
    </div>
  );
}
