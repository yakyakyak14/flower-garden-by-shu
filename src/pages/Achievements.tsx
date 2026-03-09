import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ACHIEVEMENTS } from "@/lib/achievements";

const badgeVariants = {
  hidden: { scale: 0, rotateY: 180, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    rotateY: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 12,
      delay: i * 0.08,
    },
  }),
  locked: (i: number) => ({
    scale: 1,
    rotateY: 0,
    opacity: 0.5,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 15,
      delay: i * 0.08,
    },
  }),
};

const Achievements = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchAchievements();
  }, [user, loading]);

  const fetchAchievements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);
    if (data) {
      setUnlockedIds(new Set(data.map((a: any) => a.achievement_id)));
    }
  };

  const categories = [
    { key: "sessions", label: "Sessions", emoji: "🌿" },
    { key: "streaks", label: "Streaks", emoji: "🔥" },
    { key: "flowers", label: "Flowers", emoji: "💐" },
    { key: "koins", label: "WYN-KOINs", emoji: "🪙" },
    { key: "special", label: "Special", emoji: "✨" },
  ] as const;

  const totalUnlocked = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).length;

  if (loading) {
    return (
      <div className="garden-surface min-h-screen flex items-center justify-center">
        <div className="text-2xl">🌸</div>
      </div>
    );
  }

  const selected = selectedBadge ? ACHIEVEMENTS.find((a) => a.id === selectedBadge) : null;

  return (
    <div className="garden-surface min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <Trophy className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-display font-bold text-foreground">Achievements</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-6 text-center"
        >
          <div className="text-3xl font-bold text-foreground">{totalUnlocked} / {ACHIEVEMENTS.length}</div>
          <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
          <div className="h-3 rounded-full bg-muted overflow-hidden mt-3">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--gradient-celebration, var(--gradient-primary))" }}
              initial={{ width: 0 }}
              animate={{ width: `${(totalUnlocked / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {categories.map(({ key, label, emoji }) => {
          const items = ACHIEVEMENTS.filter((a) => a.category === key);
          let globalIndex = 0;
          return (
            <motion.div
              key={key}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display font-semibold text-foreground text-lg mb-3 flex items-center gap-2">
                <span>{emoji}</span> {label}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((achievement) => {
                  const unlocked = unlockedIds.has(achievement.id);
                  const idx = globalIndex++;
                  return (
                    <motion.div
                      key={achievement.id}
                      custom={idx}
                      variants={badgeVariants}
                      initial="hidden"
                      animate={unlocked ? "visible" : "locked"}
                      whileHover={unlocked ? { scale: 1.08, rotateY: 10 } : { scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBadge(achievement.id)}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-shadow relative overflow-hidden ${
                        unlocked
                          ? "bg-gold-light/50 border-accent shadow-md hover:shadow-lg"
                          : "bg-muted/30 border-border"
                      }`}
                      style={{ perspective: 800 }}
                    >
                      {unlocked && (
                        <motion.div
                          className="absolute top-1 right-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.08 + 0.3, type: "spring" }}
                        >
                          <Sparkles className="w-3 h-3 text-accent" />
                        </motion.div>
                      )}
                      <motion.div
                        className="text-3xl mb-1"
                        animate={unlocked ? { rotateY: [0, 360] } : {}}
                        transition={{ duration: 0.6, delay: idx * 0.08 + 0.2 }}
                      >
                        {unlocked ? achievement.icon : <Lock className="w-6 h-6 mx-auto text-muted-foreground" />}
                      </motion.div>
                      <div className="font-semibold text-xs text-foreground">{achievement.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{achievement.description}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="glass-card !p-6 max-w-xs w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-3"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {unlockedIds.has(selected.id) ? selected.icon : "🔒"}
              </motion.div>
              <h3 className="font-display font-bold text-foreground text-lg">{selected.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                unlockedIds.has(selected.id)
                  ? "bg-accent/20 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {unlockedIds.has(selected.id) ? "✅ Unlocked" : "🔒 Locked"}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Achievements;
