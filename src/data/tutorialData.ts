import { TutorialStepTypes, TutorialStep } from '@/store/slices/tutorialSlice';
import { Dispatch } from '@reduxjs/toolkit';

interface TutorialRewards {
  xp: number;
  items: string[];
  unlocks: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  steps: TutorialStep[];
  rewards: TutorialRewards;
}

export const WELCOME_TUTORIAL: Tutorial = {
  id: 'welcome-tutorial',
  title: 'Welcome to CodeCraft',
  description: 'Learn the basics of the CodeCraft game interface',
  category: 'onboarding',
  difficulty: 'beginner',
  steps: [
    {
      id: 'welcome-step-1',
      title: 'Welcome to CodeCraft',
      description: 'Welcome to CodeCraft: Galactic Developer! In this tutorial, you\'ll learn how to navigate the game and start building your first space colony.',
      pixelDialogue: 'Hi there! I\'m Pixel, your AI companion. I\'ll guide you through your journey as a galactic developer!',
      focusArea: TutorialStepTypes.FOCUS_AREA.GAME,
      action: {
        type: TutorialStepTypes.ACTION.VIEW,
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.MANUAL,
      },
      nextStepId: 'welcome-step-2'
    },
    {
      id: 'welcome-step-2',
      title: 'Game Controls',
      description: 'You can navigate the game world using your mouse. Drag to rotate the camera, scroll to zoom, and right-click to pan.',
      pixelDialogue: 'Take a moment to look around your colony site. This is where you\'ll build your amazing space colony!',
      focusArea: TutorialStepTypes.FOCUS_AREA.GAME,
      action: {
        type: TutorialStepTypes.ACTION.WAIT,
        duration: 5000,
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.AUTO,
      },
      nextStepId: 'welcome-step-3'
    },
    {
      id: 'welcome-step-3',
      title: 'Resource Management',
      description: 'Your colony needs resources to function. You can view your current resources in the Resource HUD in the top-right corner.',
      pixelDialogue: 'Keep an eye on your energy and minerals! You\'ll need them to build and maintain your colony structures.',
      focusArea: TutorialStepTypes.FOCUS_AREA.RESOURCE_HUD,
      action: {
        type: TutorialStepTypes.ACTION.VIEW,
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.MANUAL,
      },
      nextStepId: 'welcome-step-4'
    },
    {
      id: 'welcome-step-4',
      title: 'Building Structures',
      description: 'You can build various structures in your colony. Open the Building Menu to see what\'s available.',
      pixelDialogue: 'Let\'s check out what we can build! Each structure serves a different purpose in your colony.',
      focusArea: TutorialStepTypes.FOCUS_AREA.BUILDING_MENU,
      action: {
        type: TutorialStepTypes.ACTION.CLICK,
        target: 'building-menu-button',
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.MANUAL,
      },
      nextStepId: 'welcome-step-5'
    },
    {
      id: 'welcome-step-5',
      title: 'Your First Code',
      description: 'In CodeCraft, you build your colony using real code! Let\'s open the code editor to write your first HTML structure.',
      pixelDialogue: 'This is where the real magic happens! Your code directly shapes your colony. Let\'s start with a simple habitat module.',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value: '<habitat class="main-habitat">My First Habitat</habitat>',
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.VALIDATION,
        criteria: 'contains:<habitat',
      },
      nextStepId: null
    }
  ],
  rewards: {
    xp: 100,
    items: ['basic-habitat-blueprint'],
    unlocks: ['html-basics-tutorial']
  }
};

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
      description: 'HTML uses elements with opening and closing tags to define structure. Let\'s create a simple colony layout.',
      pixelDialogue: 'HTML is the foundation of your colony! Each element becomes a physical structure in your space colony.',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value: '<section class="colony-wing">\n  <header>Colony Entrance</header>\n  <div class="main-area"></div>\n  <footer>Support Systems</footer>\n</section>',
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.VALIDATION,
        criteria: 'structure:section>header+div+footer',
      },
      nextStepId: 'html-basics-step-2'
    },
    {
      id: 'html-basics-step-2',
      title: 'Adding Content',
      description: 'Let\'s add some content to our colony wing. We\'ll create habitats inside the main area.',
      pixelDialogue: 'Great structure! Now let\'s add some living quarters for your colonists.',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value: '<div class="main-area">\n  <habitat class="crew-quarters">Crew Quarters</habitat>\n  <habitat class="science-lab">Science Lab</habitat>\n</div>',
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.VALIDATION,
        criteria: 'contains:habitat',
      },
      nextStepId: 'html-basics-step-3'
    },
    {
      id: 'html-basics-step-3',
      title: 'Nested Elements',
      description: 'HTML elements can be nested inside each other. Let\'s add some details to our crew quarters.',
      pixelDialogue: 'The more detailed your HTML structure, the more detailed your colony becomes!',
      focusArea: TutorialStepTypes.FOCUS_AREA.EDITOR,
      action: {
        type: TutorialStepTypes.ACTION.CODE,
        value: '<habitat class="crew-quarters">\n  <h2>Crew Quarters</h2>\n  <div class="bedroom">Captain\'s Room</div>\n  <div class="bedroom">Engineer\'s Room</div>\n</habitat>',
      },
      completion: {
        type: TutorialStepTypes.COMPLETION.VALIDATION,
        criteria: 'structure:habitat>h2+div+div',
      },
      nextStepId: null
    }
  ],
  rewards: {
    xp: 200,
    items: ['advanced-habitat-blueprint', 'basic-lab-blueprint'],
    unlocks: ['css-basics-tutorial']
  }
};

export const TUTORIALS: Record<string, Tutorial> = {
  'welcome-tutorial': WELCOME_TUTORIAL,
  'html-basics-tutorial': HTML_BASICS_TUTORIAL
};

export const getTutorialById = (id: string): Tutorial | null => {
  return TUTORIALS[id] || null;
};

export const startTutorial = (dispatch: Dispatch, tutorialId: string): void => {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) {
    console.error(`Tutorial with ID ${tutorialId} not found`);
    return;
  }
  
  import('@/store/slices/tutorialSlice').then(({ startTutorial }) => {
    dispatch(startTutorial({
      tutorialId: tutorial.id,
      steps: tutorial.steps
    }));
  });
}; 