// File: /src/utils/parseHtmlToGameObjects.ts
interface StyleObject {
  "background-color"?: string;
  width?: string;
  height?: string;
  transform?: string;
  opacity?: string;
  "border-radius"?: string;
}

export interface GameObject {
  tag: string;
  color: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  opacity?: number;
  children?: GameObject[];
}

export function parseHtmlToGameObjects(code: string): GameObject[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(code, "text/html");
  const body = doc.body;

  const cssMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const cssRules = cssMatches ? parseCssClasses(cssMatches[1]) : {};

  function parseInlineStyle(styleString: string): StyleObject {
    const style: StyleObject = {};
    styleString.split(";").forEach((rule) => {
      const [key, value] = rule.split(":").map((s) => s.trim());
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
      const declarations = match[2].trim().split(";");
      const style: StyleObject = {};
      declarations.forEach((decl) => {
        const [key, value] = decl.split(":").map((s) => s.trim());
        if (key && value) {
          style[key as keyof StyleObject] = value;
        }
      });
      classStyles[className] = style;
    }
    return classStyles;
  }

  function walk(node: HTMLElement, depth = 0): GameObject {
    const tag = node.tagName.toLowerCase();
    const inlineStyle = parseInlineStyle(node.getAttribute("style") || "");

    const classes = (node.getAttribute("class") || "").split(/\s+/);
    const classStyle = classes.reduce<StyleObject>((acc, className) => {
      const styles = cssRules[className] || {};
      return { ...acc, ...styles };
    }, {});

    const style: StyleObject = { ...classStyle, ...inlineStyle };

    const colorMap: Record<string, string> = {
      div: "royalblue",
      section: "purple",
      header: "gold",
      footer: "gray",
      article: "orange",
    };

    const width = style.width ? parseInt(style.width) : undefined;
    const height = style.height ? parseInt(style.height) : undefined;
    const scale: [number, number, number] | undefined =
      width && height ? [width / 50, height / 50, 1] : undefined;

    const opacity = style.opacity ? parseFloat(style.opacity) : undefined;

    const object: GameObject = {
      tag,
      color: style["background-color"] || colorMap[tag] || "white",
      width,
      height,
      scale,
      opacity,
      position: [depth * 1.5, 0.5, 0],
      children: [],
    };

    const children = Array.from(node.children) as HTMLElement[];
    if (children.length) {
      object.children = children.map((child) => walk(child, depth + 1));
    } else {
      delete object.children;
    }

    return object;
  }

  return Array.from(body.children).map((child) => walk(child as HTMLElement));
}
