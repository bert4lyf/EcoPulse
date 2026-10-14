"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineToggle() {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);

    if (!isOfflineMode) {
      navigator.serviceWorker?.controller?.postMessage({
        type: "SKIP_WAITING",
      });
      console.log(
        "📵 Offline mode simulated. Disable via DevTools or toggle this button."
      );
    } else {
      console.log("📡 Online mode restored.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <motion.button
        onClick={toggleOfflineMode}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-xl transition-all ${
          isOfflineMode
            ? "bg-red-600 hover:bg-red-700 text-white border-2 border-red-400 animate-pulse"
            : "bg-green-600 hover:bg-green-700 text-white border-2 border-green-400"
        }`}
      >
        {isOfflineMode ? (
          <>
            <WifiOff className="w-5 h-5" />
            Offline Mode
          </>
        ) : (
          <>
            <Wifi className="w-5 h-5" />
            Online Mode
          </>
        )}
      </motion.button>
      <div className="text-xs text-gray-400 text-center mt-2 max-w-32">
        Toggle to test offline caching
      </div>
    </div>
  );
}
