export interface FlowerType {
  id: string;
  name: string;
  emoji: string;
  colors: string[];
  description: string;
}

export const FLOWER_TYPES: FlowerType[] = [
  { id: "rose", name: "Rose", emoji: "🌹", colors: ["#e84393", "#fd79a8", "#fab1a0"], description: "Classic beauty & love" },
  { id: "sunflower", name: "Sunflower", emoji: "🌻", colors: ["#fdcb6e", "#f39c12", "#e17055"], description: "Joy & positivity" },
  { id: "tulip", name: "Tulip", emoji: "🌷", colors: ["#e84393", "#a29bfe", "#fd79a8"], description: "Grace & elegance" },
  { id: "daisy", name: "Daisy", emoji: "🌼", colors: ["#ffeaa7", "#ffffff", "#dfe6e9"], description: "Innocence & purity" },
  { id: "lily", name: "Lily", emoji: "🌸", colors: ["#fab1a0", "#ffffff", "#ffeaa7"], description: "Devotion & tranquility" },
  { id: "orchid", name: "Orchid", emoji: "💮", colors: ["#a29bfe", "#6c5ce7", "#fd79a8"], description: "Luxury & strength" },
  { id: "lavender", name: "Lavender", emoji: "💜", colors: ["#a29bfe", "#6c5ce7", "#dfe6e9"], description: "Calm & serenity" },
  { id: "cherry_blossom", name: "Cherry Blossom", emoji: "🌸", colors: ["#fab1a0", "#fd79a8", "#ffeaa7"], description: "Renewal & hope" },
];

export const FLOWER_COUNTS = Array.from({ length: 19 }, (_, i) => 100 + i * 50);

export function calculateWynKoins(flowerCount: number): number {
  return flowerCount / 100;
}

export interface PlacedFlower {
  id: number;
  x: number;
  y: number;
  type: FlowerType;
  scale: number;
  rotation: number;
}
