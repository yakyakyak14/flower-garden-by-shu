import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlowerType } from "@/lib/flowers";
import { Download, Image, Video, Loader2 } from "lucide-react";
import { downloadBlob } from "@/lib/garden-recorder";

interface CelebrationOverlayProps {
  wynKoins: number;
  targetCount: number;
  flowerType: FlowerType | null;
  showMysteryBox: boolean;
  showTimelapse: boolean;
  onTimelapseEnd: () => void;
  isAuthenticated?: boolean;
  timelapseBlob?: Blob | null;
  finalImageUrl?: string | null;
}

const CONFETTI_COLORS = [
  "hsl(340, 75%, 55%)",
  "hsl(270, 50%, 70%)",
  "hsl(40, 90%, 60%)",
  "hsl(350, 80%, 65%)",
  "hsl(140, 30%, 60%)",
  "hsl(20, 80%, 75%)",
  "hsl(200, 70%, 60%)",
];

const CelebrationOverlay = ({
  wynKoins,
  targetCount,
  flowerType,
  showTimelapse,
  onTimelapseEnd,
  isAuthenticated,
  timelapseBlob,
  finalImageUrl,
}: CelebrationOverlayProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (timelapseBlob) {
      const url = URL.createObjectURL(timelapseBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [timelapseBlob]);

  const handleDownloadVideo = () => {
    if (timelapseBlob) {
      const ext = timelapseBlob.type.includes("mp4") ? "mp4" : "webm";
      downloadBlob(timelapseBlob, `garden-timelapse.${ext}`);
    }
  };

  const handleDownloadImage = () => {
    if (finalImageUrl) {
      const a = document.createElement("a");
      a.href = finalImageUrl;
      a.download = "garden-final.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden">
      {/* Confetti particles */}
      <div className="pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
            animate={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
              rotate: Math.random() * 720,
            }}
            transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              width: 8 + Math.random() * 12,
              height: 8 + Math.random() * 12,
              backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            }}
          />
        ))}
      </div>

      {/* Timelapse Video Phase */}
      <AnimatePresence>
        {showTimelapse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-foreground/80 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-full max-w-2xl"
            >
              <div className="glass-card !p-3 sm:!p-4 text-center">
                <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-3">
                  🌸 Your Garden Journey 🌸
                </h3>

                <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-3 flex items-center justify-center">
                  {videoUrl ? (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      autoPlay
                      loop
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm">Generating your timelapse...</p>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  A 7-second timelapse of your flower growing session! 🌺
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  {timelapseBlob && (
                    <button
                      onClick={handleDownloadVideo}
                      className="btn-outline-garden flex-1 justify-center text-sm !px-4 !py-2"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Download Timelapse
                    </button>
                  )}
                  {finalImageUrl && (
                    <button
                      onClick={handleDownloadImage}
                      className="btn-outline-garden flex-1 justify-center text-sm !px-4 !py-2"
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Download Final Garden
                    </button>
                  )}
                  <button
                    onClick={onTimelapseEnd}
                    className="btn-garden flex-1 justify-center text-sm !px-4 !py-2"
                  >
                    Open Mystery Box ✨
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center celebration text */}
      {!showTimelapse && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
        >
          <div className="glass-card text-center !bg-card/95 max-w-sm w-full">
            <div className="text-4xl sm:text-5xl mb-3">🎉</div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">Garden Complete!</h2>
            <p className="text-sm text-muted-foreground mb-1">
              You grew {targetCount} beautiful {flowerType?.name}s!
            </p>
            {wynKoins > 0 && (
              <p className="text-accent font-bold text-base sm:text-lg">
                +{wynKoins} WYN-KOIN{wynKoins > 1 ? "s" : ""} earned! ✨
              </p>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">Generating your garden timelapse...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CelebrationOverlay;
