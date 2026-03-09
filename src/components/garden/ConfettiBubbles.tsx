import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const COLORS = [
  "hsl(340, 75%, 55%)",
  "hsl(270, 50%, 70%)",
  "hsl(40, 90%, 60%)",
  "hsl(350, 80%, 65%)",
  "hsl(140, 30%, 60%)",
  "hsl(20, 80%, 75%)",
];

interface ConfettiBubblesProps {
  intensity: number; // 1-20
}

const ConfettiBubbles = ({ intensity }: ConfettiBubblesProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.min(intensity, 5);
      const newBubbles: Bubble[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: 80 + Math.random() * 20,
        size: 6 + Math.random() * 14,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
      }));

      setBubbles(prev => [...prev.slice(-50), ...newBubbles]);
    }, 300);

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="confetti-bubble absolute rounded-full"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            animationDelay: `${bubble.delay}s`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiBubbles;
