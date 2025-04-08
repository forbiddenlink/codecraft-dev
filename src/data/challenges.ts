// File: /src/data/challenges.ts
export const challenges = [
  {
    id: 'intro-1',
    title: 'Build a Header',
    description: 'Use a <header> element containing an <h1>.',
    validate: (code: string) => /<header[\s\S]*<h1>[\s\S]*<\/h1>[\s\S]*<\/header>/i.test(code),
  },
  {
    id: 'intro-2',
    title: 'Create a Section with Content',
    description: 'Use a <section> that includes a <p> paragraph.',
    validate: (code: string) => /<section[\s\S]*<p>[\s\S]*<\/p>[\s\S]*<\/section>/i.test(code),
  },
  {
    id: 'intro-3',
    title: 'Style a Div with a Class',
    description: 'Add a <div class="box"> with a style block that sets background-color.',
    validate: (code: string) => /<style>[\s\S]*\.box\s*\{[\s\S]*background-color[\s\S]*\}[\s\S]*<\/style>[\s\S]*<div[^>]*class=["']box["'][\s\S]*<\/div>/i.test(code),
  },
  {
    id: 'intro-4',
    title: 'Use a Footer with Contact Info',
    description: 'Create a <footer> that contains a <p> tag with contact details.',
    validate: (code: string) => /<footer[\s\S]*<p>[\s\S]+<\/p>[\s\S]*<\/footer>/i.test(code),
  },
  {
    id: 'intro-5',
    title: 'Apply Inline Style',
    description: 'Create a <div> with inline style for width and height.',
    validate: (code: string) => /<div[^>]*style=["'][^"']*width\s*:\s*\d+px[^"']*height\s*:\s*\d+px[^"']*["'][^>]*><\/div>/i.test(code),
  }
];
