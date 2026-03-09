import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Music, LogOut, LogIn, Home, Coins, Trophy, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface GardenHeaderProps {
  user: User | null;
  onMusicToggle: () => void;
  showMusic: boolean;
}

const GardenHeader = ({ user, onMusicToggle, showMusic }: GardenHeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (user) {
      supabase
        .from("wyn_koins")
        .select("balance")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setBalance(data.balance as number);
        });
    }
  }, [user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-2 sm:px-4 py-2 sm:py-3">
      <div className="glass-card !p-2 sm:!p-3 flex items-center justify-between max-w-4xl mx-auto">
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <span className="text-xl sm:text-2xl">🌸</span>
          <span className="font-display font-bold text-foreground hidden sm:inline text-sm">The Flower Garden</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {user && (
            <Link to="/dashboard" className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gold-light hover:opacity-80 transition-opacity">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              <span className="text-xs sm:text-sm font-bold text-accent-foreground">{Math.floor(balance).toLocaleString()}</span>
            </Link>
          )}

          {user && (
            <Link to="/profile" className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors">
              <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </Link>
          )}

          <Link to="/leaderboard" className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </Link>

          {showMusic && (
            <button onClick={onMusicToggle} className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </button>
          )}

          <Link to="/" className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </Link>

          {user ? (
            <button
              onClick={async () => { await signOut(); navigate("/"); }}
              className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>
          ) : (
            <Link to="/auth" className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors">
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default GardenHeader;
