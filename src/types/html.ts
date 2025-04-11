export interface HtmlNode {
  elementType: string;
  attributes?: Record<string, string>;
  level: number;
  index: number;
  children?: HtmlNode[];
  styles?: Record<string, unknown>;
} 