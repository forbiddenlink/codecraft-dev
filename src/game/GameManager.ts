/**
 * Master Game Manager
 * Orchestrates all game systems and maintains overall game state
 */

import { STORY_MISSIONS } from '@/data/storyMissions';
import { SIDE_QUESTS } from '@/data/sideQuests';
import { ADVANCED_CHALLENGES } from '@/data/advancedChallenges';
import { COLONY_EVENTS, getRandomEvent, shouldTriggerEvent } from '@/data/colonyEvents';
import { NPCS, getNPCDialogue, getAvailableNPCs } from '@/data/npcs';
import { BUILDING_UPGRADES, getNextUpgrade, canAffordUpgrade } from '@/data/buildingUpgrades';
import { SKILL_TREE, canUnlockSkill, calculateSkillPoints, getTotalXPBonus } from '@/data/skillTree';
import { CUTSCENES, getCutsceneById } from '@/components/game/cutscenes/CutscenePlayer';
import { ENVIRONMENTAL_STORIES, getStoriesNearPosition, canDiscoverStory } from '@/data/environmentalStories';
import { pixelAI, PixelMood } from '@/utils/pixelAI';
import { soundSystem } from '@/utils/soundSystem';

export interface GameState {
  // Player Info
  player: {
    id: string;
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    skillPoints: number;
    position: [number, number, number];
  };

  // Progress
  progress: {
    completedChallenges: string[];
    completedMissions: string[];
    completedQuests: string[];
    unlockedSkills: string[];
    completedUpgrades: string[];
    discoveredStories: string[];
    viewedCutscenes: string[];
    earnedAchievements: string[];
  };

  // Resources
  resources: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };

  // Colony State
  colony: {
    buildings: Array<{
      id: string;
      type: string;
      position: [number, number, number];
      level: number;
    }>;
    population: number;
    morale: number;
  };

  // Active Game Elements
  active: {
    currentChallenge?: string;
    currentMission?: string;
    activeEvent?: string;
    activeNPCs: string[];
    pixelMood: PixelMood;
  };

  // Settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    showHints: boolean;
  };

  // Session Info
  session: {
    startTime: number;
    playTime: number; // in seconds
    lastSave: number;
    eventCheckTimer: number;
  };
}

export class GameManager {
  private state: GameState;
  private eventCheckInterval: number = 60000; // Check for events every minute
  private autoSaveInterval: number = 60000; // Auto-save every minute

  constructor(initialState?: Partial<GameState>) {
    this.state = this.getDefaultState();
    if (initialState) {
      this.state = { ...this.state, ...initialState };
    }
    this.startGameLoop();
  }

  private getDefaultState(): GameState {
    return {
      player: {
        id: 'player-1',
        name: 'Commander',
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        skillPoints: 1,
        position: [0, 0, 0]
      },
      progress: {
        completedChallenges: [],
        completedMissions: [],
        completedQuests: [],
        unlockedSkills: [],
        completedUpgrades: [],
        discoveredStories: [],
        viewedCutscenes: [],
        earnedAchievements: []
      },
      resources: {
        energy: 100,
        minerals: 100,
        water: 100,
        food: 100
      },
      colony: {
        buildings: [],
        population: 10,
        morale: 50
      },
      active: {
        activeNPCs: ['pixel', 'captain-rivera'],
        pixelMood: 'happy'
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'normal',
        showHints: true
      },
      session: {
        startTime: Date.now(),
        playTime: 0,
        lastSave: Date.now(),
        eventCheckTimer: Date.now()
      }
    };
  }

  // ===== GAME LOOP =====
  private startGameLoop() {
    // Event checking
    setInterval(() => {
      this.checkForRandomEvents();
    }, this.eventCheckInterval);

    // Auto-save
    setInterval(() => {
      this.autoSave();
    }, this.autoSaveInterval);

    // Play time tracking
    setInterval(() => {
      this.state.session.playTime += 1;
    }, 1000);

    // Resource generation
    setInterval(() => {
      this.generateResources();
    }, 10000); // Every 10 seconds
  }

  // ===== PLAYER ACTIONS =====
  public completeChallenge(challengeId: string) {
    if (this.state.progress.completedChallenges.includes(challengeId)) {
      return { success: false, message: 'Challenge already completed' };
    }

    // Find challenge
    const challenge = ADVANCED_CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    // Award XP
    this.addXP(100); // Default XP for challenge completion

    // Award rewards
    if (challenge.rewards) {
      challenge.rewards.forEach(reward => {
        if (reward.type === 'resource') {
          this.addResource(reward.id, reward.amount || 0);
        } else if (reward.type === 'building') {
          // Unlock building
        }
      });
    }

    // Mark as completed
    this.state.progress.completedChallenges.push(challengeId);

    // Play sound
    soundSystem.playSFX('challenge_complete');

    // Update Pixel mood
    this.updatePixelMood();

    // Check for achievements
    this.checkAchievements();

    return { success: true, message: 'Challenge completed!' };
  }

