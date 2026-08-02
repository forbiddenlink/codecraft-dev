import type { Dispatch } from '@reduxjs/toolkit'
import { type TutorialStep, TutorialStepTypes } from '@/store/slices/tutorialSlice'

interface TutorialRewards {
  xp: number
  items: string[]
  unlocks: string[]
}

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  steps: TutorialStep[]
  rewards: TutorialRewards
}

/**
 * Welcome tutorial — challenge → unlock → place.
 * All steps use MANUAL completion so Continue always works.
 * Auto steps use a short timer handled by TutorialOverlay.
 */
export const WELCOME_TUTORIAL: Tutorial = {
  id: 'welcome-tutorial',
  title: 'Welcome to CodeCraft',
  description: 'Learn the core loop: code a challenge, unlock a structure, place it in the colony.',
  category: 'onboarding',
  difficulty: 'beginner',
  steps: [
    {
      id: 'welcome-step-1',
      title: 'Welcome, Commander',
      description:
        'CodeCraft teaches web development by building a space colony. You write real HTML, CSS, and JavaScript — then place structures that power your outpost.',
      pixelDialogue:
        "I'm Pixel, your AI companion. Clear challenges to unlock buildings, then place them on the ground.",
      focusArea: TutorialStepTypes.FOCUS_AREA.GAME,
      action: { type: TutorialStepTypes.ACTION.VIEW },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: 'welcome-step-2',
    },
    {
      id: 'welcome-step-2',
      title: 'Colony resources',
      description:
        'Energy, minerals, water, and food appear in the top-right HUD. Buildings cost resources — keep an eye on your stock before placing.',
      pixelDialogue:
        'Habitat Module needs 50 energy and 100 minerals. You start with enough for your first home.',
      focusArea: TutorialStepTypes.FOCUS_AREA.RESOURCE_HUD,
      action: { type: TutorialStepTypes.ACTION.VIEW },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: 'welcome-step-3',
    },
    {
      id: 'welcome-step-3',
      title: 'Your first challenge',
      description:
        'Open the challenge card on the left. Press Start Coding, write a <header> with an <h1> inside, then Check Solution.',
      pixelDialogue: 'Completing "Build a Header" unlocks the Habitat Module blueprint.',
      focusArea: TutorialStepTypes.FOCUS_AREA.GAME,
      action: { type: TutorialStepTypes.ACTION.VIEW },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: 'welcome-step-4',
    },
    {
      id: 'welcome-step-4',
      title: 'Place your habitat',
      description:
        'After the challenge succeeds, open Buildings (bottom-right), select Habitat Module, then click the ground to place it.',
      pixelDialogue:
        'Press R to rotate the preview, Esc to cancel. Your colony grows with every structure you place.',
      focusArea: TutorialStepTypes.FOCUS_AREA.BUILDING_MENU,
      action: { type: TutorialStepTypes.ACTION.VIEW },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: null,
    },
  ],
  rewards: {
    xp: 100,
    items: ['habitat-module'],
    unlocks: ['html-basics-tutorial'],
  },
}

export const HTML_BASICS_TUTORIAL: Tutorial = {
  id: 'html-basics-tutorial',
  title: 'HTML Basics',
  description: 'Learn the fundamentals of HTML to build your colony structures',
  category: 'html',
  difficulty: 'beginner',
  steps: [
    {
      id: 'html-basics-step-1',
      title: 'HTML Structure',
      description:
        'HTML uses elements with opening and closing tags to define structure. Create a simple colony layout in the editor.',
      pixelDialogue:
        'HTML is the foundation of your colony! Each element becomes a physical structure.',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value:
          '<section class="colony-wing">\n  <header>Colony Entrance</header>\n  <div class="main-area"></div>\n  <footer>Support Systems</footer>\n</section>',
      },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: 'html-basics-step-2',
    },
    {
      id: 'html-basics-step-2',
      title: 'Adding Content',
      description: 'Add habitats inside the main area to give colonists a place to live.',
      pixelDialogue: 'Great structure! Nesting elements adds detail to your colony.',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value:
          '<div class="main-area">\n  <habitat class="crew-quarters">Crew Quarters</habitat>\n  <habitat class="science-lab">Science Lab</habitat>\n</div>',
      },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: 'html-basics-step-3',
    },
    {
      id: 'html-basics-step-3',
      title: 'Nested Elements',
      description: 'Nest headings and rooms inside a habitat for richer structure.',
      pixelDialogue: 'The more detailed your HTML, the more detailed your colony becomes!',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value:
          '<habitat class="crew-quarters">\n  <h2>Crew Quarters</h2>\n  <div class="bedroom">Captain\'s Room</div>\n  <div class="bedroom">Engineer\'s Room</div>\n</habitat>',
      },
      completion: { type: TutorialStepTypes.COMPLETION.MANUAL },
      nextStepId: null,
    },
  ],
  rewards: {
    xp: 200,
    items: ['laboratory-module'],
    unlocks: ['css-basics-tutorial'],
  },
}

export const TUTORIALS: Record<string, Tutorial> = {
  'welcome-tutorial': WELCOME_TUTORIAL,
  'html-basics-tutorial': HTML_BASICS_TUTORIAL,
}

export const getTutorialById = (id: string): Tutorial | null => {
  return TUTORIALS[id] || null
}

export const startTutorial = (dispatch: Dispatch, tutorialId: string): void => {
  const tutorial = getTutorialById(tutorialId)
  if (!tutorial) {
    console.error(`Tutorial with ID ${tutorialId} not found`)
    return
  }

  void import('@/store/slices/tutorialSlice').then(({ startTutorial: startTutorialAction }) => {
    dispatch(
      startTutorialAction({
        tutorialId: tutorial.id,
        steps: tutorial.steps,
      })
    )
  })
}
