import { Link } from "wouter";
import { useState } from "react";
import { X } from "lucide-react";

export default function PreLaunchBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-green-600 text-white py-3">
      <div className="container mx-auto px-4 text-center relative">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <span className="font-semibold mb-2 sm:mb-0 sm:mr-3 relative group">
            <span className="inline-block animate-bounce-subtle mr-1">🎉</span>
            <span className="relative inline-block">
              Launch Discount: 
              <span className="text-amber-300 ml-1 font-bold relative">
                50% off Premium
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-amber-300 animate-pulse-width"></span>
              </span>
              <span className="ml-1">for the first 500 users!</span>
              <span className="absolute -inset-1 bg-white/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </span>
          </span>
          <Link 
            href="/pricing" 
            className="relative bg-amber-400 text-green-800 px-5 py-1.5 rounded-md text-sm font-bold 
                     shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300
                     before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
                     before:via-white/30 before:to-transparent before:animate-shine"
          >
            <span className="inline-flex items-center">
              Upgrade Now
              <span className="ml-1 inline-block animate-bounce-subtle">→</span>
            </span>
          </Link>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
