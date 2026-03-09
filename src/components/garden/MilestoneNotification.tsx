import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";

interface MilestoneNotificationProps {
  balance: number;
  show: boolean;
  onDismiss: () => void;
}

const MILESTONES = [1000, 5000, 10000, 50000, 100000, 250000, 500000];

export const getNextMilestone = (balance: number) => MILESTONES.find((m) => m > balance) || 500000;

export const checkMilestoneReached = (prevBalance: number, newBalance: number) =>
  MILESTONES.find((m) => prevBalance < m && newBalance >= m);

const MilestoneNotification = ({ balance, show, onDismiss }: MilestoneNotificationProps) => {
  const is500k = balance >= 500000;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-4 left-4 right-4 z-[60] flex justify-center"
        >
          <div className={`glass-card !p-4 max-w-md w-full flex items-center gap-3 ${is500k ? "!border-accent" : ""}`}>
            <div className="text-3xl">{is500k ? "🎁" : "🏆"}</div>
            <div className="flex-1">
              <p className="font-display font-bold text-foreground text-sm">
                {is500k
                  ? "🎉 500,000 WYN-KOIN Milestone Reached!"
                  : `Milestone: ${balance.toLocaleString()} WYN-KOINs!`}
              </p>
              <p className="text-xs text-muted-foreground">
                {is500k
                  ? "You're eligible for a surprise gift from The Flower Garden! We'll be in touch 💝"
                  : "Keep growing — amazing things await! 🌸"}
              </p>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneNotification;
