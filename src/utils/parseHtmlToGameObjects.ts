// File: /src/utils/parseHtmlToGameObjects.ts
export function parseHtmlToGameObjects(code: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, 'text/html');
  const body = doc.body;

  const elements: { tag: string; color: string }[] = [];

  function walk(node: HTMLElement) {
    const tag = node.tagName.toLowerCase();
    const colorMap: Record<string, string> = {
      div: 'royalblue',
      section: 'purple',
      header: 'gold',
      footer: 'gray',
      article: 'orange',
    };

    elements.push({ tag, color: colorMap[tag] || 'white' });

    Array.from(node.children).forEach((child) => walk(child as HTMLElement));
  }

  Array.from(body.children).forEach((child) => walk(child as HTMLElement));

  return elements;
}
