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
    ],
    conceptsTaught: ['html-header', 'html-nesting'],
    estimatedMinutes: 5
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
    ],
    conceptsTaught: ['html-section', 'html-semantic'],
    conceptsReinforced: ['html-nesting'],
    estimatedMinutes: 5
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
    ],
    conceptsTaught: ['css-grid', 'css-classes'],
    conceptsReinforced: ['html-div', 'html-attributes'],
    estimatedMinutes: 10
  },

  // HTML Basics - More Structure Challenges
  {
    id: 'html-div-1',
    title: 'Container Basics',
    description: 'Learn to organize content with div containers.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-1'],
    htmlTemplate: '<!-- Create a container with multiple divs -->',
    cssTemplate: '/* Style your containers */',
    validate: (code: string) => {
      const hasDivs = (code.match(/<div/g) || []).length >= 3;
      const hasClosingDivs = (code.match(/<\/div>/g) || []).length >= 3;
      return hasDivs && hasClosingDivs;
    },
    rewards: [
      { type: 'resource', id: 'energy', amount: 25 }
    ],
    objectives: [
      'Create at least 3 div elements',
      'Add content inside each div',
      'Properly close all div tags'
    ],
    hints: [
      'A div is created with <div>content</div>',
      'You can nest divs inside other divs',
      'Each opening <div> needs a closing </div>'
    ],
    conceptsTaught: ['html-div'],
    conceptsReinforced: ['html-nesting'],
    estimatedMinutes: 5
  },
  {
    id: 'html-list-1',
    title: 'Resource Inventory',
    description: 'Create a list of colony resources using HTML lists.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-1'],
    htmlTemplate: '<!-- Create an unordered list of resources -->',
    cssTemplate: '/* Style your list */',
    validate: (code: string) => {
      const hasUL = /<ul[\s\S]*<\/ul>/i.test(code);
      const hasLI = (code.match(/<li/g) || []).length >= 3;
      return hasUL && hasLI;
    },
    rewards: [
      { type: 'resource', id: 'minerals', amount: 30 }
    ],
    objectives: [
      'Create an unordered list with <ul>',
      'Add at least 3 list items with <li>',
      'List different colony resources'
    ],
    hints: [
      'Start with <ul> to create an unordered list',
      'Each item goes in <li> tags',
      'Don\'t forget to close the </ul> tag'
    ],
    conceptsTaught: ['html-lists'],
    conceptsReinforced: ['html-nesting'],
    estimatedMinutes: 5
  },
  {
    id: 'html-link-1',
    title: 'Navigation Links',
    description: 'Connect different areas of your colony with navigation links.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-2'],
    htmlTemplate: '<nav>\n  <!-- Add navigation links here -->\n</nav>',
    cssTemplate: '/* Style your navigation */',
    validate: (code: string) => {
      const hasNav = /<nav[\s\S]*<\/nav>/i.test(code);
      const hasLinks = (code.match(/<a\s+href/gi) || []).length >= 3;
      return hasNav && hasLinks;
    },
    rewards: [
      { type: 'building', id: 'communicationHub' },
      { type: 'resource', id: 'energy', amount: 35 }
    ],
    objectives: [
      'Create a <nav> element',
      'Add at least 3 anchor links with href attributes',
      'Give each link descriptive text'
    ],
    hints: [
      'Links are created with <a href="url">text</a>',
      'You can use # for placeholder links',
      'Put all links inside the <nav> element'
    ],
    conceptsTaught: ['html-links', 'html-nav'],
    conceptsReinforced: ['html-attributes', 'html-nesting'],
    estimatedMinutes: 8
  },
  {
    id: 'html-image-1',
    title: 'Colony Visuals',
    description: 'Add images to showcase your colony using the img tag.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-1'],
    htmlTemplate: '<!-- Add images to your colony -->',
    cssTemplate: '/* Style your images */',
    validate: (code: string) => {
      const hasImg = /<img\s+[^>]*src=/i.test(code);
      const hasAlt = /<img\s+[^>]*alt=/i.test(code);
      return hasImg && hasAlt;
    },
    rewards: [
      { type: 'resource', id: 'research', amount: 40 }
    ],
    objectives: [
      'Add an <img> element',
      'Include a src attribute',
      'Include an alt attribute for accessibility'
    ],
    hints: [
      'Images use the <img> tag (self-closing)',
      'Add src="image-url" for the image source',
      'Add alt="description" for accessibility'
    ],
    conceptsTaught: ['html-images'],
    conceptsReinforced: ['html-attributes'],
    estimatedMinutes: 5
  },
  {
    id: 'html-span-1',
    title: 'Inline Styling',
    description: 'Use span elements to highlight important inline text.',
    category: 'structure',
    difficulty: 1,
    requiredChallenges: ['intro-2'],
    htmlTemplate: '<p>Your colony has <!-- use span for emphasis -->important resources<!-- -->.</p>',
    cssTemplate: '.highlight { /* style your highlighted text */ }',
    validate: (code: string) => {
      const hasSpan = /<span[\s\S]*<\/span>/i.test(code);
      const hasParagraph = /<p[\s\S]*<\/p>/i.test(code);
      return hasSpan && hasParagraph;
    },
    rewards: [
      { type: 'resource', id: 'energy', amount: 20 }
    ],
    objectives: [
      'Create a paragraph with text',
      'Use <span> to wrap important words',
      'Add a class to the span for styling'
    ],
    hints: [
      'Span is an inline element: <span>text</span>',
      'You can add class="highlight" to style it',
      'Span is used for styling small portions of text'
    ],
    conceptsTaught: ['html-span'],
    conceptsReinforced: ['css-classes', 'html-nesting'],
    estimatedMinutes: 5
  },

  // CSS Basics - Color and Typography
  {
    id: 'css-color-1',
    title: 'Colony Colors',
    description: 'Apply colors to make your colony visually appealing.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['intro-2'],
    htmlTemplate: '<div class="command-center">\n  <h2>Command Center</h2>\n  <p>Mission Control</p>\n</div>',
    cssTemplate: '.command-center {\n  /* Add background and text colors */\n}',
    validate: (code: string) => {
      const hasBackgroundColor = /background(-color)?:\s*[^;]+/i.test(code);
      const hasTextColor = /color:\s*[^;]+/i.test(code);
      return hasBackgroundColor && hasTextColor;
    },
    rewards: [
      { type: 'resource', id: 'minerals', amount: 30 }
    ],
    objectives: [
      'Set a background-color for the container',
      'Set a text color for the text',
      'Use any valid CSS color (name, hex, rgb)'
    ],
    hints: [
      'background-color: blue; sets background',
      'color: white; sets text color',
      'You can use color names or hex codes like #FF5733'
    ],
    conceptsTaught: ['css-colors'],
    conceptsReinforced: ['css-classes'],
    estimatedMinutes: 5
  },
  {
    id: 'css-font-1',
    title: 'Typography System',
    description: 'Set up professional typography for your colony interface.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-color-1'],
    htmlTemplate: '<h1>Colony Alpha</h1>\n<p>Welcome to your new home among the stars.</p>',
    cssTemplate: '/* Style the typography */',
    validate: (code: string) => {
      const hasFontFamily = /font-family:\s*[^;]+/i.test(code);
      const hasFontSize = /font-size:\s*[^;]+/i.test(code);
      return hasFontFamily && hasFontSize;
    },
    rewards: [
      { type: 'resource', id: 'research', amount: 35 }
    ],
    objectives: [
      'Set a font-family for your text',
      'Set a font-size for at least one element',
      'Create readable, professional typography'
    ],
    hints: [
      'font-family: Arial, sans-serif; sets the font',
      'font-size: 16px; or font-size: 1.5em; sets size',
      'You can target h1 and p separately'
    ],
    conceptsTaught: ['css-fonts'],
    conceptsReinforced: ['css-selectors'],
    estimatedMinutes: 5
  },
  {
    id: 'css-spacing-1',
    title: 'Space Management',
    description: 'Control spacing with margin and padding.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-color-1'],
    htmlTemplate: '<div class="habitat">\n  <h3>Living Quarters</h3>\n  <p>Comfortable spaces for colonists</p>\n</div>',
    cssTemplate: '.habitat {\n  /* Add margin and padding */\n}',
    validate: (code: string) => {
      const hasMargin = /margin(-top|-bottom|-left|-right)?:\s*[^;]+/i.test(code);
      const hasPadding = /padding(-top|-bottom|-left|-right)?:\s*[^;]+/i.test(code);
      return hasMargin && hasPadding;
    },
    rewards: [
      { type: 'resource', id: 'oxygen', amount: 40 }
    ],
    objectives: [
      'Add padding inside the habitat container',
      'Add margin around the habitat',
      'Understand the difference between margin and padding'
    ],
    hints: [
      'padding: 20px; adds space inside the element',
      'margin: 10px; adds space outside the element',
      'You can use different values for each side'
    ],
    conceptsTaught: ['css-spacing'],
    conceptsReinforced: ['css-classes'],
    estimatedMinutes: 8
  },
  {
    id: 'css-border-1',
    title: 'Border Control',
    description: 'Define boundaries with borders.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-spacing-1'],
    htmlTemplate: '<div class="security-zone">\n  <p>Restricted Area</p>\n</div>',
    cssTemplate: '.security-zone {\n  /* Add a border */\n}',
    validate: (code: string) => {
      const hasBorder = /border(-width|-style|-color)?:\s*[^;]+/i.test(code);
      return hasBorder;
    },
    rewards: [
      { type: 'building', id: 'securityStation' },
      { type: 'resource', id: 'energy', amount: 25 }
    ],
    objectives: [
      'Add a border to the security zone',
      'Specify border width, style, and color',
      'Try different border styles (solid, dashed, dotted)'
    ],
    hints: [
      'border: 2px solid red; is a shorthand',
      'Or use border-width, border-style, border-color separately',
      'Common styles: solid, dashed, dotted, double'
    ],
    conceptsTaught: ['css-borders'],
    conceptsReinforced: ['css-colors', 'css-classes'],
    estimatedMinutes: 5
  },
  {
    id: 'css-width-height-1',
    title: 'Size Specifications',
    description: 'Control element dimensions with width and height.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-spacing-1'],
    htmlTemplate: '<div class="storage-unit">\n  Storage Compartment\n</div>',
    cssTemplate: '.storage-unit {\n  /* Set width and height */\n}',
    validate: (code: string) => {
      const hasWidth = /width:\s*[^;]+/i.test(code);
      const hasHeight = /height:\s*[^;]+/i.test(code);
      return hasWidth && hasHeight;
    },
    rewards: [
      { type: 'resource', id: 'minerals', amount: 30 }
    ],
    objectives: [
      'Set a width for the storage unit',
      'Set a height for the storage unit',
      'Use pixel (px) or percentage (%) values'
    ],
    hints: [
      'width: 200px; sets the width',
      'height: 100px; sets the height',
      'You can also use percentages like width: 50%;'
    ],
    conceptsTaught: ['css-sizing'],
    conceptsReinforced: ['css-classes'],
    estimatedMinutes: 5
  },

  // CSS Layout - Flexbox Basics
  {
    id: 'css-flexbox-1',
    title: 'Flexible Layouts',
    description: 'Use Flexbox to create flexible layouts.',
    category: 'layout',
    difficulty: 1,
    requiredChallenges: ['layout-1'],
    htmlTemplate: '<div class="crew-quarters">\n  <div class="crew-member">Pilot</div>\n  <div class="crew-member">Engineer</div>\n  <div class="crew-member">Scientist</div>\n</div>',
    cssTemplate: '.crew-quarters {\n  /* Use flexbox layout */\n}',
    validate: (code: string) => {
      const hasDisplayFlex = /display:\s*flex/i.test(code);
      return hasDisplayFlex;
    },
    rewards: [
      { type: 'building', id: 'crewQuarters' },
      { type: 'resource', id: 'colonists', amount: 3 }
    ],
    objectives: [
      'Set display: flex on the container',
      'Arrange crew members in a row',
      'See how flexbox arranges items automatically'
    ],
    hints: [
      'display: flex; makes the container a flexbox',
      'Items will line up in a row by default',
      'This is the foundation of modern layouts'
    ],
    conceptsTaught: ['css-flexbox'],
    conceptsReinforced: ['css-classes', 'html-div'],
    estimatedMinutes: 8
  },
  {
    id: 'css-flexbox-2',
    title: 'Flexbox Direction',
    description: 'Control the direction of flex items.',
    category: 'layout',
    difficulty: 1,
    requiredChallenges: ['css-flexbox-1'],
    htmlTemplate: '<div class="vertical-stack">\n  <div>Level 1</div>\n  <div>Level 2</div>\n  <div>Level 3</div>\n</div>',
    cssTemplate: '.vertical-stack {\n  display: flex;\n  /* Change flex direction */\n}',
    validate: (code: string) => {
      const hasFlexDirection = /flex-direction:\s*column/i.test(code);
      return hasFlexDirection;
    },
    rewards: [
      { type: 'resource', id: 'energy', amount: 35 }
    ],
    objectives: [
      'Use flex-direction to stack items vertically',
      'Set flex-direction: column',
      'Understand row vs column layouts'
    ],
    hints: [
      'flex-direction: column; stacks items vertically',
      'flex-direction: row; is the default (horizontal)',
      'Try both to see the difference'
    ],
    conceptsTaught: ['css-flex-direction'],
    conceptsReinforced: ['css-flexbox'],
    estimatedMinutes: 5
  },
  {
    id: 'css-flexbox-3',
    title: 'Space Distribution',
    description: 'Distribute space between flex items using justify-content.',
    category: 'layout',
    difficulty: 1,
    requiredChallenges: ['css-flexbox-1'],
    htmlTemplate: '<div class="docking-bay">\n  <div class="ship">Ship A</div>\n  <div class="ship">Ship B</div>\n  <div class="ship">Ship C</div>\n</div>',
    cssTemplate: '.docking-bay {\n  display: flex;\n  /* Distribute space evenly */\n}',
    validate: (code: string) => {
      const hasJustifyContent = /justify-content:\s*(space-between|space-around|space-evenly)/i.test(code);
      return hasJustifyContent;
    },
    rewards: [
      { type: 'building', id: 'dockingBay' },
      { type: 'resource', id: 'energy', amount: 40 }
    ],
    objectives: [
      'Use justify-content to space items',
      'Try space-between, space-around, or space-evenly',
      'See how spacing changes with different values'
    ],
    hints: [
      'justify-content: space-between; pushes items to edges',
      'space-around gives equal space around each item',
      'space-evenly gives perfectly equal spacing'
    ],
    conceptsTaught: ['css-justify-content'],
    conceptsReinforced: ['css-flexbox'],
    estimatedMinutes: 8
  },
  {
    id: 'css-flexbox-4',
    title: 'Vertical Alignment',
    description: 'Align flex items vertically with align-items.',
    category: 'layout',
    difficulty: 1,
    requiredChallenges: ['css-flexbox-1'],
    htmlTemplate: '<div class="control-panel">\n  <button>Start</button>\n  <button>Stop</button>\n  <button>Reset</button>\n</div>',
    cssTemplate: '.control-panel {\n  display: flex;\n  height: 100px;\n  /* Align items vertically */\n}',
    validate: (code: string) => {
      const hasAlignItems = /align-items:\s*(center|flex-start|flex-end|stretch)/i.test(code);
      return hasAlignItems;
    },
    rewards: [
      { type: 'resource', id: 'research', amount: 45 }
    ],
    objectives: [
      'Set align-items to center the buttons',
      'Understand vertical alignment in flexbox',
      'Try different values to see the effect'
    ],
    hints: [
      'align-items: center; centers items vertically',
      'flex-start aligns to top, flex-end to bottom',
      'stretch makes items fill the container height'
    ],
    conceptsTaught: ['css-align-items'],
    conceptsReinforced: ['css-flexbox'],
    estimatedMinutes: 5
  },
  {
    id: 'css-class-1',
    title: 'Class Organization',
    description: 'Use CSS classes to organize and style multiple elements.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-color-1'],
    htmlTemplate: '<div class="module energy-module">Energy</div>\n<div class="module water-module">Water</div>\n<div class="module oxygen-module">Oxygen</div>',
    cssTemplate: '/* Style the shared "module" class and specific classes */',
    validate: (code: string) => {
      const hasModuleClass = /\.module\s*{[^}]*}/i.test(code);
      const hasSpecificClass = /\.(energy-module|water-module|oxygen-module)\s*{[^}]*}/i.test(code);
      return hasModuleClass && hasSpecificClass;
    },
    rewards: [
      { type: 'resource', id: 'energy', amount: 30 },
      { type: 'resource', id: 'water', amount: 30 }
    ],
    objectives: [
      'Create a .module class for shared styles',
      'Create specific classes for each module type',
      'Understand how multiple classes work together'
    ],
    hints: [
      'Elements can have multiple classes: class="module energy-module"',
      '.module { } styles all modules',
      '.energy-module { } styles only energy modules'
    ],
    conceptsTaught: ['css-selectors'],
    conceptsReinforced: ['css-classes', 'css-colors'],
    estimatedMinutes: 8
  },
  {
    id: 'css-hover-1',
    title: 'Interactive Elements',
    description: 'Add hover effects to make your interface interactive.',
    category: 'resources',
    difficulty: 1,
    requiredChallenges: ['css-color-1'],
    htmlTemplate: '<button class="action-button">Activate</button>',
    cssTemplate: '.action-button {\n  /* Base styles */\n}\n\n.action-button:hover {\n  /* Hover styles */\n}',
    validate: (code: string) => {
      const hasHover = /:hover\s*{[^}]*}/i.test(code);
      const hasColorChange = /:hover\s*{[^}]*(background|color)[^}]*}/i.test(code);
      return hasHover && hasColorChange;
    },
    rewards: [
      { type: 'resource', id: 'research', amount: 40 }
    ],
    objectives: [
      'Add a :hover pseudo-class to the button',
      'Change the color or background on hover',
      'Make the interface feel more interactive'
    ],
    hints: [
      'Use :hover after the selector: .button:hover { }',
      'Change background-color or color on hover',
      'This creates visual feedback for users'
    ],
    conceptsTaught: ['css-hover'],
    conceptsReinforced: ['css-selectors', 'css-colors'],
    estimatedMinutes: 5
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
