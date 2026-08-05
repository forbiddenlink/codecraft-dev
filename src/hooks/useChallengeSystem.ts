import { useEffect, useMemo, useState } from 'react'
import { getAvailableChallenges } from '@/data/challenges'
import { challengeSystem, type ValidationResult } from '@/game/systems/ChallengeSystem'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCurrentChallenge } from '@/store/slices/challengeSlice'
import { setPixelMood } from '@/store/slices/gameSlice'

export function useChallengeSystem() {
  const dispatch = useAppDispatch()
  const currentIndex = useAppSelector((state) => state.challenges.currentIndex)
  const completedChallengeIds = useAppSelector((state) => state.challenges.completed)
  const editorCode = useAppSelector((state) => state.editor.code)
  const availableChallenges = useMemo(
    () => getAvailableChallenges(completedChallengeIds),
    [completedChallengeIds]
  )

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const safeIndex = Math.min(currentIndex, Math.max(availableChallenges.length - 1, 0))
  const currentChallenge = availableChallenges[safeIndex]

  useEffect(() => {
    if (currentChallenge) {
      challengeSystem.startChallenge(currentChallenge.id)
    }
  }, [currentChallenge])

  const isCompleted = currentChallenge ? completedChallengeIds.includes(currentChallenge.id) : false

  const validateCurrentChallenge = () => {
    if (!currentChallenge) return

    setIsValidating(true)

    try {
      const combined = `${editorCode.html}\n${editorCode.css}\n${editorCode.javascript}`
      const result = challengeSystem.validateChallenge(currentChallenge.id, combined)

      setValidationResult(result)
      dispatch(setPixelMood(result.success ? 'happy' : 'concerned'))

      return result
    } finally {
      setIsValidating(false)
    }
  }

  const navigateToChallenge = (index: number) => {
    if (index >= 0 && index < availableChallenges.length) {
      dispatch(setCurrentChallenge(index))
      setValidationResult(null)
    }
  }

  const navigateToNextChallenge = () => {
    navigateToChallenge(safeIndex + 1)
  }

  const navigateToPreviousChallenge = () => {
    navigateToChallenge(safeIndex - 1)
  }

  return {
    currentChallenge,
    currentIndex: safeIndex,
    isCompleted,
    validateChallenge: validateCurrentChallenge,
    validationResult,
    isValidating,
    navigateToChallenge,
    navigateToNextChallenge,
    navigateToPreviousChallenge,
    availableChallenges,
    completedChallengeIds,
  }
}
