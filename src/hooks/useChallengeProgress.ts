// File: /src/hooks/useChallengeProgress.ts
import { useCallback, useEffect, useState } from 'react'
import { resolveBuildingTemplateId } from '@/data/buildingIds'
import { getChallengeById } from '@/data/challenges'
import { useAppDispatch } from '@/store/hooks'
import { unlockBuilding } from '@/store/slices/buildingSlice'
import {
  completeChallenge as completeChallengeRedux,
  hydrateCompletedChallenges,
} from '@/store/slices/challengeSlice'
import { addResources } from '@/store/slices/resourceSlice'
import { completeChallenge as completeChallengeUser } from '@/store/slices/userSlice'
import { unlockVillager } from '@/store/slices/villagerSlice'
import hapticFeedback from '@/utils/hapticFeedback'
import { recordChallengeCompletion } from '@/utils/spacedRepetition'

export interface FirstChallengeOfferProgress {
  placed: boolean
  shown: boolean
  hidden: boolean
}

export type CelebrationType = 'success' | 'levelUp' | 'achievement' | 'mastery'

export function useChallengeProgress() {
  const dispatch = useAppDispatch()
  const [initialProgress] = useState(() => {
    if (typeof window === 'undefined') return { completed: [] as string[], readFailed: false }
    try {
      const raw = localStorage.getItem('completed-challenges')
      const saved: unknown = raw === null ? [] : JSON.parse(raw)
      if (!Array.isArray(saved) || !saved.every((id) => typeof id === 'string' && id.length > 0)) {
        throw new Error('Invalid completion record')
      }
      return { completed: [...new Set(saved as string[])], readFailed: false }
    } catch {
      return { completed: [] as string[], readFailed: true }
    }
  })
  const [completed, setCompleted] = useState<string[]>(initialProgress.completed)
  const [progressSaveError, setProgressSaveError] = useState<string | null>(
    initialProgress.readFailed
      ? 'Saved challenge progress could not be read. Existing saved data was not replaced. New completions stay in this tab only; do not reload before recovering your save.'
      : null
  )
  const [firstChallengeOffer, setFirstChallengeOffer] = useState<FirstChallengeOfferProgress>(
    () => {
      const empty = { placed: false, shown: false, hidden: false }
      if (typeof window === 'undefined') return empty
      try {
        const saved = JSON.parse(localStorage.getItem('first-challenge-offer') || 'null')
        return {
          placed: saved?.placed === true,
          shown: saved?.shown === true,
          hidden: saved?.hidden === true,
        }
      } catch {
        return empty
      }
    }
  )
  const updateFirstChallengeOffer = useCallback((update: Partial<FirstChallengeOfferProgress>) => {
    setFirstChallengeOffer((previous) => {
      const next = { ...previous, ...update }
      try {
        localStorage.setItem('first-challenge-offer', JSON.stringify(next))
      } catch {
        // The optional offer must not block gameplay when storage is unavailable.
      }
      return next
    })
  }, [])
  const markFirstRewardPlaced = useCallback(
    (
      placedId: string | null,
      challengeId: string | undefined,
      rewardTemplateId: string | undefined,
      selectedTemplateId: string
    ): void => {
      if (!placedId || challengeId !== 'intro-1' || rewardTemplateId !== selectedTemplateId) return
      updateFirstChallengeOffer({ placed: true })
    },
    [updateFirstChallengeOffer]
  )
  const markFirstOfferShown = useCallback(
    () => updateFirstChallengeOffer({ shown: true }),
    [updateFirstChallengeOffer]
  )
  const hideFirstOffer = useCallback(
    () => updateFirstChallengeOffer({ hidden: true }),
    [updateFirstChallengeOffer]
  )
  const [pendingCelebration, setPendingCelebration] = useState<CelebrationType | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const [progressSaveMessage, setProgressSaveMessage] = useState<string | null>(null)
  const saveProgress = useCallback((): boolean => {
    setProgressSaveMessage(null)
    // Never replace a record we could not read or validate at startup.
    if (typeof window === 'undefined' || initialProgress.readFailed) return false
    try {
      localStorage.setItem('completed-challenges', JSON.stringify(completed))
      setProgressSaveError(null)
      return true
    } catch {
      setProgressSaveError('Challenge progress could not be saved. New completions stay in this tab only. Retry saving and wait for confirmation before reloading.')
      return false
    }
  }, [completed, initialProgress.readFailed])

  const retrySaveProgress = useCallback(() => {
    const saved = saveProgress()
    if (saved) setProgressSaveMessage('Challenge progress saved in this browser.')
    return saved
  }, [saveProgress])

  useEffect(() => { saveProgress() }, [saveProgress])

  // Hydrate Redux once so FeatureHub achievements survive reload
  useEffect(() => {
    if (hydrated) return
    if (completed.length > 0) {
      dispatch(hydrateCompletedChallenges(completed))
      completed.forEach((id) => {
        dispatch(completeChallengeUser(id))
      })
    }
    setHydrated(true)
  }, [completed, dispatch, hydrated])

  const completeChallenge = useCallback(
    (challengeId: string): CelebrationType | null => {
      if (completed.includes(challengeId)) return null

      const challenge = getChallengeById(challengeId)
      if (!challenge) return null

      // Check if all required challenges are completed
      if (!challenge.requiredChallenges.every((req) => completed.includes(req))) {
        console.warn('Cannot complete challenge - prerequisites not met')
        return null
      }

      // Grant rewards
      challenge.rewards.forEach((reward) => {
        switch (reward.type) {
          case 'resource':
            if (reward.amount) {
              dispatch(addResources({ type: reward.id as any, amount: reward.amount }))
            }
            break
          case 'building':
            dispatch(unlockBuilding(resolveBuildingTemplateId(reward.id)))
            break
          case 'villager':
            dispatch(unlockVillager(reward.id))
            break
          case 'ability':
            // TODO: Implement ability unlocking
            break
        }
      })

      // Record concept mastery for spaced repetition
      recordChallengeCompletion(challenge, true)

      // Determine celebration type based on challenge
      let celebrationType: CelebrationType = 'success'
      const newCompletedCount = completed.length + 1

      // Level up every 5 challenges
      if (newCompletedCount % 5 === 0) {
        celebrationType = 'levelUp'
        hapticFeedback.levelUp()
      } else if (challenge.difficulty === 3) {
        // Advanced challenge = achievement
        celebrationType = 'achievement'
        hapticFeedback.achievement()
      } else {
        hapticFeedback.challengeComplete()
      }

      // Keep Redux in sync so achievements / FeatureHub unlocks fire
      dispatch(completeChallengeRedux(challengeId))
      dispatch(completeChallengeUser(challengeId))

      setPendingCelebration(celebrationType)
      setCompleted((prev) => [...prev, challengeId])

      return celebrationType
    },
    [completed, dispatch]
  )

  const clearCelebration = useCallback(() => {
    setPendingCelebration(null)
  }, [])

  return {
    completed,
    progressSaveError,
    progressSaveMessage,
    canRetrySave: !initialProgress.readFailed,
    retrySaveProgress,
    firstChallengeOffer,
    markFirstRewardPlaced,
    markFirstOfferShown,
    hideFirstOffer,
    completeChallenge,
    pendingCelebration,
    clearCelebration,
  }
}
