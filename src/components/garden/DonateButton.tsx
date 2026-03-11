import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AMOUNTS = [
  { label: "₦5,000", value: 500000 },
  { label: "₦10,000", value: 1000000 },
  { label: "₦20,000", value: 2000000 },
  { label: "₦50,000", value: 5000000 },
  { label: "₦100,000", value: 10000000 },
  { label: "₦200,000", value: 20000000 },
  { label: "₦500,000", value: 50000000 },
  { label: "₦1,000,000", value: 100000000 },
];

const DonateButton = () => {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ribbonVisible, setRibbonVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setRibbonVisible(false), 8000);
    const interval = setInterval(() => {
      setRibbonVisible(true);
      setTimeout(() => setRibbonVisible(false), 8000);
    }, 30000);
    return () => {
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  const getAmountInKobo = (): number => {
    if (selectedAmount) return selectedAmount;
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed >= 100) return Math.round(parsed * 100);
    return 0;
  };

  const handleDonate = async () => {
    const amountKobo = getAmountInKobo();
    if (amountKobo < 10000) {
      toast.error("Minimum donation is ₦100");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: { amount: amountKobo, email: email || undefined, anonymous },
      });

      if (error) throw error;
      if (data?.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error("No authorization URL received");
      }
    } catch (err: any) {
      console.error("Donation error:", err);
      toast.error("Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-20 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {ribbonVisible && !open && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="bg-card border border-border rounded-2xl px-4 py-3 shadow-lg max-w-[240px] text-center"
            >
              <p className="text-xs text-foreground font-medium leading-relaxed">
                Please donate to help keep the server running
                <span className="inline-block ml-1 animate-bounce">💐</span>
                <span className="inline-block animate-pulse">🌺</span>
                <span
                  className="inline-block ml-0.5 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  🌸
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full text-primary-foreground shadow-xl flex items-center justify-center relative"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <Gift className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground shadow-md">
            🎀
          </span>
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <h2 className="text-lg font-display font-bold text-foreground">Support</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-5">
                Your donation helps keep things running smoothly. 🌸
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {AMOUNTS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => {
                      setSelectedAmount(a.value);
                      setCustomAmount("");
                    }}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      selectedAmount === a.value
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : "bg-muted/50 text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Custom Amount (₦)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount e.g. 15000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  min={100}
                  className="rounded-xl"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email{" "}
                  <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked === true)}
                />
                <label htmlFor="anonymous" className="text-sm text-foreground cursor-pointer">
                  Donate anonymously
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDonate}
                disabled={loading || getAmountInKobo() < 10000}
                className="w-full py-3 rounded-2xl font-display font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Donate Now
                  </>
                )}
              </motion.button>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Secure payment powered by Paystack
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DonateButton;
