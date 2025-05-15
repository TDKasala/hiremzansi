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
          <span className="font-semibold mb-2 sm:mb-0 sm:mr-3">
            🎉 Launch Discount: 50% off Premium for the first 500 users!
          </span>
          <Link href="/pricing" className="bg-white text-green-700 px-4 py-1 rounded text-sm font-medium hover:bg-opacity-90 transition-colors">
            Upgrade Now
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
