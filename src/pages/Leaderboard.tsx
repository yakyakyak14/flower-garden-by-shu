import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, ArrowLeft, Crown, Medal, Award } from "lucide-react";

interface LeaderEntry {
  user_id: string;
  balance: number;
  display_name: string | null;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data: koins } = await supabase
      .from("wyn_koins")
      .select("user_id, balance")
      .order("balance", { ascending: false })
      .limit(50);

    if (!koins || koins.length === 0) {
      setLoading(false);
      return;
    }

    const userIds = koins.map((k) => k.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

    setLeaders(
      koins.map((k) => ({
        user_id: k.user_id,
        balance: k.balance as number,
        display_name: profileMap.get(k.user_id) || null,
      }))
    );
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-accent" />;
    if (index === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (index === 2) return <Award className="w-5 h-5 text-[hsl(var(--peach))]" />;
    return <span className="w-6 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="garden-surface min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <Trophy className="w-7 h-7 text-accent" />
          <h1 className="text-3xl font-display font-bold text-foreground">Leaderboard</h1>
        </div>

        <div className="glass-card">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-muted-foreground">No gardeners yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaders.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    i < 3 ? "bg-gold-light/50" : "bg-muted/30"
                  }`}
                >
                  <div className="w-8 flex justify-center">{getRankIcon(i)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      {entry.display_name || `Gardener #${entry.user_id.slice(0, 6)}`}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-accent-foreground">
                    {Math.floor(entry.balance).toLocaleString()} 🪙
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
