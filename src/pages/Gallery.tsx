import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Image, Trash2, X, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getScreenshotUrl } from "@/lib/garden-capture";
import { FLOWER_TYPES } from "@/lib/flowers";

interface GalleryItem {
  id: string;
  flower_type: string;
  flower_count: number;
  screenshot_path: string;
  created_at: string;
}

const Gallery = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchGallery();
  }, [user, loading]);

  const fetchGallery = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("garden_gallery")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setItems(data as any);
    setFetching(false);
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!user) return;
    await supabase.storage.from("garden-screenshots").remove([item.screenshot_path]);
    await supabase.from("garden_gallery").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedItem(null);
  };

  const handleDownload = async (item: GalleryItem) => {
    const url = getScreenshotUrl(item.screenshot_path);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flower-garden-${item.flower_type}-${item.flower_count}.png`;
    a.target = "_blank";
    a.click();
  };

  const getFlowerEmoji = (type: string) =>
    FLOWER_TYPES.find((f) => f.id === type)?.emoji || "🌸";

  if (loading) {
    return (
      <div className="garden-surface min-h-screen flex items-center justify-center">
        <div className="text-2xl">🌸</div>
      </div>
    );
  }

  return (
    <div className="garden-surface min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <Image className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground">Garden Gallery</h1>
        </div>

        {fetching ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center py-12"
          >
            <div className="text-4xl mb-3">📸</div>
            <p className="text-muted-foreground mb-2">No garden screenshots yet!</p>
            <p className="text-sm text-muted-foreground mb-4">
              Complete a garden session to capture your beautiful creation.
            </p>
            <button onClick={() => navigate("/garden")} className="btn-garden text-sm">
              Start Growing
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow bg-card"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={getScreenshotUrl(item.screenshot_path)}
                    alt={`${item.flower_count} ${item.flower_type}s`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span>{getFlowerEmoji(item.flower_type)}</span>
                    <span className="font-semibold text-foreground">{item.flower_count}</span>
                    <span className="text-muted-foreground">flowers</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl overflow-hidden bg-card">
                <img
                  src={getScreenshotUrl(selectedItem.screenshot_path)}
                  alt="Garden screenshot"
                  className="w-full"
                />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFlowerEmoji(selectedItem.flower_type)}</span>
                      <span className="font-semibold text-foreground">
                        {selectedItem.flower_count} flowers
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(selectedItem.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(selectedItem)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedItem)}
                      className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
