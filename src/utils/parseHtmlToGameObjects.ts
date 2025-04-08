// File: /src/utils/parseHtmlToGameObjects.ts
export function parseHtmlToGameObjects(code: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, 'text/html');
  const body = doc.body;

  const elements: { tag: string; color: string; width?: number; height?: number }[] = [];

  function parseInlineStyle(styleString: string) {
    const style: Record<string, string> = {};
    styleString.split(';').forEach((rule) => {
      const [key, value] = rule.split(':').map((s) => s.trim());
      if (key && value) style[key] = value;
    });
    return style;
  }

  function walk(node: HTMLElement) {
    const tag = node.tagName.toLowerCase();
    const style = parseInlineStyle(node.getAttribute('style') || '');

    const colorMap: Record<string, string> = {
      div: 'royalblue',
      section: 'purple',
      header: 'gold',
      footer: 'gray',
      article: 'orange',
    };

    const element = {
      tag,
      color: style['background-color'] || colorMap[tag] || 'white',
      width: style['width'] ? parseInt(style['width']) : undefined,
      height: style['height'] ? parseInt(style['height']) : undefined,
    };

    elements.push(element);

    Array.from(node.children).forEach((child) => walk(child as HTMLElement));
  }

  Array.from(body.children).forEach((child) => walk(child as HTMLElement));

  return elements;
}