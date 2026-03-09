import { supabase } from "@/integrations/supabase/client";
import { FLOWER_TYPES } from "@/lib/flowers";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "sessions" | "streaks" | "flowers" | "koins" | "special";
}

export const ACHIEVEMENTS: Achievement[] = [
  // Session milestones
  { id: "first_bloom", name: "First Bloom", description: "Complete your first garden session", icon: "🌱", category: "sessions" },
  { id: "gardener_10", name: "Budding Gardener", description: "Complete 10 sessions", icon: "🌿", category: "sessions" },
  { id: "gardener_50", name: "Green Thumb", description: "Complete 50 sessions", icon: "🪴", category: "sessions" },
  { id: "gardener_100", name: "Master Gardener", description: "Complete 100 sessions", icon: "🏡", category: "sessions" },
  { id: "gardener_500", name: "Legendary Gardener", description: "Complete 500 sessions", icon: "👑", category: "sessions" },

  // Streak milestones
  { id: "streak_3", name: "Getting Started", description: "Reach a 3-day streak", icon: "🔥", category: "streaks" },
  { id: "streak_7", name: "Week Warrior", description: "Reach a 7-day streak", icon: "⚡", category: "streaks" },
  { id: "streak_14", name: "Fortnight Force", description: "Reach a 14-day streak", icon: "💪", category: "streaks" },
  { id: "streak_30", name: "Monthly Master", description: "Reach a 30-day streak", icon: "🌟", category: "streaks" },

  // Flower variety
  { id: "variety_3", name: "Diverse Garden", description: "Grow 3 different flower types", icon: "💐", category: "flowers" },
  { id: "variety_all", name: "Botanical Expert", description: "Grow every flower type", icon: "🏆", category: "flowers" },
  { id: "big_garden", name: "Grand Garden", description: "Grow 1,000 flowers in a single session", icon: "🌺", category: "flowers" },
  { id: "flowers_5000", name: "Flower Power", description: "Grow 5,000 total flowers", icon: "🌸", category: "flowers" },

  // WYN-KOIN milestones
  { id: "koins_100", name: "Coin Collector", description: "Earn 100 WYN-KOINs", icon: "🪙", category: "koins" },
  { id: "koins_1000", name: "Koin King", description: "Earn 1,000 WYN-KOINs", icon: "💰", category: "koins" },
  { id: "koins_10000", name: "Koin Legend", description: "Earn 10,000 WYN-KOINs", icon: "💎", category: "koins" },

  // Special
  { id: "night_gardener", name: "Night Gardener", description: "Complete a session between midnight and 5am", icon: "🌙", category: "special" },
  { id: "speed_demon", name: "Speed Demon", description: "Complete 100 flowers in under 2 minutes", icon: "⏱️", category: "special" },
];

interface CheckContext {
  userId: string;
  totalSessions: number;
  currentStreak: number;
  totalFlowers: number;
  balance: number;
  uniqueFlowerTypes: string[];
  sessionFlowerCount: number;
  sessionDurationMs?: number;
}

export const getNewAchievements = async (ctx: CheckContext): Promise<Achievement[]> => {
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", ctx.userId);

  const unlocked = new Set(existing?.map((a: any) => a.achievement_id) || []);
  const newlyUnlocked: Achievement[] = [];

  const checks: Record<string, boolean> = {
    first_bloom: ctx.totalSessions >= 1,
    gardener_10: ctx.totalSessions >= 10,
    gardener_50: ctx.totalSessions >= 50,
    gardener_100: ctx.totalSessions >= 100,
    gardener_500: ctx.totalSessions >= 500,
    streak_3: ctx.currentStreak >= 3,
    streak_7: ctx.currentStreak >= 7,
    streak_14: ctx.currentStreak >= 14,
    streak_30: ctx.currentStreak >= 30,
    variety_3: ctx.uniqueFlowerTypes.length >= 3,
    variety_all: ctx.uniqueFlowerTypes.length >= FLOWER_TYPES.length,
    big_garden: ctx.sessionFlowerCount >= 1000,
    flowers_5000: ctx.totalFlowers >= 5000,
    koins_100: ctx.balance >= 100,
    koins_1000: ctx.balance >= 1000,
    koins_10000: ctx.balance >= 10000,
    night_gardener: (() => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5;
    })(),
    speed_demon: ctx.sessionFlowerCount >= 100 && (ctx.sessionDurationMs || Infinity) < 120000,
  };

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && checks[achievement.id]) {
      newlyUnlocked.push(achievement);
    }
  }

  // Save newly unlocked
  if (newlyUnlocked.length > 0) {
    await supabase.from("user_achievements").insert(
      newlyUnlocked.map((a) => ({
        user_id: ctx.userId,
        achievement_id: a.id,
      })) as any
    );
  }

  return newlyUnlocked;
};
