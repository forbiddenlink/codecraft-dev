// File: /src/data/villagers.ts
export interface Villager {
  id: string;
  name: string;
  mood: "curious" | "shy" | "wise";
  color: string;
  model: "sphere" | "capsule" | "roundedBox";
  dialog: string[];
}

export interface Villager {
  id: string;
  name: string;
  mood: "curious" | "shy" | "wise";
  color: string;
  model: "sphere" | "capsule" | "roundedBox";
  dialog: string[];
  position: [number, number, number]; // 🛠️ Add this line
}

export const villagers: Villager[] = [
  {
    id: "astro",
    name: "Astro",
    mood: "curious",
    color: "#00bfff",
    model: "capsule",
    position: [2, 0.6, -2], // 🌍 Add position
    dialog: [
      "Hey there, space traveler! 🌠",
      "This world is built by code—try adding a <section>!",
      "I'll be around if you need a hint.",
    ],
  },
  {
    id: "nova",
    name: "Nova",
    mood: "wise",
    color: "#b19cd9",
    model: "sphere",
    position: [-2, 0.6, -2], // 🌍 Add position
    dialog: [
      "Knowledge is stardust, and you’re gathering it. ✨",
      "Try using a <header> to mark the start of something new.",
    ],
  },
];
