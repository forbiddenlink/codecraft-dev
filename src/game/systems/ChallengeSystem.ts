import { store } from '@/store/store';
import { 
  startChallenge, 
  completeChallenge,
  Challenge
} from '@/store/slices/challengeSlice';
import { 
  gainXP, 
  unlockBuilding, 
  unlockFeature,
  clearJustUnlocked
} from '@/store/slices/userSlice';
import { addResources } from '@/store/slices/resourceSlice';
import { unlockVillager } from '@/store/slices/villagerSlice';
import { getChallengeById } from '@/data/challenges';
import { parseHtmlToStructure } from '@/utils/htmlParser';
import { validateCode } from '@/utils/validateCode';

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: string[];
}

export class ChallengeSystem {
  /**
   * Start a challenge
   */
  startChallenge(challengeId: string): Challenge | null {
    // Get challenge data
    const challenge = getChallengeById(challengeId);
    if (!challenge) {
      console.error(`Challenge ${challengeId} not found`);
      return null;
    }
    
    // Update Redux state
    store.dispatch(startChallenge(challengeId));
    
    return challenge;
  }
  
  /**
   * Validate if a challenge is completed
   */
  validateChallenge(challengeId: string, code: string): ValidationResult {
    // Get challenge data
    const challenge = getChallengeById(challengeId);
    if (!challenge) {
      return {
        success: false,
        message: `Challenge ${challengeId} not found`
      };
    }
    
    // Default validation (for backward compatibility)
    let isValid = false;
    if (typeof challenge.validate === 'function') {
      isValid = challenge.validate(code);
    } else {
      // Determine validation method based on challenge type
      isValid = this.validateByType(challenge, code);
    }
    
    if (isValid) {
      // Complete the challenge
      this.completeChallenge(challengeId);
      
      return {
        success: true,
        message: "Challenge completed successfully!",
        details: [
          "Great job! You've successfully completed the challenge.",
          `You've earned ${challenge.rewards.xp} XP.`,
          ...this.getRewardMessages(challenge)
        ]
      };
    }
    
    return {
      success: false,
      message: "Not quite there yet. Keep trying!",
      details: this.getHintMessages(challenge)
    };
  }
  
  /**
   * Validate based on challenge type
   */
  private validateByType(challenge: Challenge, code: string): boolean {
    switch (challenge.type) {
      case 'building':
        return this.validateBuildingChallenge(challenge, code);
        
      case 'coding':
        return this.validateCodingChallenge(challenge, code);
        
      case 'resource':
        return this.validateResourceChallenge(challenge);
        
      case 'tutorial':
        // Tutorial challenges might have their own validation
        return true;
        
      default:
        return false;
    }
  }
  
  /**
   * Validate building challenge (checking structure)
   */
  private validateBuildingChallenge(challenge: Challenge, code: string): boolean {
    // Parse code to structure
    const structure = parseHtmlToStructure(code);
    
    // Check for required elements
    if (challenge.requirements?.buildings) {
      const requiredBuildings = challenge.requirements.buildings;
      
      // Check if all required buildings are present
      return requiredBuildings.every(building => {
        if (building.includes('#')) {
          // Check for element with specific ID
          const [tag, id] = building.split('#');
          return structure.some(node => 
            node.elementType === tag && node.attributes?.id === id
          );
        } else if (building.includes('.')) {
          // Check for element with specific class
          const [tag, className] = building.split('.');
          return structure.some(node => 
            node.elementType === tag && node.classes.includes(className)
          );
        } else {
          // Check for element type
          return structure.some(node => node.elementType === building);
        }
      });
    }
    
    return false;
  }
  
  /**
   * Validate coding challenge (using tests or templates)
   */
  private validateCodingChallenge(challenge: Challenge, code: string): boolean {
    // Check against tests if present
    if (challenge.requirements?.code?.tests) {
      return challenge.requirements.code.tests.every(test => {
        if (typeof test.test === 'string') {
          // Regex test
          const regex = new RegExp(test.test);
          return regex.test(code);
        } else if (typeof test.test === 'function') {
          // Function test
          return test.test(code);
        }
        return false;
      });
    }
    
    // Fallback to validateCode utility
    return validateCode(code, challenge);
  }
  
