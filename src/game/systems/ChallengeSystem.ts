import { resolveBuildingTemplateId } from '@/data/buildingIds'
import { getChallengeById } from '@/data/challenges'
import { unlockBuilding as unlockBuildingTemplate } from '@/store/slices/buildingSlice'
import { completeChallenge, startChallenge } from '@/store/slices/challengeSlice'
import { addResources } from '@/store/slices/resourceSlice'
import { clearJustUnlocked, gainXP, unlockBuilding, unlockFeature } from '@/store/slices/userSlice'
import { unlockVillager } from '@/store/slices/villagerSlice'
import { store } from '@/store/store'
import type { Challenge } from '@/types/challenges'

export interface ValidationResult {
  success: boolean
  message: string
  details?: string[]
}

export class ChallengeSystem {
  /**
   * Start a challenge
   */
  startChallenge(challengeId: string): Challenge | null {
    // Get challenge data
    const challenge = getChallengeById(challengeId)
    if (!challenge) {
      console.error(`Challenge ${challengeId} not found`)
      return null
    }

    // Update Redux state
    store.dispatch(startChallenge(challengeId))

    return challenge
  }

  /**
   * Validate if a challenge is completed
   */
  validateChallenge(challengeId: string, code: string): ValidationResult {
    // Get challenge data
    const challenge = getChallengeById(challengeId)
    if (!challenge) {
      return {
        success: false,
        message: `Challenge ${challengeId} not found`,
      }
    }

    // Use the challenge's validate function
    const isValid = challenge.validate(code)

    if (isValid) {
      // Complete the challenge
      this.completeChallenge(challengeId)

      return {
        success: true,
        message: 'Challenge completed successfully!',
        details: [
          "Great job! You've successfully completed the challenge.",
          ...this.getRewardMessages(challenge),
        ],
      }
    }

    return {
      success: false,
      message: 'Not quite there yet. Keep trying!',
      details: challenge.hints,
    }
  }

  /**
   * Complete a challenge and grant rewards
   */
  completeChallenge(challengeId: string): void {
    const challenge = getChallengeById(challengeId)
    if (!challenge) return

    // Mark challenge as completed in store
    store.dispatch(completeChallenge(challengeId))

    // Grant default XP
    store.dispatch(gainXP(100))

    // Process rewards
    challenge.rewards.forEach((reward) => {
      switch (reward.type) {
        case 'building': {
          const templateId = resolveBuildingTemplateId(reward.id)
          store.dispatch(unlockBuilding(templateId))
          store.dispatch(unlockBuildingTemplate(templateId))
          break
        }

        case 'resource':
          if (reward.amount) {
            store.dispatch(
              addResources({
                type: reward.id as any,
                amount: reward.amount,
              })
            )
          }
          break

        case 'villager':
          store.dispatch(unlockVillager(reward.id))
          break

        case 'ability':
          store.dispatch(unlockFeature(reward.id))
          break
      }
    })

    // Clear just unlocked after a delay
    setTimeout(() => {
      store.dispatch(clearJustUnlocked())
    }, 5000)
  }

  /**
   * Get reward messages for a challenge
   */
  private getRewardMessages(challenge: Challenge): string[] {
    const rewards: string[] = ['You earned 100 XP!']

    challenge.rewards.forEach((reward) => {
      switch (reward.type) {
        case 'building':
          rewards.push(`Unlocked building: ${reward.id}`)
          break

        case 'resource':
          if (reward.amount) {
            rewards.push(`Received ${reward.amount} ${reward.id}`)
          }
          break

        case 'villager':
          rewards.push(`Unlocked villager: ${reward.id}`)
          break

        case 'ability':
          rewards.push(`Unlocked ability: ${reward.id}`)
          break
      }
    })

    return rewards
  }
}

// Export singleton instance
export const challengeSystem = new ChallengeSystem()
