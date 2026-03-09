import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MUSIC_CATEGORIES, spotifyEmbedUrl } from "@/lib/music-presets";
import { X, Music, ChevronRight } from "lucide-react";

interface MusicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMusicSelect: (choice: string, embedUrl: string) => void;
}

const MusicSidebar = ({ isOpen, onClose, onMusicSelect }: MusicSidebarProps) => {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("inspirational-books");

  const handlePlay = (preset: { id: string; title: string; spotifyType: string; spotifyId: string }) => {
    const url = spotifyEmbedUrl(preset.spotifyType, preset.spotifyId);
    setActivePresetId(preset.id);
    setActiveEmbedUrl(url);
    onMusicSelect(preset.title, url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Background Audio</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {activeEmbedUrl && (
              <div className="p-4 border-b border-border">
                <div className="rounded-xl overflow-hidden">
                  <iframe
                    src={activeEmbedUrl}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-0"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {MUSIC_CATEGORIES.map((category) => (
                <div key={category.id} className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="flex-1 font-semibold text-sm text-foreground">{category.label}</span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCategory === category.id ? "rotate-90" : ""}`} />
                  </button>

                  {expandedCategory === category.id && (
                    <div className="border-t border-border">
                      {category.presets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePlay(preset)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
                            activePresetId === preset.id ? "bg-accent text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          <span className="text-primary">♪</span>
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicSidebar;
