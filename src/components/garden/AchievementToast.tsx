import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

const UNLOCK_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3";

const AchievementToast = ({ achievements, onDismiss }: AchievementToastProps) => {
  const [current, setCurrent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (achievements.length === 0) return;

    // Play unlock sound
    try {
      audioRef.current = new Audio(UNLOCK_SOUND_URL);
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});
    } catch {}

    const timer = setTimeout(() => {
      if (current < achievements.length - 1) {
        setCurrent((c) => c + 1);
      } else {
        onDismiss();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [current, achievements.length, onDismiss]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (achievements.length === 0) return null;

  const achievement = achievements[current];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={achievement.id}
        initial={{ y: 80, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.5 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="fixed bottom-6 left-4 right-4 z-[70] flex justify-center"
      >
        <div className="glass-card !p-4 max-w-sm w-full flex items-center gap-3 !border-accent shadow-lg overflow-hidden relative">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Icon with bounce */}
          <motion.div
            className="text-4xl relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.2 }}
          >
            {achievement.icon}
          </motion.div>

          <div className="flex-1 relative z-10">
            <motion.p
              className="font-display font-bold text-foreground text-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              🏆 Achievement Unlocked!
            </motion.p>
            <motion.p
              className="font-semibold text-xs text-foreground"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {achievement.name}
            </motion.p>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.description}
            </motion.p>
          </div>

          <button onClick={onDismiss} className="p-1 rounded-full hover:bg-muted relative z-10">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-accent"
              initial={{
                x: "50%",
                y: "50%",
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
