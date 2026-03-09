import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle, ArrowLeft } from "lucide-react";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="garden-surface min-h-screen px-4 py-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors mb-4">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center">
          {isInstalled ? (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Already Installed! 🌸</h1>
              <p className="text-muted-foreground">The Flower Garden is on your home screen.</p>
            </>
          ) : (
            <>
              <Smartphone className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Install The Flower Garden</h1>
              <p className="text-muted-foreground mb-6">
                Add to your home screen for the best experience — offline access, push notifications, and instant launch!
              </p>

              {deferredPrompt ? (
                <button onClick={handleInstall} className="btn-garden w-full flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Install App
                </button>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="font-semibold text-sm text-foreground mb-1">📱 iPhone / Safari</p>
                    <p className="text-xs text-muted-foreground">Tap Share → Add to Home Screen</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="font-semibold text-sm text-foreground mb-1">🤖 Android / Chrome</p>
                    <p className="text-xs text-muted-foreground">Tap ⋮ Menu → Install App</p>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
