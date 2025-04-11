// File: /src/data/challenges.ts
import { Challenge } from '@/types/challenges';

export const challenges: Challenge[] = [
  // Structure Challenges
  {
    id: 'intro-1',
    title: 'Build a Header',
    description: 'Create your first colony structure by building a header with a title.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: [],
    htmlTemplate: '<!-- Start by adding a header element with an h1 inside -->',
    cssTemplate: '/* You can add styles to your header */',
    validate: (code: string) => /<header[\s\S]*<h1>[\s\S]*<\/h1>[\s\S]*<\/header>/i.test(code),
    rewards: [
      { type: 'building', id: 'basicHabitat' },
      { type: 'villager', id: 'astro' }
    ],
    objectives: [
      'Create a <header> element',
      'Add an <h1> element inside the header',
      'Add a title for your colony'
    ],
    hints: [
      'Start with <header>',
      'Don\'t forget to add an <h1> inside the header',
      'Make sure to close both tags properly'
    ]
  },
  {
    id: 'intro-2',
    title: 'Create a Section with Content',
    description: 'Expand your colony by adding a section for living quarters.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-1'],
    htmlTemplate: `<header>
  <h1>Colony Alpha</h1>
</header>
<!-- Add your section here -->`,
    cssTemplate: '/* Style your section */',
    validate: (code: string) => /<section[\s\S]*<p>[\s\S]*<\/p>[\s\S]*<\/section>/i.test(code),
    rewards: [
      { type: 'building', id: 'livingQuarters' },
      { type: 'resource', id: 'energy', amount: 50 }
    ],
    objectives: [
      'Create a <section> element',
      'Add a paragraph of content inside',
      'Describe the purpose of this section'
    ],
    hints: [
      'Use the <section> element to create a new area',
      'Add a <p> tag inside your section',
      'Write some content about your colony\'s living quarters'
    ]
  },
  {
    id: 'layout-1',
    title: 'Resource Center Layout',
    description: 'Design a resource management center using CSS Grid layout.',
    category: 'layout',
    difficulty: 1,
    requiredChallenges: ['intro-2'],
    htmlTemplate: `<section class="resource-center">
  <!-- Add your resource monitoring stations -->
</section>`,
    cssTemplate: `.resource-center {
  /* Add your grid layout styles */
}`,
    validate: (code: string) => {
      const hasGrid = /display:\s*grid/.test(code);
      const hasStations = /<div[^>]*class="station"/.test(code);
      const hasMultipleStations = (code.match(/<div[^>]*class="station"/g) || []).length >= 3;
      return hasGrid && hasStations && hasMultipleStations;
    },
    rewards: [
      { type: 'building', id: 'resourceCenter' },
      { type: 'ability', id: 'resourceTracking' }
    ],
    objectives: [
      'Create a grid layout with at least 3 stations',
      'Style each station with a unique appearance',
      'Add resource monitoring displays'
    ],
    hints: [
      'Use display: grid on your container',
      'Create station divs with class="station"',
      'Add different content for each station'
    ]
  }
];

// Helper function to get available challenges based on completed ones
export function getAvailableChallenges(completedChallenges: string[]): Challenge[] {
  return challenges.filter(challenge => 
    !completedChallenges.includes(challenge.id) && 
    challenge.requiredChallenges.every(req => completedChallenges.includes(req))
  );
}

// Helper function to get challenge by ID
export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find(challenge => challenge.id === id);
}
