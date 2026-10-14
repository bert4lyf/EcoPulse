"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [browserIsOnline, setBrowserIsOnline] = useState(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const isOnline = browserIsOnline && !isSimulatedOffline;

  useEffect(() => {
    const updateOnlineStatus = () => setBrowserIsOnline(navigator.onLine);
    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#111315]/95 shadow-lg shadow-black/20 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="inline-flex items-center gap-3 rounded-lg">
          <span className="flex size-10 items-center justify-center rounded-xl bg-red-700 text-white shadow-md shadow-red-950/50">
            <Activity aria-hidden="true" className="size-6" />
          </span>
          <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
            EcoPulse
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${
              isOnline
                ? "border-emerald-700 bg-emerald-950/70 text-emerald-300"
                : "border-red-700 bg-red-950/70 text-red-200"
            }`}
          >
            {isOnline ? (
              <Wifi aria-hidden="true" className="size-4" />
            ) : (
              <WifiOff aria-hidden="true" className="size-4" />
            )}
            {isOnline ? "Online" : "Offline"}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            aria-pressed={isSimulatedOffline}
            onClick={() => setIsSimulatedOffline((current) => !current)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-bold transition-colors sm:px-4 ${
              isSimulatedOffline
                ? "border-amber-500 bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "border-slate-600 bg-slate-800 text-slate-100 hover:border-amber-400 hover:text-amber-200"
            }`}
          >
            {isSimulatedOffline ? "Clear simulation" : "Simulate offline"}
          </motion.button>
        </div>
      </nav>
      <p className="mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-slate-500 sm:px-6 lg:px-8">
        The button changes this indicator only; use DevTools to test real offline
        behavior.
      </p>
    </header>
  );
}
