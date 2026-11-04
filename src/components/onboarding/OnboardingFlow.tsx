'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  Crosshair,
  Rocket,
  Route,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { WELCOME_TUTORIAL } from '@/data/tutorialData'
import { useAppDispatch } from '@/store/hooks'
import { startTutorial } from '@/store/slices/tutorialSlice'
import { setUser } from '@/store/slices/userSlice'
import { identifyUser, trackEvent } from '@/utils/analytics'

type OnboardingStep = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export default function OnboardingFlow() {
  const dispatch = useAppDispatch()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('codecraft_onboarding_complete')
    if (!hasCompletedOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const steps: OnboardingStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: 'Welcome to CodeCraft',
        description:
          'Build a galactic colony by writing real HTML, CSS, and JavaScript. Your first structures rise on Planet Codex-7.',
        icon: Rocket,
      },
      {
        id: 'name',
        title: 'Commander callsign',
        description: 'Choose the name Pixel and your colony logs will use.',
        icon: UserRound,
      },
      {
        id: 'pixel',
        title: 'Meet Pixel',
        description:
          'Pixel is your companion for hints, feedback, and challenge context as you expand the colony.',
        icon: Bot,
      },
      {
        id: 'gameplay',
        title: 'How it works',
        description:
          'Write code in Monaco. Valid solutions unlock buildings, resources, and the next challenge.',
        icon: Code2,
      },
      {
        id: 'challenges',
        title: 'Guided learning path',
        description:
          'Start with semantic HTML, then layout and scripting — each challenge builds on the last.',
        icon: Route,
      },
      {
        id: 'rewards',
        title: 'Colony rewards',
        description:
          'Completing challenges grants XP, unlocks structures, and tracks mastery over time.',
        icon: Trophy,
      },
      {
        id: 'ready',
        title: 'Ready to begin',
        description:
          'Your first objective: build a header beacon. Use Start Coding, then Check Solution when ready.',
        icon: Crosshair,
      },
    ],
    []
  )

  const currentStepData = steps[currentStep]

  const completeOnboarding = () => {
    const name = username.trim() || 'Commander'
    localStorage.setItem('codecraft_username', name)
    localStorage.setItem('codecraft_onboarding_complete', 'true')

    const userId =
      localStorage.getItem('codecraft_user_id') ||
      `player_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem('codecraft_user_id', userId)

    dispatch(setUser({ id: userId, username: name }))
    void identifyUser(userId, { username: name })
    void trackEvent({ name: 'onboarding_completed', properties: { username: name } })

    dispatch(
      startTutorial({
        tutorialId: WELCOME_TUTORIAL.id,
        steps: WELCOME_TUTORIAL.steps,
      })
    )

    setIsVisible(false)
  }

  const handleNext = () => {
    if (currentStep === 1 && !username.trim()) {
      setNameError('Enter a callsign to continue.')
      return
    }
    setNameError('')

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  if (!isVisible) return null

  // Docked card, not a modal: the game world stays visible and interactive behind it, so a
  // first-time visitor can read the page instead of facing a blurred screen.
  return (
    <AnimatePresence>
      <motion.section
        aria-label="CodeCraft introduction"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 sm:p-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25 }}
      >
        <div className="pointer-events-auto w-full max-w-md rounded-[var(--radius-lg)] border border-white/[0.12] bg-[rgb(var(--bg-surface)/0.97)] p-5 shadow-[var(--shadow-lg)]">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs text-white/70">
              <span className="font-medium uppercase tracking-[0.2em]">CodeCraft</span>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              Step {currentStep + 1} of {steps.length}
            </p>
            <button
              type="button"
              onClick={completeOnboarding}
              className="focus-ring rounded text-sm text-white/70 transition-colors hover:text-white"
            >
              Skip introduction
            </button>
          </div>

          <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--energy))]"
              initial={false}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--accent-subtle)/0.25)] bg-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent-subtle))]">
                <Icon icon={currentStepData.icon} size={22} strokeWidth={1.5} />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {currentStepData.title}
              </h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-white/75">
              {currentStepData.description}
            </p>

            {currentStep === 1 && (
              <div className="mb-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="Enter callsign"
                  aria-label="Commander callsign"
                  className="w-full rounded-[var(--radius-md)] border border-white/15 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-[rgb(var(--accent-subtle))] focus:outline-none"
                  maxLength={20}
                  autoFocus
                />
                {nameError ? (
                  <p className="mt-2 text-sm text-[rgb(var(--error))]" role="alert">
                    {nameError}
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn-secondary flex-1 gap-2 focus-ring"
                >
                  <Icon icon={ChevronLeft} size={16} />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex-1 gap-2 focus-ring"
              >
                {currentStep === steps.length - 1 ? 'Start building' : 'Continue'}
                {currentStep < steps.length - 1 ? <Icon icon={ChevronRight} size={16} /> : null}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