  public addXP(amount: number) {
    // Apply XP bonuses
    const bonusMultiplier = 1 + (getTotalXPBonus(this.state.progress.unlockedSkills) / 100);
    const finalXP = Math.floor(amount * bonusMultiplier);

    this.state.player.xp += finalXP;

    // Level up check
    while (this.state.player.xp >= this.state.player.xpToNextLevel) {
      this.levelUp();
    }

    return finalXP;
  }

  private levelUp() {
    this.state.player.level += 1;
    this.state.player.xp -= this.state.player.xpToNextLevel;
    this.state.player.xpToNextLevel = Math.floor(this.state.player.xpToNextLevel * 1.5);
    this.state.player.skillPoints += 1;

    // Play sound
    soundSystem.playSFX('level_up');

    // Show cutscene
    this.triggerCutscene('level-up');

    // Update available NPCs
    this.updateAvailableNPCs();

    console.log(`🎉 Level Up! Now level ${this.state.player.level}`);
  }

  public unlockSkill(skillId: string) {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) {
      return { success: false, message: 'Skill not found' };
    }

    const canUnlock = canUnlockSkill(
      skill,
      this.state.player.level,
      this.state.player.xp,
      this.state.progress.unlockedSkills,
      this.state.progress.completedChallenges,
      this.state.player.skillPoints,
      this.state.resources
    );

    if (!canUnlock.canUnlock) {
      return { success: false, message: canUnlock.reason };
    }

    // Deduct resources and skill points
    this.state.player.skillPoints -= skill.cost.skillPoints;
    if (skill.cost.resources) {
      Object.entries(skill.cost.resources).forEach(([resource, amount]) => {
        this.addResource(resource, -amount);
      });
    }

    // Unlock skill
    this.state.progress.unlockedSkills.push(skillId);

    soundSystem.playSFX('unlock');

