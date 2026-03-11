import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const CELEBRATION_DURATION = 8000;

const CONFETTI_COLORS = [
  "hsl(340, 75%, 55%)",
  "hsl(270, 50%, 70%)",
  "hsl(40, 90%, 60%)",
  "hsl(350, 80%, 65%)",
  "hsl(140, 30%, 60%)",
  "hsl(20, 80%, 75%)",
  "hsl(200, 70%, 60%)",
];

const FLOWERS = ["🌸", "🌺", "🌻", "🌷", "🌹", "💐", "🏵️", "💮"];

interface DonationCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

const DonationCelebration = ({ show, onComplete }: DonationCelebrationProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!show) return;

    try {
      audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {});
    } catch {}

    const timer = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      onComplete();
    }, CELEBRATION_DURATION);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          initial={{ x: "50vw", y: "-10vh", opacity: 1, scale: 0 }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${100 + Math.random() * 20}vh`,
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.6],
            rotate: Math.random() * 1080,
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            delay: Math.random() * 1,
            ease: "easeOut",
          }}
          className="absolute rounded-full"
          style={{
            width: 6 + Math.random() * 10,
            height: 6 + Math.random() * 10,
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          }}
        />
      ))}

      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`flower-${i}`}
          initial={{ x: `${Math.random() * 100}vw`, y: "110vh", opacity: 0 }}
          animate={{
            y: [null, "-10vh"],
            opacity: [0, 1, 1, 0],
            rotate: [0, Math.random() * 360],
            scale: [0.5, 1.5 + Math.random()],
          }}
          transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 2, ease: "easeOut" }}
          className="absolute text-2xl sm:text-4xl"
        >
          {FLOWERS[Math.floor(Math.random() * FLOWERS.length)]}
        </motion.div>
      ))}

      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{ duration: 1.5, delay: Math.random() * 5, repeat: 2 }}
          className="absolute text-accent"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        >
          <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
      >
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-5xl mb-3"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Thank You!</h2>
          <p className="text-sm text-muted-foreground">
            Your donation helps keep things running smoothly. 🌸✨
          </p>
          <button
            onClick={onComplete}
            className="mt-4 px-6 py-2 rounded-full text-sm font-semibold text-primary-foreground pointer-events-auto"
            style={{ background: "var(--gradient-primary)" }}
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DonationCelebration;
