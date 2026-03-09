import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Coins, Flower2, History, Trophy, ArrowLeft, Bell, BellOff, Flame, Zap, Award, Image } from "lucide-react";
import { FLOWER_TYPES } from "@/lib/flowers";
import { requestNotificationPermission, useMilestoneNotifications } from "@/hooks/useMilestoneNotifications";
import { getNextMilestone } from "@/components/garden/MilestoneNotification";
import { toast } from "sonner";
import { useStreak, getStreakBonus } from "@/hooks/useStreak";

interface SessionRecord {
  id: string;
  flower_type: string;
  target_count: number;
  wyn_koins_earned: number;
  completed_at: string;
  music_choice: string | null;
}

const MILESTONE = 500000;

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [totalFlowers, setTotalFlowers] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => "Notification" in window && Notification.permission === "granted"
  );

  useMilestoneNotifications(balance, notificationsEnabled);
  const { streak } = useStreak(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, loading]);

  const fetchData = async () => {
    if (!user) return;

    const [balanceRes, sessionsRes] = await Promise.all([
      supabase.from("wyn_koins").select("balance").eq("user_id", user.id).single(),
      supabase.from("garden_sessions").select("*").eq("user_id", user.id).eq("completed", true).order("completed_at", { ascending: false }).limit(50),
    ]);

    if (balanceRes.data) setBalance(balanceRes.data.balance as number);
    if (sessionsRes.data) {
      setSessions(sessionsRes.data as any);
      setTotalFlowers(sessionsRes.data.reduce((sum: number, s: any) => sum + (s.target_count || 0), 0));
    }
  };

  const milestoneProgress = Math.min((balance / MILESTONE) * 100, 100);
  const nextMilestone = getNextMilestone(balance);
  const nextMilestoneProgress = Math.min((balance / nextMilestone) * 100, 100);
  const getFlowerEmoji = (type: string) => FLOWER_TYPES.find(f => f.id === type)?.emoji || "🌸";
  const getFlowerName = (type: string) => FLOWER_TYPES.find(f => f.id === type)?.name || type;

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast.info("Milestone notifications disabled");
    } else {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        toast.success("Milestone notifications enabled! 🔔");
      } else {
        toast.error("Notification permission denied. Please enable in browser settings.");
      }
    }
  };

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
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate("/garden")} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-3xl font-display font-bold text-foreground">My Garden</h1>
          <button onClick={() => navigate("/gallery")} className="ml-auto p-2 rounded-full hover:bg-muted transition-colors" title="Gallery">
            <Image className="w-5 h-5 text-primary" />
          </button>
          <button onClick={() => navigate("/achievements")} className="p-2 rounded-full hover:bg-muted transition-colors" title="Achievements">
            <Award className="w-5 h-5 text-accent" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center">
            <Coins className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{Math.floor(balance).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-semibold">WYN-KOINs</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card text-center">
            <Flower2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{totalFlowers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground font-semibold">Total Flowers</div>
          </motion.div>
        </div>

        {/* Streak Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-destructive" />
            <h3 className="font-display font-semibold text-foreground">Daily Streak</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">{streak.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{streak.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Longest</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-foreground">{streak.bonusMultiplier}x</span>
              </div>
              <div className="text-xs text-muted-foreground">Bonus</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground text-center">
            {streak.currentStreak >= 30
              ? "🔥 Max bonus! 2x WYN-KOINs on every session!"
              : streak.currentStreak >= 7
                ? "Great streak! Keep it going for higher bonuses! 🌟"
                : "Garden daily to build your streak and earn bonus WYN-KOINs! 🌱"}
          </div>
        </motion.div>

        {/* 500K Milestone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="font-display font-semibold text-foreground">500,000 WYN-KOIN Milestone</h3>
            </div>
            <button
              onClick={toggleNotifications}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title={notificationsEnabled ? "Disable milestone alerts" : "Enable milestone alerts"}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Reach 500,000 WYN-KOINs to receive a beautiful surprise gift from us! 🎁
          </p>

          {/* Next milestone indicator */}
          {nextMilestone < MILESTONE && (
            <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Next: {nextMilestone.toLocaleString()} WYN-KOINs</span>
                <span>{nextMilestoneProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${nextMilestoneProgress}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          )}
          <div className="h-4 rounded-full bg-muted overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--gradient-celebration)" }}
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{balance.toLocaleString()} / {MILESTONE.toLocaleString()}</span>
            <span>{milestoneProgress.toFixed(2)}%</span>
          </div>
        </motion.div>

        {/* Session History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Session History</h3>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-muted-foreground text-sm">No sessions yet. Start growing!</p>
              <button onClick={() => navigate("/garden")} className="btn-garden mt-4 text-sm">
                Start a Session
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <span className="text-2xl">{getFlowerEmoji(session.flower_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">
                      {session.target_count} {getFlowerName(session.flower_type)}s
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.completed_at
                        ? new Date(session.completed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold-light">
                    <Coins className="w-3 h-3 text-accent" />
                    <span className="text-xs font-bold text-accent-foreground">+{session.wyn_koins_earned}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
