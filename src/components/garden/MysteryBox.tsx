import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mysteryBoxImage from "@/assets/mystery-box.png";
import ReactMarkdown from "react-markdown";
import { Gift, RotateCcw, Sparkles, Download } from "lucide-react";
import ShareButtons from "./ShareButtons";

interface MysteryBoxProps {
  message: string;
  wynKoins: number;
  isAuthenticated: boolean;
  onClose: () => void;
  gardenCanvasRef?: React.RefObject<HTMLDivElement>;
}

const MysteryBox = ({ message, wynKoins, isAuthenticated, onClose, gardenCanvasRef }: MysteryBoxProps) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleDownloadGarden = async () => {
    // Create a simple downloadable garden summary image via canvas
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, "#fff5f5");
    gradient.addColorStop(1, "#f0e6ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Draw title
    ctx.fillStyle = "#8b2252";
    ctx.font = "bold 36px serif";
    ctx.textAlign = "center";
    ctx.fillText("🌸 My Flower Garden 🌸", 400, 80);

    // Draw message
    ctx.fillStyle = "#555";
    ctx.font = "18px sans-serif";
    const words = (message || "Beautiful garden session!").split(" ");
    let line = "";
    let y = 200;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 600) {
        ctx.fillText(line, 400, y);
        line = word + " ";
        y += 28;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 400, y);

    if (wynKoins > 0) {
      ctx.fillStyle = "#c98a1a";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`+${wynKoins} WYN-KOINs earned! 🪙`, 400, y + 80);
    }

    ctx.fillStyle = "#aaa";
    ctx.font = "14px sans-serif";
    ctx.fillText("The Flower Garden — theflowergarden.app", 400, 560);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-flower-garden.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-md px-4">
      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="box"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center cursor-pointer"
            onClick={() => setIsOpened(true)}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="mystery-box-glow rounded-3xl inline-block p-2">
                <img src={mysteryBoxImage} alt="Mystery Box" className="w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-primary-foreground font-display text-lg sm:text-xl font-semibold"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
            >
              ✨ Tap to open your mystery box ✨
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="message"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="glass-card max-w-md w-full text-center !bg-card/98 max-h-[85vh] overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4">
              A Message for You 💝
            </h2>

            <div className="text-muted-foreground leading-relaxed mb-6 prose prose-sm max-w-none font-body">
              <ReactMarkdown>{message || "Loading your special message..."}</ReactMarkdown>
            </div>

            {wynKoins > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-light mb-4">
                <Gift className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-accent-foreground">
                  +{wynKoins} WYN-KOIN{wynKoins > 1 ? "s" : ""} added to your balance
                </span>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mb-4">
                Sign up to earn WYN-KOINs and get personalized messages! 🌸
              </p>
            )}

            {isAuthenticated && (
              <button onClick={handleDownloadGarden} className="btn-outline-garden w-full justify-center mb-3 text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download Garden Card
              </button>
            )}

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Share your achievement</p>
              <ShareButtons
                title="My Flower Garden"
                text={`I just grew a beautiful flower garden! 🌸`}
                wynKoins={wynKoins}
              />
            </div>

            <button onClick={onClose} className="btn-garden w-full justify-center mt-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Grow Another Garden
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MysteryBox;
