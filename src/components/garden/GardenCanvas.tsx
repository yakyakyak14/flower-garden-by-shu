import { useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlowerType, PlacedFlower } from "@/lib/flowers";
import FlowerSVG from "./FlowerSVG";
import ConfettiBubbles from "./ConfettiBubbles";

interface GardenCanvasProps {
  flowerType: FlowerType;
  placedFlowers: PlacedFlower[];
  targetCount: number;
  onFlowerClick: (x: number, y: number) => void;
  isNearEnd: boolean;
  canvasRef?: React.RefObject<HTMLDivElement>;
  frameCount?: number;
}

// Generate random but stable decorative elements
const useGardenDecorations = () => {
  return useMemo(() => {
    const butterflies = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: 20 + Math.random() * 60,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      emoji: ["🦋", "🐝", "🐞"][i % 3],
    }));
    const clouds = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      y: 5 + i * 8,
      duration: 30 + Math.random() * 20,
      delay: i * 10,
      scale: 0.8 + Math.random() * 0.4,
    }));
    const grassBlades = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: i * 5 + Math.random() * 3,
      height: 30 + Math.random() * 40,
      delay: Math.random() * 2,
    }));
    return { butterflies, clouds, grassBlades };
  }, []);
};

const GardenCanvas = ({ flowerType, placedFlowers, targetCount, onFlowerClick, isNearEnd, canvasRef: externalRef, frameCount = 0 }: GardenCanvasProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalRef || internalRef;
  const currentCount = placedFlowers.length;
  const progress = (currentCount / targetCount) * 100;
  const remaining = targetCount - currentCount;
  const { butterflies, clouds, grassBlades } = useGardenDecorations();

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || currentCount >= targetCount) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    onFlowerClick(x, y);
  }, [currentCount, targetCount, onFlowerClick]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] touch-none">
      {/* Progress Bar */}
      <div className="fixed top-20 left-2 right-2 sm:left-4 sm:right-4 z-30">
        <div className="glass-card !p-2 sm:!p-3 flex items-center gap-2 sm:gap-4 max-w-lg mx-auto">
          <span className="text-xl sm:text-2xl">{flowerType.emoji}</span>
          <div className="flex-1">
            <div className="h-2 sm:h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-primary)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground min-w-[60px] sm:min-w-[80px] text-right">
            {currentCount} / {targetCount}
          </span>
        </div>
      </div>

      {/* Garden Area */}
      <div
        ref={canvasRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className="absolute inset-0 cursor-pointer select-none overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(200 60% 85%) 0%, hsl(180 40% 88%) 25%, hsl(140 30% 90%) 50%, hsl(100 35% 80%) 80%, hsl(90 40% 65%) 100%)",
        }}
      >
        {/* Sky gradient with sun */}
        <div className="absolute top-6 right-12 sm:top-10 sm:right-20 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl sm:text-5xl"
            style={{ filter: "drop-shadow(0 0 20px hsl(45 100% 60% / 0.6))" }}
          >
            ☀️
          </motion.div>
        </div>

        {/* Animated clouds */}
        {clouds.map((cloud) => (
          <motion.div
            key={`cloud-${cloud.id}`}
            className="absolute pointer-events-none text-3xl sm:text-4xl opacity-60"
            style={{ top: `${cloud.y}%`, transform: `scale(${cloud.scale})` }}
            initial={{ left: "-10%" }}
            animate={{ left: "110%" }}
            transition={{
              duration: cloud.duration,
              repeat: Infinity,
              delay: cloud.delay,
              ease: "linear",
            }}
          >
            ☁️
          </motion.div>
        ))}

        {/* Distant hills */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "45%",
            background: "linear-gradient(180deg, transparent 0%, hsl(120 25% 55% / 0.3) 30%, hsl(120 30% 45% / 0.5) 60%, hsl(120 35% 35% / 0.6) 100%)",
            borderRadius: "50% 60% 0 0 / 30% 25% 0 0",
          }}
        />

        {/* Grass blades swaying */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden">
          {grassBlades.map((blade) => (
            <motion.div
              key={`grass-${blade.id}`}
              className="absolute bottom-0"
              style={{
                left: `${blade.x}%`,
                width: "3px",
                height: `${blade.height}px`,
                background: `linear-gradient(to top, hsl(120 40% 35%), hsl(100 45% 50%))`,
                borderRadius: "2px 2px 0 0",
                transformOrigin: "bottom center",
              }}
              animate={{ rotateZ: [-5, 5, -5] }}
              transition={{
                duration: 2 + blade.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: blade.delay,
              }}
            />
          ))}
        </div>

        {/* Animated butterflies/bees */}
        {butterflies.map((b) => (
          <motion.div
            key={`fly-${b.id}`}
            className="absolute pointer-events-none text-lg sm:text-xl"
            initial={{ left: `${b.startX}%`, top: `${b.startY}%` }}
            animate={{
              left: [`${b.startX}%`, `${(b.startX + 30) % 100}%`, `${(b.startX + 60) % 100}%`, `${b.startX}%`],
              top: [`${b.startY}%`, `${b.startY - 10}%`, `${b.startY + 5}%`, `${b.startY}%`],
            }}
            transition={{
              duration: b.duration,
              repeat: Infinity,
              delay: b.delay,
              ease: "easeInOut",
            }}
          >
            {b.emoji}
          </motion.div>
        ))}

        {/* Sparkle particles that appear as flowers grow */}
        {currentCount > 0 && currentCount % 10 === 0 && (
          <motion.div
            key={`sparkle-${currentCount}`}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-sm"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0, y: -30 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              >
                ✨
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Placed Flowers */}
        <AnimatePresence>
          {placedFlowers.map((flower) => (
            <motion.div
              key={flower.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: flower.scale, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="absolute"
              data-flower="true"
              style={{
                left: `${flower.x}%`,
                top: `${flower.y}%`,
                transform: `translate(-50%, -50%) rotate(${flower.rotation}deg)`,
              }}
            >
              <FlowerSVG type={flower.type} size={window.innerWidth < 640 ? 28 : 36} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Celebration bubbles near end */}
        {isNearEnd && <ConfettiBubbles intensity={Math.max(1, 21 - remaining)} />}

        {/* Recording indicator */}
        {frameCount > 0 && (
          <div className="fixed bottom-4 right-4 z-30">
            <div className="glass-card !p-2 !px-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-muted-foreground font-medium">
                REC · {frameCount} frames
              </span>
            </div>
          </div>
        )}

        {/* Tap hint */}
        {currentCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="glass-card text-center mx-4">
              <div className="text-3xl sm:text-4xl mb-2">👆</div>
              <p className="text-foreground font-semibold text-sm sm:text-base">Tap anywhere to grow flowers!</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GardenCanvas;
