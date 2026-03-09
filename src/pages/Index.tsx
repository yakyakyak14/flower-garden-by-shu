import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-garden.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { Flower2, Sparkles, UserPlus } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="garden-surface">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Beautiful flower garden" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, hsl(30 50% 98% / 0.6), hsl(30 50% 98% / 0.9))" }} />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6 max-w-3xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-light mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Your peaceful sanctuary</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            The Flower
            <span className="block text-primary">Garden</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 font-body leading-relaxed max-w-xl mx-auto">
            Tap to grow beautiful flowers, listen to calming music, and discover personalized messages just for you. Earn <span className="font-bold text-accent">WYN-KOINs</span> as you bloom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/garden")}
              className="btn-garden text-lg"
            >
              <Flower2 className="w-5 h-5 mr-2" />
              Start Growing
            </button>

            {!user && (
              <button
                onClick={() => navigate("/auth")}
                className="btn-outline-garden text-lg"
              >
              <UserPlus className="w-5 h-5 mr-2" />
                Sign Up for Rewards
              </button>
            )}
          </div>

          {!user && (
            <p className="mt-4 text-sm text-muted-foreground">
              No account needed to start! Sign up to unlock music & earn WYN-KOINs ✨
            </p>
          )}
        </motion.div>

        {/* Floating flowers decoration */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 text-5xl opacity-60"
        >🌸</motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 right-16 text-4xl opacity-50"
        >🌷</motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-40 right-20 text-3xl opacity-40"
        >🌹</motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: "🌺", title: "Grow Flowers", desc: "Choose from 8 beautiful flower types and tap to watch them bloom in your garden" },
            { icon: "🎵", title: "Calming Music", desc: "Listen to relaxing music, nature sounds, or inspirational audiobooks while you grow" },
            { icon: "✨", title: "Earn WYN-KOINs", desc: "Complete flower sessions to earn WYN-KOINs and unlock mystery messages" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
