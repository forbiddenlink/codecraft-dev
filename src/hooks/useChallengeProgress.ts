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
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completed-challenges')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
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

  // Persist locally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completed-challenges', JSON.stringify(completed))
    }
  }, [completed])

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
    firstChallengeOffer,
    markFirstRewardPlaced,
    markFirstOfferShown,
    hideFirstOffer,
    completeChallenge,
    pendingCelebration,
    clearCelebration,
  }
}
