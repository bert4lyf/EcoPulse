"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function Navbar() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b-2 border-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              EP
            </div>
            <h1 className="text-2xl font-bold text-white">EcoPulse</h1>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900 border border-green-500 rounded-lg">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-900 border border-red-600 rounded-lg animate-pulse">
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-red-300">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
