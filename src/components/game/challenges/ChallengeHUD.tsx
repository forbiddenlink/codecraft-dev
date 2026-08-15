'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight, Code2, Target, XCircle } from 'lucide-react'
import { HudPanel } from '@/components/ui/HudPanel'
import { Icon } from '@/components/ui/Icon'
import { useChallengeSystem } from '@/hooks/useChallengeSystem'
import { useAppDispatch } from '@/store/hooks'
import { setCode, setEditorVisible, setLanguage } from '@/store/slices/editorSlice'

export default function ChallengeHUD() {
  const dispatch = useAppDispatch()
  const {
    currentChallenge,
    currentIndex,
    isCompleted,
    validateChallenge,
    validationResult,
    isValidating,
    navigateToNextChallenge,
    navigateToPreviousChallenge,
    availableChallenges,
  } = useChallengeSystem()

  if (!currentChallenge) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <HudPanel className="w-80 text-[rgb(var(--text-primary))]">
          <h2 className="text-lg font-semibold">No challenges available</h2>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            You have completed all available challenges or need to unlock new ones.
          </p>
        </HudPanel>
      </motion.div>
    )
  }

  const handleStartCoding = () => {
    dispatch(setEditorVisible(true))
    dispatch(setLanguage('html'))
    if (currentChallenge.htmlTemplate) {
      dispatch(setCode({ language: 'html', code: currentChallenge.htmlTemplate }))
    }
    if (currentChallenge.cssTemplate) {
      dispatch(setCode({ language: 'css', code: currentChallenge.cssTemplate }))
    }
  }

  const difficultyLabel =
    currentChallenge.difficulty === 1
      ? 'Beginner'
      : currentChallenge.difficulty === 2
        ? 'Intermediate'
        : 'Advanced'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <HudPanel className="w-80 text-[rgb(var(--text-primary))]">
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[rgb(var(--text-muted))]">
              <Icon icon={isCompleted ? CheckCircle2 : Target} size={12} />
              Challenge {currentIndex + 1} of {availableChallenges.length}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                currentChallenge.difficulty === 1
                  ? 'bg-[rgb(var(--success)/0.2)] text-[rgb(var(--success))]'
                  : currentChallenge.difficulty === 2
                    ? 'bg-[rgb(var(--energy)/0.2)] text-[rgb(var(--energy))]'
                    : 'bg-[rgb(var(--error)/0.2)] text-[rgb(var(--error))]'
              }`}
            >
              {difficultyLabel}
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{currentChallenge.title}</h2>
          <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
            {currentChallenge.description}
          </p>
        </div>

        {currentChallenge.objectives?.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Objectives
            </h3>
            <ul className="space-y-1.5 text-sm text-[rgb(var(--text-secondary))]">
              {currentChallenge.objectives.map((objective, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--accent-subtle))]" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult && (
          <div
            className={`mb-4 rounded-[var(--radius-sm)] p-3 text-sm ${
              validationResult.success
                ? 'bg-[rgb(var(--success)/0.15)] text-[rgb(var(--success))]'
                : 'bg-[rgb(var(--error)/0.15)] text-[rgb(var(--error))]'
            }`}
          >
            <h3 className="mb-1 flex items-center gap-1.5 font-semibold">
              <Icon icon={validationResult.success ? CheckCircle2 : XCircle} size={14} />
              {validationResult.success ? 'Success' : 'Not quite right'}
            </h3>
            <p>{validationResult.message}</p>
            {validationResult.details && validationResult.details.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs opacity-90">
                {validationResult.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {currentChallenge.rewards?.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[rgb(var(--text-muted))]">
              Rewards
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentChallenge.rewards.map((reward, i) => (
                <span
                  key={`${reward.type}-${reward.id}-${i}`}
                  className="rounded-full bg-[rgb(var(--accent)/0.25)] px-2 py-1 text-xs text-[rgb(var(--accent-subtle))]"
                >
                  {reward.type}: {reward.id}
                  {reward.amount ? ` ×${reward.amount}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={navigateToPreviousChallenge}
              disabled={currentIndex === 0}
              className="btn-secondary flex-1 gap-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon icon={ChevronLeft} size={14} />
              Prev
            </button>
            <button
              type="button"
              onClick={navigateToNextChallenge}
              disabled={currentIndex === availableChallenges.length - 1}
              className="btn-secondary flex-1 gap-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <Icon icon={ChevronRight} size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleStartCoding}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              isCompleted
                ? 'bg-white/15 hover:bg-white/20'
                : 'bg-[rgb(var(--success))] hover:bg-[rgb(22_163_74)]'
            }`}
          >
            <Icon icon={Code2} size={15} />
            {isCompleted ? 'Edit code' : 'Start coding'}
          </button>
          {!isCompleted && (
            <button
              type="button"
              onClick={() => validateChallenge()}
              disabled={isValidating}
              className="btn-primary w-full gap-2 disabled:opacity-50"
            >
              <Icon icon={CheckCircle2} size={15} />
              {isValidating ? 'Checking…' : 'Check solution'}
            </button>
          )}
        </div>
      </HudPanel>
    </motion.div>
  )
}
