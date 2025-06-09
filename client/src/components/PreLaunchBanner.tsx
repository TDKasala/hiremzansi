import { Link } from "wouter";
import { useState } from "react";
import { X, Sparkles, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function PreLaunchBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-gradient-x"></div>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-2 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
      </div>

      <div className="relative bg-black/10 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            
            {/* Left section - Discount info */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="flex items-center justify-center w-10 h-10 bg-yellow-400 rounded-full"
              >
                <Sparkles className="w-5 h-5 text-purple-600" />
              </motion.div>
              
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-yellow-400 text-purple-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
                    Limited Time
                  </span>
                  <span className="text-yellow-300 text-sm font-medium">Launch Special</span>
                </div>
                <div className="text-white font-bold text-lg">
                  <span className="text-yellow-300">50% OFF</span> Premium Plans
                </div>
              </div>
            </div>

            {/* Center section - Social proof */}
            <div className="hidden md:flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>First 500 users only</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Expires soon</span>
              </div>
            </div>

            {/* Right section - CTA */}
            <Link href="/pricing">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-800 px-6 py-3 rounded-full font-bold text-sm shadow-lg overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Claim Your Discount
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    →
                  </motion.span>
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </motion.button>
            </Link>
          </div>

          {/* Mobile social proof */}
          <div className="md:hidden flex items-center justify-center gap-4 mt-3 text-white/80 text-xs">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>First 500 users</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Limited time</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