    return { success: true, message: `Unlocked: ${skill.name}!` };
  }

  // ===== RESOURCE MANAGEMENT =====
  public addResource(type: string, amount: number) {
    if (type in this.state.resources) {
      this.state.resources[type as keyof typeof this.state.resources] += amount;
      
      if (amount > 0) {
        soundSystem.playSFX('resource_collect');
      }
    }
  }

  private generateResources() {
    // Base generation from buildings
    this.state.colony.buildings.forEach(building => {
      // Simple resource generation based on building type
      if (building.type === 'energyGenerator') {
        this.addResource('energy', 5 * building.level);
      } else if (building.type === 'resourceCollector') {
        this.addResource('minerals', 3 * building.level);
      }
    });
  }

  // ===== EVENT SYSTEM =====
  private checkForRandomEvents() {
    if (this.state.active.activeEvent) {
      return; // Already have an active event
    }

    if (shouldTriggerEvent(0.1)) {
      const event = getRandomEvent(
        this.state.player.level,
        this.state.colony.buildings.map(b => b.type),
        this.getTimeOfDay()
      );

      if (event) {
        this.triggerEvent(event.id);
      }
    }
  }

  private triggerEvent(eventId: string) {
    this.state.active.activeEvent = eventId;
    soundSystem.playSFX('notification');
    console.log(`📅 Event triggered: ${eventId}`);
  }

  public resolveEvent(eventId: string, choiceId?: string) {
    const event = COLONY_EVENTS.find(e => e.id === eventId);
    if (!event) return;

    // Apply effects
    if (event.effects) {
      if (event.effects.resources) {
        Object.entries(event.effects.resources).forEach(([resource, amount]) => {
          this.addResource(resource, amount);
        });
      }
      if (event.effects.xp) {
        this.addXP(event.effects.xp);
      }
      if (event.effects.morale) {
        this.state.colony.morale += event.effects.morale;
      }
    }

    // Clear active event
    this.state.active.activeEvent = undefined;
  }

  // ===== NPC SYSTEM =====
  private updateAvailableNPCs() {
    const available = getAvailableNPCs(
      this.state.player.level,
      this.state.progress.completedQuests
    );
    this.state.active.activeNPCs = available.map(npc => npc.id);
  }

  public getPixelDialogue(): string {
    // TODO: Implement generateDialogue method on PixelAI
    return "Hi! I'm Pixel, your coding companion!";
  }

  private updatePixelMood() {
    // TODO: Implement determineMood method on PixelAI
    this.state.active.pixelMood = 'happy';
    /*
    this.state.active.pixelMood = pixelAI.determineMood({
      currentChallenge: undefined,
      isEditorVisible: false,
      errors: null,
      colonyResources: this.state.resources,
      playerXP: this.state.player.xp,
      unlockedBuildings: this.state.colony.buildings.map(b => b.type),
      unlockedFeatures: []
    });
    */
  }

  // ===== CUTSCENE SYSTEM =====
  private triggerCutscene(cutsceneId: string) {
    if (!this.state.progress.viewedCutscenes.includes(cutsceneId)) {
      this.state.progress.viewedCutscenes.push(cutsceneId);
      console.log(`🎬 Triggering cutscene: ${cutsceneId}`);
      // The actual cutscene player component will handle display
    }
  }

  // ===== ENVIRONMENTAL STORIES =====
  public discoverStory(storyId: string) {
    if (this.state.progress.discoveredStories.includes(storyId)) {
      return { success: false, message: 'Already discovered' };
    }

    const story = ENVIRONMENTAL_STORIES.find(s => s.id === storyId);
    if (!story) {
      return { success: false, message: 'Story not found' };
    }

    const canDiscover = canDiscoverStory(
      story,
      this.state.player.level,
      this.state.progress.completedMissions,
      this.state.progress.unlockedSkills
    );

    if (!canDiscover) {
      return { success: false, message: 'Requirements not met' };
    }

    this.state.progress.discoveredStories.push(storyId);

    if (story.rewards) {
      if (story.rewards.xp) {
        this.addXP(story.rewards.xp);
      }
    }

    soundSystem.playSFX('unlock');

    return { success: true, message: `Discovered: ${story.name}` };
  }

  // ===== ACHIEVEMENT SYSTEM =====
  private checkAchievements() {
    // Example achievement checks
    const challengeCount = this.state.progress.completedChallenges.length;
    
    if (challengeCount >= 1 && !this.state.progress.earnedAchievements.includes('first-challenge')) {
      this.earnAchievement('first-challenge');
    }
    
    if (challengeCount >= 10 && !this.state.progress.earnedAchievements.includes('challenge-veteran')) {
      this.earnAchievement('challenge-veteran');
    }
  }

  private earnAchievement(achievementId: string) {
    this.state.progress.earnedAchievements.push(achievementId);
    soundSystem.playSFX('achievement_unlock');
    console.log(`🏆 Achievement earned: ${achievementId}`);
  }

  // ===== SAVE/LOAD SYSTEM =====
  public saveGame() {
    try {
      const saveData = JSON.stringify(this.state);
      localStorage.setItem('codecraft-save', saveData);
      this.state.session.lastSave = Date.now();
      return { success: true, message: 'Game saved!' };
    } catch (error) {
      console.error('Save failed:', error);
      return { success: false, message: 'Save failed' };
    }
  }

  private autoSave() {
    this.saveGame();
    console.log('💾 Auto-saved at', new Date().toLocaleTimeString());
  }

  public loadGame(): boolean {
    try {
      const saveData = localStorage.getItem('codecraft-save');
      if (saveData) {
        this.state = JSON.parse(saveData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load failed:', error);
      return false;
    }
  }

  // ===== UTILITY =====
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setState(newState: Partial<GameState>) {
    this.state = { ...this.state, ...newState };
  }

  // ===== STATISTICS =====
  public getStatistics() {
    return {
      totalPlayTime: this.state.session.playTime,
      challengesCompleted: this.state.progress.completedChallenges.length,
      missionsCompleted: this.state.progress.completedMissions.length,
      questsCompleted: this.state.progress.completedQuests.length,
      skillsUnlocked: this.state.progress.unlockedSkills.length,
      storiesDiscovered: this.state.progress.discoveredStories.length,
      achievementsEarned: this.state.progress.earnedAchievements.length,
      totalXPEarned: this.state.player.xp + (this.state.player.level - 1) * 100,
      colonyPopulation: this.state.colony.population,
      colonyMorale: this.state.colony.morale,
      buildingsBuilt: this.state.colony.buildings.length
    };
  }
}

// Singleton instance
let gameManagerInstance: GameManager | null = null;

export function getGameManager(): GameManager {
  if (!gameManagerInstance) {
    gameManagerInstance = new GameManager();
    // Try to load saved game
    gameManagerInstance.loadGame();
  }
  return gameManagerInstance;
}

export function resetGame() {
  gameManagerInstance = new GameManager();
  gameManagerInstance.saveGame();
}

