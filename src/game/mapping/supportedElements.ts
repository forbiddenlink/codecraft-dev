// Tag names that have a game-object mapping in ElementMapping.ts (BASE_MAPPINGS keys).
// Kept separate because ElementMapping builds three.js Vector3 values, and the code
// validator that only needs the tag list runs on the home route's initial bundle.
// supportedElements.test.ts fails if the two drift apart.
export const SUPPORTED_ELEMENTS: ReadonlySet<string> = new Set(['div', 'main', 'section'])
