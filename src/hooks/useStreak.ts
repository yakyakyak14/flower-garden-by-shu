import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  bonusMultiplier: number;
}

const getStreakBonus = (streak: number): number => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.3;
  if (streak >= 3) return 1.1;
  return 1.0;
};

export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    bonusMultiplier: 1.0,
  });

  useEffect(() => {
    if (userId) fetchStreak(userId);
  }, [userId]);

  const fetchStreak = async (uid: string) => {
    const { data } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (data) {
      setStreak({
        currentStreak: (data as any).current_streak || 0,
        longestStreak: (data as any).longest_streak || 0,
        lastSessionDate: (data as any).last_session_date,
        bonusMultiplier: getStreakBonus((data as any).current_streak || 0),
      });
    }
  };

  const updateStreak = async (uid: string): Promise<number> => {
    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("daily_streaks")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (!existing) {
      await supabase.from("daily_streaks").insert({
        user_id: uid,
        current_streak: 1,
        longest_streak: 1,
        last_session_date: today,
      } as any);
      setStreak({ currentStreak: 1, longestStreak: 1, lastSessionDate: today, bonusMultiplier: 1.0 });
      return 1.0;
    }

    const lastDate = (existing as any).last_session_date;
    if (lastDate === today) {
      // Already gardened today
      return getStreakBonus((existing as any).current_streak || 0);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak: number;
    if (lastDate === yesterdayStr) {
      newStreak = ((existing as any).current_streak || 0) + 1;
    } else {
      newStreak = 1; // Streak broken
    }

    const newLongest = Math.max(newStreak, (existing as any).longest_streak || 0);
    const bonus = getStreakBonus(newStreak);

    await supabase
      .from("daily_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_session_date: today,
      } as any)
      .eq("user_id", uid);

    setStreak({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastSessionDate: today,
      bonusMultiplier: bonus,
    });

    return bonus;
  };

  return { streak, updateStreak };
};

export { getStreakBonus };
