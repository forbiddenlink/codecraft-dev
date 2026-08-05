'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bot, CheckCircle2, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { type CSSProperties, useEffect, useState } from 'react'
import { HudPanel } from '@/components/ui/HudPanel'
import { Icon } from '@/components/ui/Icon'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { endTutorial, nextStep, previousStep } from '@/store/slices/tutorialSlice'

interface HighlightOverlayProps {
  focusArea: string
}

interface TutorialOverlayProps {
  currentStep?: number
  focusArea?: string
  /** When provided, parent owns step advancement — overlay will not also dispatch nextStep. */
  onComplete?: () => void
}

const HighlightOverlay = ({ focusArea }: HighlightOverlayProps) => {
  const getHighlightPosition = (): CSSProperties => {
    switch (focusArea) {
      case 'editor':
        return { left: '20%', top: '50%', width: '36%', height: '70%' }
      case 'game':
        return { left: '55%', top: '48%', width: '46%', height: '70%' }
      case 'header':
        return { left: '50%', top: '8%', width: '90%', height: '12%' }
      case 'buildingMenu':
        return { left: '82%', top: '72%', width: '320px', height: '340px' }
      case 'resourceHUD':
        return { left: '82%', top: '12%', width: '320px', height: '120px' }
      case 'controls':
        return { left: '50%', top: '88%', width: '50%', height: '14%' }
      default:
        return { left: '50%', top: '50%', width: '50%', height: '50%' }
    }
  }

  const position = getHighlightPosition()

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div
        className="absolute rounded-[var(--radius-md)] border-2 border-[rgb(var(--accent-subtle))]"
        style={{
          ...position,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72), 0 0 24px rgb(var(--accent) / 0.45)',
          transition: 'all 0.3s ease-in-out',
        }}
      />
    </div>
  )
}

const TutorialOverlay = ({ currentStep, focusArea, onComplete }: TutorialOverlayProps) => {
  const dispatch = useAppDispatch()
  const tutorialState = useAppSelector((state) => state.tutorial)
  const [showCompleteMessage, setShowCompleteMessage] = useState(false)

  const stepIndex = currentStep ?? tutorialState.currentStepIndex
  const step = tutorialState.steps[stepIndex] || null
  const currentFocusArea = focusArea || step?.focusArea || 'game'
  const isLastStep = stepIndex >= tutorialState.steps.length - 1

  const advance = () => {
    if (onComplete) {
      onComplete()
      return
    }

    if (isLastStep) {
      setShowCompleteMessage(true)
      dispatch(endTutorial())
      setTimeout(() => setShowCompleteMessage(false), 2500)
      return
    }

    dispatch(nextStep())
  }

  // Auto-advance timed steps
  useEffect(() => {
    if (!tutorialState.isActive || !step) return
    if (step.completion?.type !== 'auto') return

    const duration = step.action?.duration ?? 4000
    const timer = window.setTimeout(() => {
      advance()
    }, duration)

    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- advance when step index changes
  }, [tutorialState.isActive, stepIndex, step?.id])

  if (!tutorialState.isActive || !step || !tutorialState.showTutorialUI) {
    return null
  }

  const showContinue = step.completion?.type === 'manual' || step.completion?.type === 'validation'

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <HighlightOverlay focusArea={currentFocusArea} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto absolute bottom-8 left-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2"
        >
          <HudPanel className="border-[rgb(var(--accent-subtle)/0.35)]">
            {showCompleteMessage ? (
              <div className="text-center">
                <div className="mb-2 flex justify-center text-[rgb(var(--success))]">
                  <Icon icon={CheckCircle2} size={28} />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-[rgb(var(--text-primary))]">
                  Tutorial complete
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  Start Coding on the challenge card to begin.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[rgb(var(--text-primary))]">
                    {step.title}
                  </h3>
                  <span className="text-[11px] uppercase tracking-wide text-[rgb(var(--text-muted))]">
                    {stepIndex + 1} / {tutorialState.steps.length}
                  </span>
                </div>

                <p className="mb-3 text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  {step.description}
                </p>

                {step.pixelDialogue && (
                  <div className="mb-4 flex gap-2 rounded-[var(--radius-sm)] border border-white/[0.08] bg-white/[0.04] p-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent-subtle))]">
                      <Icon icon={Bot} size={14} />
                    </span>
                    <p className="text-sm italic text-[rgb(var(--text-secondary))]">
                      {step.pixelDialogue}
                    </p>
                  </div>
                )}

                {step.completion?.type === 'auto' && (
                  <p className="mb-3 text-xs text-[rgb(var(--text-muted))]">
                    Continuing automatically…
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => dispatch(previousStep())}
                      className="btn-secondary gap-1"
                    >
                      <Icon icon={ChevronLeft} size={14} />
                      Back
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch(endTutorial())}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-[rgb(var(--text-muted))] transition-colors hover:text-[rgb(var(--text-primary))]"
                    >
                      <Icon icon={SkipForward} size={14} />
                      Skip
                    </button>

                    {showContinue && (
                      <button type="button" onClick={advance} className="btn-primary gap-1">
                        {isLastStep ? 'Finish' : 'Continue'}
                        <Icon icon={isLastStep ? CheckCircle2 : ChevronRight} size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </HudPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default TutorialOverlay
