'use client';

// File: /src/utils/parseHtmlToGameObjects.ts
interface StyleObject {
  'background-color'?: string;
  width?: string;
  height?: string;
  'border-radius'?: string;
  transform?: string;
  opacity?: string;
  scale?: string;
  'translate-x'?: string;
  'translate-y'?: string;
  'translate-z'?: string;
}

export function parseHtmlToGameObjects(code: string) {
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = code;

  const elements: {
    tag: string;
    color: string;
    width?: number;
    height?: number;
    borderRadius?: number;
    rotation?: [number, number, number];
    scale?: [number, number, number];
    position?: [number, number, number];
    opacity?: number;
  }[] = [];

  function parseInlineStyle(styleString: string): StyleObject {
    const style: StyleObject = {};
    if (!styleString) return style;
    
    styleString.split(';').forEach((rule) => {
      const [key, value] = rule.split(':').map((s) => s.trim());
      if (key && value) {
        style[key as keyof StyleObject] = value;
      }
    });
    return style;
  }

  function parseCssClasses(css: string): Record<string, StyleObject> {
    const classStyles: Record<string, StyleObject> = {};
    const regex = /\.(\w+)\s*\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      const className = match[1];
      const declarations = match[2].trim().split(';');
      const style: StyleObject = {};
      declarations.forEach((decl) => {
        const [key, value] = decl.split(':').map((s) => s.trim());
        if (key && value) {
          style[key as keyof StyleObject] = value;
        }
      });
      classStyles[className] = style;
    }
    return classStyles;
  }

  const cssMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const cssRules = cssMatches ? parseCssClasses(cssMatches[1]) : {};

  function parseTransform(transform: string): [number, number, number] {
    const rotation: [number, number, number] = [0, 0, 0];
    const match = transform.match(/rotate\(([-\d.]+)deg\)/);
    if (match) {
      const deg = parseFloat(match[1]);
      rotation[1] = (deg * Math.PI) / 180;
    }
    return rotation;
  }

  function walk(node: HTMLElement) {
    const tag = node.tagName.toLowerCase();
    const inlineStyle = parseInlineStyle(node.getAttribute('style') || '');

    const classes = (node.getAttribute('class') || '').split(/\s+/);
    const classStyle = classes.reduce<StyleObject>((acc, className) => {
      const styles = cssRules[className] || {};
      return { ...acc, ...styles };
    }, {});

    const style: StyleObject = { ...classStyle, ...inlineStyle };

    const colorMap: Record<string, string> = {
      div: 'royalblue',
      section: 'purple',
      header: 'gold',
      h1: '#4CAF50',  // bright green for h1
      footer: 'gray',
      article: 'orange',
    };

    const scale = style.scale ? parseFloat(style.scale) : 1;
    const element = {
      tag,
      color: style['background-color'] || colorMap[tag] || 'white',
      width: style.width ? parseInt(style.width) : undefined,
      height: style.height ? parseInt(style.height) : undefined,
      borderRadius: style['border-radius'] ? parseInt(style['border-radius']) : undefined,
      rotation: style.transform ? parseTransform(style.transform) : [0, 0, 0] as [number, number, number],
      scale: [scale, scale, scale] as [number, number, number],
      position: [
        style['translate-x'] ? parseFloat(style['translate-x']) : 0,
        style['translate-y'] ? parseFloat(style['translate-y']) : 0,
        style['translate-z'] ? parseFloat(style['translate-z']) : 0,
      ] as [number, number, number],
      opacity: style.opacity ? parseFloat(style.opacity) : 1,
    };

    elements.push(element);

    Array.from(node.children).forEach((child) => walk(child as HTMLElement));
  }

  Array.from(div.children).forEach((child) => walk(child as HTMLElement));

  return elements;
}
