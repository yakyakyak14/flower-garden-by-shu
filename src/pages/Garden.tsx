import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SessionSetup from "@/components/garden/SessionSetup";
import GardenCanvas from "@/components/garden/GardenCanvas";
import MusicSidebar from "@/components/garden/MusicSidebar";
import CelebrationOverlay from "@/components/garden/CelebrationOverlay";
import MysteryBox from "@/components/garden/MysteryBox";
import GardenHeader from "@/components/garden/GardenHeader";
import MilestoneNotification, { checkMilestoneReached } from "@/components/garden/MilestoneNotification";
import { FlowerType, PlacedFlower, calculateWynKoins } from "@/lib/flowers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sendMilestoneProximityNotification } from "@/hooks/useMilestoneNotifications";
import { getNextMilestone } from "@/components/garden/MilestoneNotification";
import { useStreak } from "@/hooks/useStreak";
import { getNewAchievements, type Achievement } from "@/lib/achievements";
import AchievementToast from "@/components/garden/AchievementToast";
import { captureGardenScreenshot } from "@/lib/garden-capture";
import { createGardenRecorder, type GardenRecorder } from "@/lib/garden-recorder";
import { DEFAULT_SPOTIFY_TYPE, DEFAULT_SPOTIFY_ID, spotifyEmbedUrl } from "@/lib/music-presets";

type Phase = "setup" | "growing" | "celebrating" | "timelapse" | "mystery";

