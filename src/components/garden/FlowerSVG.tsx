import { FlowerType } from "@/lib/flowers";

interface FlowerSVGProps {
  type: FlowerType;
  size?: number;
}

const FlowerSVG = ({ type, size = 32 }: FlowerSVGProps) => {
  const color1 = type.colors[0];
  const color2 = type.colors[1];
  const color3 = type.colors[2] || type.colors[0];

  // Organic bloom with unfolding petals - each petal has a unique unfold delay via CSS
  return (
    <svg width={size} height={size} viewBox="0 0 50 55" className="flower-bloom drop-shadow-md">
      {/* Stem */}
      <path
        d="M25 35 Q23 42 25 52"
        stroke="#6b9e6b"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        className="stem-grow"
      />
      {/* Leaf left */}
      <path
        d="M24 44 Q18 40 16 43 Q18 46 24 44"
        fill="#7cb87c"
        opacity="0.7"
        className="leaf-unfurl leaf-left"
      />
      {/* Leaf right */}
      <path
        d="M26 40 Q32 36 34 39 Q32 42 26 40"
        fill="#6aae6a"
        opacity="0.7"
        className="leaf-unfurl leaf-right"
      />

      {/* Outer petals - large, organic shapes */}
      {[0, 51.4, 102.8, 154.3, 205.7, 257.1, 308.5].map((angle, i) => (
        <path
          key={`outer-${angle}`}
          d={`M25 25 Q${22 + (i % 2) * 2} ${12 - i % 3} ${25 + Math.cos((angle * Math.PI) / 180) * 3} ${25 - 16} Q${28 - (i % 2) * 2} ${12 + i % 3} 25 25`}
          fill={i % 2 === 0 ? color1 : color2}
          opacity={0.75}
          transform={`rotate(${angle} 25 25)`}
          className={`petal-unfold petal-delay-${i}`}
          style={{ transformOrigin: '25px 25px' }}
        />
      ))}

      {/* Inner petals - smaller, slightly different shape */}
      {[30, 90, 150, 210, 270, 330].map((angle, i) => (
        <ellipse
          key={`inner-${angle}`}
          cx="25"
          cy="25"
          rx="4.5"
          ry="9"
          fill={i % 2 === 0 ? color2 : color1}
          opacity={0.6}
          transform={`rotate(${angle} 25 25) translate(0 -5)`}
          className={`petal-unfold-inner petal-delay-${i + 2}`}
          style={{ transformOrigin: '25px 25px' }}
        />
      ))}

      {/* Center pistil */}
      <circle cx="25" cy="25" r="5.5" fill={color3} className="center-bloom" />
      <circle cx="25" cy="25" r="3.5" fill={color1} opacity={0.4} className="center-bloom-inner" />
      {/* Pollen dots */}
      <circle cx="23" cy="23.5" r="1" fill={color2} opacity={0.6} className="pollen-dot" />
      <circle cx="27" cy="23.5" r="1" fill={color2} opacity={0.6} className="pollen-dot" />
      <circle cx="25" cy="27" r="1" fill={color2} opacity={0.6} className="pollen-dot" />
    </svg>
  );
};

export default FlowerSVG;
