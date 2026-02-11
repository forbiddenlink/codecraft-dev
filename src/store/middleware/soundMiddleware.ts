import { Middleware } from '@reduxjs/toolkit';
import { soundSystem } from '@/utils/soundSystem';

/**
 * Sound Middleware
 * Plays appropriate sound effects in response to Redux actions
 */
export const soundMiddleware: Middleware = (store) => (next) => (action: any) => {
  // Let the action pass through first
  const result = next(action);

  // Play sounds based on action type
  switch (action.type) {
    // Challenge events
    case 'challenges/completeChallenge':
      soundSystem.playSFX('challenge_complete');
      break;

    case 'challenges/startChallenge':
      soundSystem.playSFX('ui_click');
      break;

    // Building events
    case 'building/placeBuilding':
      soundSystem.playSFX('building_place');
      break;

    case 'building/upgradeBuilding':
      soundSystem.playSFX('building_upgrade');
      break;

    // Resource events
    case 'resource/addResources':
      soundSystem.playSFX('resource_collect');
      break;

    // User progression events
    case 'user/addXP':
      soundSystem.playSFX('code_success');
      break;

    case 'user/levelUp':
      soundSystem.playSFX('level_up');
      break;

    // Achievement events
    case 'achievements/unlockAchievement':
      soundSystem.playSFX('achievement_unlock');
      break;

    // Editor events
    case 'editor/setErrors':
      if (action.payload && action.payload.length > 0) {
        soundSystem.playSFX('code_error');
      }
      break;

    // UI events
    case 'editor/setEditorVisible':
      soundSystem.playSFX('ui_click');
      break;

    // Feature unlocks
    case 'user/unlockFeature':
    case 'building/unlockBuilding':
    case 'villagers/unlockVillager':
      soundSystem.playSFX('unlock');
      break;
  }

  return result;
};