  /**
   * Validate resource challenge (checking player resources)
   */
  private validateResourceChallenge(challenge: Challenge): boolean {
    if (!challenge.requirements?.resources) return false;
    
    // Get current resources
    const { resource } = store.getState();
    
    // Check if player has required resources
    return Object.entries(challenge.requirements.resources).every(([resourceType, amount]) => {
      return resource.storage[resourceType] >= amount;
    });
  }
  
  /**
   * Complete a challenge and grant rewards
   */
  completeChallenge(challengeId: string): void {
    const challenge = getChallengeById(challengeId);
    if (!challenge) return;
    
    // Mark challenge as completed in store
    store.dispatch(completeChallenge(challengeId));
    
    // Grant XP
    if (challenge.rewards.xp) {
      store.dispatch(gainXP(challenge.rewards.xp));
    }
    
    // Grant resources
    if (challenge.rewards.resources) {
      Object.entries(challenge.rewards.resources).forEach(([resourceType, amount]) => {
        if (amount) {
          store.dispatch(addResources({
            type: resourceType as any,
            amount
          }));
        }
      });
    }
    
    // Grant unlocks
    if (challenge.rewards.unlocks) {
      // Buildings
      challenge.rewards.unlocks.buildings?.forEach(buildingId => {
        store.dispatch(unlockBuilding(buildingId));
      });
      
      // Features
      challenge.rewards.unlocks.features?.forEach(featureId => {
        store.dispatch(unlockFeature(featureId));
      });
      
      // Villagers
      challenge.rewards.unlocks.villagers?.forEach(villagerId => {
        store.dispatch(unlockVillager(villagerId));
      });
    }
    
    // Clear just unlocked after a delay
    setTimeout(() => {
      store.dispatch(clearJustUnlocked());
    }, 5000);
  }
  
  /**
   * Get hint messages for a challenge
   */
  private getHintMessages(challenge: Challenge): string[] {
    const hints: string[] = [];
    
    if (challenge.type === 'building') {
      hints.push("Try adding the required building elements to your code.");
      if (challenge.requirements?.buildings) {
        hints.push(`Required elements: ${challenge.requirements.buildings.join(', ')}`);
      }
    } else if (challenge.type === 'coding') {
      hints.push("Check if your code matches the requirements.");
      if (challenge.requirements?.code?.tests) {
        challenge.requirements.code.tests.forEach(test => {
          hints.push(`- ${test.description}`);
        });
      }
    } else if (challenge.type === 'resource') {
      hints.push("You need to collect more resources to complete this challenge.");
      if (challenge.requirements?.resources) {
        Object.entries(challenge.requirements.resources).forEach(([resource, amount]) => {
          hints.push(`- Need ${amount} ${resource}`);
        });
      }
    }
    
    return hints;
  }
  
  /**
   * Get reward messages for a challenge
   */
  private getRewardMessages(challenge: Challenge): string[] {
    const rewards: string[] = [];
    
    // Resources
    if (challenge.rewards.resources) {
      Object.entries(challenge.rewards.resources).forEach(([resource, amount]) => {
        if (amount) {
          rewards.push(`Received ${amount} ${resource}`);
        }
      });
    }
    
    // Buildings
    if (challenge.rewards.unlocks?.buildings?.length) {
      rewards.push(`Unlocked ${challenge.rewards.unlocks.buildings.length} new building(s)`);
    }
    
    // Features
    if (challenge.rewards.unlocks?.features?.length) {
      rewards.push(`Unlocked ${challenge.rewards.unlocks.features.length} new feature(s)`);
    }
    
    // Villagers
    if (challenge.rewards.unlocks?.villagers?.length) {
      rewards.push(`Unlocked ${challenge.rewards.unlocks.villagers.length} new villager(s)`);
    }
    
    return rewards;
  }
}

// Export singleton instance
export const challengeSystem = new ChallengeSystem(); 