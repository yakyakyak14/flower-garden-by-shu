import { useEffect, useRef } from "react";
import { getNextMilestone } from "@/components/garden/MilestoneNotification";

const PROXIMITY_THRESHOLDS = [0.9, 0.95, 0.99]; // 90%, 95%, 99% of next milestone

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const sendMilestoneProximityNotification = (balance: number, nextMilestone: number) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const percentage = Math.round((balance / nextMilestone) * 100);

  new Notification("🌸 The Flower Garden", {
    body: `You're ${percentage}% of the way to ${nextMilestone.toLocaleString()} WYN-KOINs! Keep growing! 🌟`,
    icon: "/favicon.ico",
    tag: `milestone-proximity-${nextMilestone}`,
  });
};

export const useMilestoneNotifications = (balance: number, enabled: boolean) => {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || balance <= 0) return;

    const nextMilestone = getNextMilestone(balance);
    
    for (const threshold of PROXIMITY_THRESHOLDS) {
      const thresholdValue = nextMilestone * threshold;
      const key = `${nextMilestone}-${threshold}`;
      
      if (balance >= thresholdValue && !notifiedRef.current.has(key)) {
        notifiedRef.current.add(key);
        sendMilestoneProximityNotification(balance, nextMilestone);
        break; // Only send one notification per balance update
      }
    }
  }, [balance, enabled]);
};
