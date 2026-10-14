"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl justify-end px-4 pt-3 sm:px-6 lg:px-8">
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
          isOnline
            ? "border-emerald-700 bg-emerald-950 text-emerald-300"
            : "border-red-700 bg-red-950 text-red-200"
        }`}
      >
        {isOnline ? (
          <Wifi aria-hidden="true" className="size-4" />
        ) : (
          <span className="relative flex size-4 items-center justify-center">
            <WifiOff aria-hidden="true" className="size-4" />
            <span className="absolute -right-1 -top-1 size-2 animate-ping rounded-full bg-red-400" />
            <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-400" />
          </span>
        )}
        {isOnline ? "Online" : "Offline"}
      </div>
    </div>
  );
}
