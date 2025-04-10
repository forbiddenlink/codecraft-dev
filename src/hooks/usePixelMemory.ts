import { useRef } from "react";

type PixelMemory = {
  lastTag: string | null;
  seenTags: Record<string, number>;
};

export default function usePixelMemory() {
  const memory = useRef<PixelMemory>({
    lastTag: null,
    seenTags: {},
  });

  const remember = (tag: string): string => {
    memory.current.lastTag = tag;
    memory.current.seenTags[tag] = (memory.current.seenTags[tag] || 0) + 1;

    const timesSeen = memory.current.seenTags[tag];

    if (timesSeen === 1) {
      return `Oooh, what's this "${tag}" thing?`;
    } else if (timesSeen === 2) {
      return `You really like this ${tag}, huh? 😄`;
    } else {
      return `Still poking the ${tag}? I admire the curiosity.`;
    }
  };

  return { remember };
}
