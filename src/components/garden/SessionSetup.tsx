import { useState } from "react";
import { motion } from "framer-motion";
import { FLOWER_TYPES, FLOWER_COUNTS, FlowerType } from "@/lib/flowers";
import { Flower2, Hash, Play } from "lucide-react";

interface SessionSetupProps {
  onStart: (flower: FlowerType, count: number) => void;
  isAuthenticated: boolean;
}

const SessionSetup = ({ onStart, isAuthenticated }: SessionSetupProps) => {
  const [selectedFlower, setSelectedFlower] = useState<FlowerType | null>(null);
  const [selectedCount, setSelectedCount] = useState(100);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Choose Your Flowers
          </h2>
          <p className="text-muted-foreground">Select a flower type and how many to grow</p>
        </div>

        {/* Flower Selection */}
        <div className="glass-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flower2 className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Flower Type</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FLOWER_TYPES.map((flower) => (
              <button
                key={flower.id}
                onClick={() => setSelectedFlower(flower)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                  selectedFlower?.id === flower.id
                    ? "border-primary bg-rose-light shadow-md"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="text-3xl mb-1">{flower.emoji}</div>
                <div className="text-sm font-semibold text-foreground">{flower.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{flower.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Flower Count */}
        <div className="glass-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Number of Flowers</h3>
            <span className="ml-auto text-sm text-accent font-bold">
              = {(selectedCount / 100).toFixed(1)} WYN-KOIN{selectedCount > 100 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {FLOWER_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setSelectedCount(count)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  selectedCount === count
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-foreground hover:bg-rose-light"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => selectedFlower && onStart(selectedFlower, selectedCount)}
          disabled={!selectedFlower}
          className="btn-garden w-full text-lg justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Growing {selectedFlower?.emoji || ""}
        </motion.button>

        {!isAuthenticated && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            🔓 Playing as guest — no music or WYN-KOINs. <a href="/auth" className="text-primary font-semibold hover:underline">Sign up</a> to unlock!
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default SessionSetup;
