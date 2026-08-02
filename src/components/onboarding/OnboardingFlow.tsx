'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Building2,
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

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(10_14_23)/0.88] backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 20%, rgb(30 58 138 / 0.35), transparent 45%), radial-gradient(ellipse at 80% 80%, rgb(251 191 36 / 0.12), transparent 40%)',
          }}
        />

        <motion.div
          className="relative mx-4 w-full max-w-xl"
          initial={{ scale: 0.96, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                CodeCraft
              </p>
              <p className="text-sm text-white/60">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              type="button"
              onClick={completeOnboarding}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              Skip introduction
            </button>
          </div>

          <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--energy))]"
              initial={false}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          <motion.div
            key={currentStep}
            className="rounded-[var(--radius-lg)] border border-white/[0.1] bg-[rgb(var(--bg-surface)/0.95)] p-8 shadow-[var(--shadow-lg)]"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[rgb(var(--accent-subtle)/0.25)] bg-[rgb(var(--accent)/0.2)] text-[rgb(var(--accent-subtle))] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
                <Icon icon={currentStepData.icon} size={36} strokeWidth={1.5} />
              </span>
            </div>

            <h2 className="mb-3 text-center text-3xl font-semibold tracking-tight text-white">
              {currentStepData.title}
            </h2>
            <p className="mb-8 text-center text-base leading-relaxed text-white/70">
              {currentStepData.description}
            </p>

            {currentStep === 1 && (
              <div className="mb-6">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  placeholder="Enter callsign"
                  className="w-full rounded-[var(--radius-md)] border border-white/15 bg-white/[0.04] px-5 py-3.5 text-center text-lg text-white placeholder:text-white/35 focus:border-[rgb(var(--accent-subtle))] focus:outline-none"
                  maxLength={20}
                  autoFocus
                />
                {nameError ? (
                  <p className="mt-2 text-center text-sm text-[rgb(var(--error))]" role="alert">
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

          <div className="mt-5 flex justify-center gap-6 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={Code2} size={13} />
              Real code
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={Building2} size={13} />
              Colony feedback
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={Trophy} size={13} />
              Mastery tracking
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