const Garden = () => {
  const { user } = useAuth();
  const { streak, updateStreak } = useStreak(user?.id);
  const [phase, setPhase] = useState<Phase>("setup");
  const [flowerType, setFlowerType] = useState<FlowerType | null>(null);
  const [targetCount, setTargetCount] = useState(100);
  const [placedFlowers, setPlacedFlowers] = useState<PlacedFlower[]>([]);
  const [musicSidebarOpen, setMusicSidebarOpen] = useState(false);
  const [currentMusicChoice, setCurrentMusicChoice] = useState("Peaceful Piano");
  const [activeEmbedUrl, setActiveEmbedUrl] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState("");
  const [milestoneShow, setMilestoneShow] = useState(false);
  const [milestoneBalance, setMilestoneBalance] = useState(0);
  const [streakBonus, setStreakBonus] = useState(1.0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [timelapseBlob, setTimelapseBlob] = useState<Blob | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [defaultMusicPlaying, setDefaultMusicPlaying] = useState(false);
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const gardenCanvasRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<GardenRecorder | null>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentCount = placedFlowers.length;
  const remaining = targetCount - currentCount;
  const isNearEnd = remaining <= 20 && remaining > 0;
  const wynKoins = calculateWynKoins(targetCount);

  const handleStartSession = (flower: FlowerType, count: number) => {
    setFlowerType(flower);
    setTargetCount(count);
    setPlacedFlowers([]);
    setSessionStartTime(Date.now());
    setTimelapseBlob(null);
    setFinalImageUrl(null);
    setDefaultMusicPlaying(true);
    setPhase("growing");
  };

  // Start frame capture when growing phase begins
  useEffect(() => {
    if (phase === "growing" && gardenCanvasRef.current) {
      const recorder = createGardenRecorder(gardenCanvasRef.current, 7);
      recorderRef.current = recorder;
      // Capture a frame every 300ms
      captureIntervalRef.current = setInterval(() => {
        recorder.captureFrame();
        setFrameCount(recorder.getFrames().length);
      }, 300);
      // Capture initial empty frame
      recorder.captureFrame();
    }
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [phase]);

  const handleFlowerClick = useCallback((x: number, y: number) => {
    if (!flowerType || currentCount >= targetCount) return;

    const newFlower: PlacedFlower = {
      id: currentCount + 1,
      x,
      y,
      type: flowerType,
      scale: 0.7 + Math.random() * 0.6,
      rotation: Math.random() * 40 - 20,
    };

    setPlacedFlowers(prev => {
      const updated = [...prev, newFlower];
      if (updated.length >= targetCount) {
        setTimeout(() => handleComplete(), 500);
      }
      return updated;
    });
  }, [flowerType, currentCount, targetCount]);

  const handleComplete = async () => {
    // Stop recording and capture final frame
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.captureFrame(); // final frame
      recorderRef.current.stop();
    }

    // Capture final garden image
    if (gardenCanvasRef.current && flowerType) {
      // Create final image data URL for download
      const canvas = document.createElement("canvas");
      const rect = gardenCanvasRef.current.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
        gradient.addColorStop(0, "hsl(140, 30%, 90%)");
        gradient.addColorStop(1, "hsl(140, 25%, 85%)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);
        const grassGrad = ctx.createLinearGradient(0, rect.height * 0.7, 0, rect.height);
        grassGrad.addColorStop(0, "transparent");
        grassGrad.addColorStop(1, "hsl(120, 30%, 40%)");
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, rect.height * 0.7, rect.width, rect.height * 0.3);
        ctx.globalAlpha = 1;
        const flowers = gardenCanvasRef.current.querySelectorAll("[data-flower]");
        flowers.forEach((el) => {
          const fr = el.getBoundingClientRect();
          const x = fr.left - rect.left + fr.width / 2;
          const y = fr.top - rect.top + fr.height / 2;
          const size = Math.max(fr.width, fr.height) / 2;
          for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.3, size * 0.35, size * 0.2, angle, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${330 + i * 8}, 70%, 70%)`;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(x, y, size * 0.15, 0, 2 * Math.PI);
          ctx.fillStyle = "#ffd700";
          ctx.fill();
        });
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText("🌸 The Flower Garden", rect.width - 10, rect.height - 10);
        setFinalImageUrl(canvas.toDataURL("image/png"));
      }

      // Also upload to storage if authenticated
      if (user) {
        captureGardenScreenshot(gardenCanvasRef.current, user.id, flowerType.id, targetCount).catch(() => {});
      }
    }

    setPhase("celebrating");

    try {
      celebrationAudioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
      celebrationAudioRef.current.volume = 0.5;
      celebrationAudioRef.current.play().catch(() => {});
    } catch {}

    if (user) {
      try {
        // Update daily streak and get bonus multiplier
        const bonus = await updateStreak(user.id);
        setStreakBonus(bonus);
        const totalKoins = Math.round(wynKoins * bonus);

        await supabase.from("garden_sessions").insert({
          user_id: user.id,
          flower_type: flowerType?.id || "",
          target_count: targetCount,
          current_count: targetCount,
          completed: true,
          wyn_koins_earned: totalKoins,
          music_choice: currentMusicChoice,
          completed_at: new Date().toISOString(),
        } as any);

        const { data: existing } = await supabase
          .from("wyn_koins")
          .select("balance")
          .eq("user_id", user.id)
          .single();

        if (existing) {
          const prevBalance = existing.balance as number;
          const newBalance = prevBalance + totalKoins;
          await supabase
            .from("wyn_koins")
            .update({ balance: newBalance } as any)
            .eq("user_id", user.id);

          const milestone = checkMilestoneReached(prevBalance, newBalance);
          if (milestone) {
            setMilestoneBalance(newBalance);
            setMilestoneShow(true);
          }

          if ("Notification" in window && Notification.permission === "granted") {
            const nextMs = getNextMilestone(newBalance);
            if (newBalance >= nextMs * 0.9) {
              sendMilestoneProximityNotification(newBalance, nextMs);
            }
          }
        }

        const bonusText = bonus > 1 ? ` (${Math.round((bonus - 1) * 100)}% streak bonus!)` : "";
        toast.success(`You earned ${totalKoins} WYN-KOIN(s)!${bonusText} 🌟`);

        // Check achievements
        const { data: allSessions } = await supabase
          .from("garden_sessions")
          .select("flower_type, target_count")
          .eq("user_id", user.id)
          .eq("completed", true);

        const totalSessions = allSessions?.length || 0;
        const totalFlowers = allSessions?.reduce((sum: number, s: any) => sum + (s.target_count || 0), 0) || 0;
        const uniqueFlowerTypes = [...new Set(allSessions?.map((s: any) => s.flower_type) || [])];
        const { data: streakData } = await supabase
          .from("daily_streaks")
          .select("current_streak")
          .eq("user_id", user.id)
          .single();

        const { data: balData } = await supabase
          .from("wyn_koins")
          .select("balance")
          .eq("user_id", user.id)
          .single();

        const unlocked = await getNewAchievements({
          userId: user.id,
          totalSessions,
          currentStreak: (streakData as any)?.current_streak || 0,
          totalFlowers,
          balance: (balData as any)?.balance || 0,
          uniqueFlowerTypes,
          sessionFlowerCount: targetCount,
          sessionDurationMs: Date.now() - sessionStartTime,
        });

        if (unlocked.length > 0) {
          setNewAchievements(unlocked);
        }
      } catch (err) {
        console.error("Error saving session:", err);
      }
    }

    fetchPersonalMessage();

    // Generate timelapse video in background
    if (recorderRef.current) {
      recorderRef.current.generateTimelapse().then((blob) => {
        setTimelapseBlob(blob);
      });
    }

    setTimeout(() => {
      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.pause();
      }
      setPhase("timelapse");
    }, 3000);
  };

  const handleTimelapseEnd = () => {
    setPhase("mystery");
  };

  const fetchPersonalMessage = async () => {
    try {
      const { data: profile } = user
        ? await supabase.from("profiles").select("description").eq("user_id", user.id).single()
        : { data: null };

      const response = await supabase.functions.invoke("generate-message", {
        body: {
          userDescription: profile?.description || "",
          flowerType: flowerType?.name || "",
          musicChoice: currentMusicChoice,
          isAuthenticated: !!user,
        },
      });

      if (response.data?.message) {
        setPersonalMessage(response.data.message);
      } else {
        setPersonalMessage(getRandomMessage());
      }
    } catch {
      setPersonalMessage(getRandomMessage());
    }
  };

  const getRandomMessage = () => {
    const messages = [
      "You are blooming beautifully, just like the flowers you've grown today. 🌸",
      "Every flower you planted is a reminder that you are capable of creating beauty in this world. 🌺",
      "Just as these flowers needed your gentle touch to grow, remember to be gentle with yourself too. 💐",
      "Your garden is a reflection of your inner peace. Keep nurturing it. 🌻",
      "Like each petal unfolding, you are becoming more beautiful with each passing day. 🌹",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleReset = () => {
    setPhase("setup");
    setPlacedFlowers([]);
    setFlowerType(null);
    setPersonalMessage("");
    setTimelapseBlob(null);
    setFinalImageUrl(null);
    recorderRef.current = null;
  };

  return (
    <div className="garden-surface min-h-screen relative overflow-hidden">
      <GardenHeader
        user={user}
        onMusicToggle={() => setMusicSidebarOpen(!musicSidebarOpen)}
        showMusic={true}
      />

      <MilestoneNotification
        balance={milestoneBalance}
        show={milestoneShow}
        onDismiss={() => setMilestoneShow(false)}
      />

      <AchievementToast
        achievements={newAchievements}
        onDismiss={() => setNewAchievements([])}
      />

      {phase === "setup" && (
        <SessionSetup onStart={handleStartSession} isAuthenticated={!!user} />
      )}

      {phase === "growing" && flowerType && (
        <GardenCanvas
          flowerType={flowerType}
          placedFlowers={placedFlowers}
          targetCount={targetCount}
          onFlowerClick={handleFlowerClick}
          isNearEnd={isNearEnd}
          canvasRef={gardenCanvasRef}
          frameCount={frameCount}
        />
      )}

      {(phase === "celebrating" || phase === "timelapse") && (
        <CelebrationOverlay
          wynKoins={wynKoins}
          targetCount={targetCount}
          flowerType={flowerType}
          showMysteryBox={false}
          showTimelapse={phase === "timelapse"}
          onTimelapseEnd={handleTimelapseEnd}
          isAuthenticated={!!user}
          timelapseBlob={timelapseBlob}
          finalImageUrl={finalImageUrl}
        />
      )}

      {phase === "mystery" && (
        <MysteryBox
          message={personalMessage}
          wynKoins={user ? wynKoins : 0}
          isAuthenticated={!!user}
          onClose={handleReset}
        />
      )}

      {/* Mini Spotify Player Bar */}
      {phase === "growing" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                🎵 Now Playing: {currentMusicChoice || "Peaceful Piano"}
              </span>
              <button
                onClick={() => setMusicSidebarOpen(true)}
                className="ml-auto text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Change
              </button>
            </div>
            <div className="mt-1 rounded-lg overflow-hidden">
              <iframe
                src={activeEmbedUrl || spotifyEmbedUrl(DEFAULT_SPOTIFY_TYPE, DEFAULT_SPOTIFY_ID)}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="border-0"
              />
            </div>
          </div>
        </div>
      )}

      <MusicSidebar
        isOpen={musicSidebarOpen}
        onClose={() => setMusicSidebarOpen(false)}
        onMusicSelect={(choice, embedUrl) => {
          setCurrentMusicChoice(choice);
          setActiveEmbedUrl(embedUrl);
          setDefaultMusicPlaying(false);
        }}
      />
    </div>
  );
};

export default Garden;
