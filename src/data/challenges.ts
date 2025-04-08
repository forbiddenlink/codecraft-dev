// File: /src/data/challenges.ts
export const challenges = [
  {
    id: 'intro-1',
    title: 'Build a Header',
    description: 'Use a <header> element containing an <h1>.',
    validate: (code: string) => /<header[\s\S]*<h1>[\s\S]*<\/h1>[\s\S]*<\/header>/i.test(code),
  },
];
